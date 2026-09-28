import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { NotesService } from '../application/notes'
import { backupFilename, exportBackup, parseBackup, restoreBackup, type BackupFile } from '../application/backup'
import type { NoteBlock, Section } from '../domain/model'
import { IndexedDbRepository, openDatabase } from '../persistence/database'
import { requestStorageStatus } from '../infrastructure/storage'

type View = 'flow' | 'actions' | 'important' | 'search' | 'data'
const dateLabel = (value: string) => new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const meetingLocal = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const message = (error: unknown) => error instanceof Error ? error.message : 'Ett oväntat fel inträffade.'

export function App() {
  const [repo, setRepo] = useState<IndexedDbRepository | null>(null)
  const [view, setView] = useState<View>('flow')
  const [notes, setNotes] = useState<NoteBlock[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<'open' | 'completed'>('open')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sectionForm, setSectionForm] = useState<'standard' | 'meeting' | null>(null)
  const [sectionTitle, setSectionTitle] = useState('')
  const [meetingTime, setMeetingTime] = useState(meetingLocal)
  const [participants, setParticipants] = useState('')
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null)
  const [storageInfo, setStorageInfo] = useState('')
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const service = repo ? new NotesService(repo) : null
  const active = sections.find(s => !s.endedAt)

  const refresh = useCallback(async (database: IndexedDbRepository, limit = 50) => {
    const [loaded, allSections] = await Promise.all([database.listNotes(limit + 1), database.listSections()])
    setNotes(loaded.slice(0, limit)); setHasMore(loaded.length > limit)
    setSections(allSections.sort((a, b) => b.startedAt.localeCompare(a.startedAt)))
  }, [])
  useEffect(() => {
    let open = true, database: IndexedDbRepository | null = null
    openDatabase().then(db => {
      database = new IndexedDbRepository(db)
      if (!open) { database.close(); return }
      setRepo(database); return refresh(database)
    }).catch(e => setError(message(e)))
    const onUpdate = () => setUpdateAvailable(true)
    window.addEventListener('simple-notes-update-available', onUpdate)
    return () => { open = false; database?.close(); window.removeEventListener('simple-notes-update-available', onUpdate) }
  }, [refresh])
  const run = async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
    if (!repo) return false
    setError(''); setNotice('')
    try { await action(); await refresh(repo, Math.max(50, notes.length)); if (success) setNotice(success); return true }
    catch (e) { setError(message(e)); return false }
  }
  const submitNote = (event: FormEvent) => { event.preventDefault(); if (!service || !draft.trim()) return; void run(async () => { await service.create(draft); setDraft('') }, 'Anteckningen är sparad.') }
  const start = (event: FormEvent) => {
    event.preventDefault(); if (!service || !sectionForm) return
    void run(async () => {
      const time = sectionForm === 'meeting' ? new Date(meetingTime).toISOString() : null
      await service.start(sectionTitle, sectionForm, time, participants.split(',').map(x => x.trim()).filter(Boolean))
      setSectionForm(null); setSectionTitle(''); setParticipants('')
    }, 'Sektionen har startat.')
  }
  const loadMore = async () => {
    if (!repo || !notes.length) return
    try {
      const older = await repo.listNotes(51, notes[notes.length - 1])
      setNotes(current => [...current, ...older.slice(0, 50)])
      setHasMore(older.length > 50)
    } catch(e) { setError(message(e)) }
  }
  const navigateTo = async (id: string) => {
    if (!repo) return
    try {
      const target = await repo.getNote(id)
      if (!target) throw new Error('Anteckningen finns inte längre.')
      const recent = await repo.listNotes()
      const index = recent.findIndex(n => n.id === id)
      if (index < 0) throw new Error('Anteckningen kunde inte hittas i flödet.')
      setNotes(recent.slice(0, Math.max(50, index + 20))); setHasMore(index + 20 < recent.length)
      setView('flow'); setFocusId(id)
      window.setTimeout(() => document.getElementById(`note-${id}`)?.scrollIntoView({behavior:'smooth',block:'center'}), 50)
    } catch(e) { setError(message(e)) }
  }
  const sectionMap = new Map(sections.map(s => [s.id, s]))
  // Special views query the full local collection independently of the paginated flow.
  const [specialNotes, setSpecialNotes] = useState<NoteBlock[]>([])
  useEffect(() => {
    if (!repo || view === 'flow' || view === 'data') return
    let valid = true
    repo.snapshot().then(data => { if (valid) setSpecialNotes(data.notes.sort((a,b) => b.createdAt.localeCompare(a.createdAt))) }).catch(e => setError(message(e)))
    return () => { valid = false }
  }, [repo, view, notes])
  const list = view === 'flow' ? notes : specialNotes.filter(n => view === 'actions' ? n.actionStatus === actionFilter : view === 'important' ? n.important : view === 'search' ? !!query.trim() && [n.text,n.actionResolution ?? '',sectionMap.get(n.sectionId ?? '')?.title ?? '',...(sectionMap.get(n.sectionId ?? '')?.participants ?? [])].some(x => x.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) : false)
  const sectionResults = view === 'search' && query.trim() ? sections.filter(s => [s.title, ...s.participants].some(x => x.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))) : []

  const download = async () => {
    if (!repo) return
    try {
      const blob = new Blob([await exportBackup(repo)], {type:'application/json'})
      const url = URL.createObjectURL(blob), a = document.createElement('a')
      a.href = url; a.download = backupFilename(); a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Backupfilen har skapats. Spara den på en säker plats.')
    } catch(e) { setError(message(e)) }
  }
  const selectBackup = async (file: File | undefined) => {
    setPendingBackup(null); setError('')
    if (!file) return
    try { setPendingBackup(parseBackup(await file.text())) }
    catch(e) { setError(message(e)) }
  }
  const restore = () => {
    if (!repo || !pendingBackup) return
    void run(async () => {
      await restoreBackup(repo, pendingBackup, true)
      setPendingBackup(null); if (fileInput.current) fileInput.current.value = ''
    }, 'Återställningen lyckades. Alla anteckningar har lästs in.')
  }
  const checkStorage = async () => {
    try {
      const status = await requestStorageStatus(navigator.storage)
      if (!status.supported) { setStorageInfo('Webbläsaren visar ingen lagringsstatus. Gör regelbundna säkerhetskopior.'); return }
      const used = status.usageBytes ? `${(status.usageBytes / 1024 / 1024).toFixed(1)} MB används. ` : ''
      setStorageInfo(`${used}${status.persistent ? 'Beständig lagring har beviljats.' : 'Beständig lagring har inte beviljats.'} Säkerhetskopiera regelbundet.`)
    } catch { setStorageInfo('Lagringsstatus kunde inte läsas. Säkerhetskopiera regelbundet.') }
  }
  return <div className="app-shell">
    <header><div className="brand"><span className="brand-icon" aria-hidden="true">▤</span><div><h1>Simple Notes</h1><small>Din löpande anteckningsbok</small></div></div><nav aria-label="Huvudnavigation">
      {([['flow','Flöde'],['actions','Åtgärder'],['important','Viktigt'],['search','Sök'],['data','Data']] as const).map(([key,label]) => <button key={key} className={view === key ? 'selected' : ''} aria-current={view === key ? 'page' : undefined} onClick={() => { setView(key); setError(''); setNotice('') }}>{label}</button>)}
    </nav></header>
    {updateAvailable && <aside className="notice">En ny version finns. Slutför ditt arbete och ladda om sidan när det passar dig. <button onClick={() => location.reload()}>Ladda om</button></aside>}
    {error && <p role="alert" className="error">{error}</p>}{notice && <p role="status" className="notice">{notice}</p>}
    {!repo && !error && <p role="status">Öppnar dina lokala anteckningar…</p>}
    <div className="workspace"><main>
      {view === 'flow' && <>
        <section className="compose" aria-label="Ny anteckning"><div className="compose-heading"><h2>Ny anteckning</h2><time>{dateLabel(new Date().toISOString())}</time></div>
          {active && <p className="active-tag">I sektion: {active.title} {active.type === 'meeting' ? '· Möte' : ''}</p>}
          <form onSubmit={submitNote}><label className="sr-only" htmlFor="new-note">Skriv en anteckning</label><textarea id="new-note" placeholder="Vad vill du komma ihåg?" value={draft} onChange={e => setDraft(e.target.value)} rows={3}/><div className="compose-actions"><span>Varje sparad post är ett anteckningsblock.</span><button className="primary" disabled={!repo || !draft.trim()}>Spara anteckning</button></div></form>
        </section>
        <div className="section-toolbar">{active ? <><strong>Aktiv sektion: {active.title}</strong><button onClick={() => service && void run(() => service.close(active.id),'Sektionen är avslutad.')}>Avsluta sektion</button></> : <><button onClick={() => setSectionForm('standard')}>+ Ny sektion</button><button onClick={() => { setMeetingTime(meetingLocal()); setSectionForm('meeting') }}>+ Nytt möte</button></>}</div>
        {sectionForm && <form className="panel" onSubmit={start}><h3>{sectionForm === 'meeting' ? 'Starta möte' : 'Starta sektion'}</h3><label>Rubrik<input autoFocus required value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}/></label>{sectionForm === 'meeting' && <><label>Tid<input type="datetime-local" required value={meetingTime} onChange={e => setMeetingTime(e.target.value)}/></label><label>Deltagare, separerade med kommatecken<input value={participants} onChange={e => setParticipants(e.target.value)}/></label></>}<div className="row"><button className="primary">Starta</button><button type="button" onClick={() => setSectionForm(null)}>Avbryt</button></div></form>}
        <h2 className="list-heading">Anteckningsflöde</h2>
      </>}
      {view === 'actions' && <><h2>Åtgärder</h2><p>Åtgärder finns kvar i sitt ursprungliga sammanhang.</p><div className="row action-filter"><button aria-pressed={actionFilter === 'open'} onClick={() => setActionFilter('open')}>Öppna</button><button aria-pressed={actionFilter === 'completed'} onClick={() => setActionFilter('completed')}>Slutförda</button></div></>}
      {view === 'important' && <><h2>Viktigt</h2><p>Anteckningar du vill kunna hitta snabbt.</p></>}
      {view === 'search' && <><h2>Sök</h2><label className="sr-only" htmlFor="search">Sök i anteckningarna</label><input id="search" type="search" placeholder="Sök text, rubrik, deltagare eller lösning" value={query} onChange={e => setQuery(e.target.value)}/></>}
      {view === 'data' && <section className="panel"><h2>Data och säkerhetskopia</h2><p>Anteckningarna finns bara i den här webbläsarens lokala lagring. En nedladdad backupfil är din permanenta säkerhetskopia. Spara en kopia utanför enheten.</p><div className="row"><button className="primary" onClick={() => void download()} disabled={!repo}>Ladda ned backup</button><button onClick={() => void checkStorage()}>Kontrollera lagring</button></div>{storageInfo && <p role="status">{storageInfo}</p>}<hr/><h3>Återställ från fil</h3><p>Återställning ersätter alla anteckningar på den här enheten. Ladda ned en backup av aktuella data först.</p><label>Välj .snotes-fil<input ref={fileInput} type="file" accept=".snotes,application/json" onChange={e => void selectBackup(e.target.files?.[0])}/></label>{pendingBackup && <div className="restore-preview"><p>Backup från {dateLabel(pendingBackup.exportedAt)}. {pendingBackup.data.notes.length} anteckningar och {pendingBackup.data.sections.length} sektioner. Formatversion {pendingBackup.formatVersion}.</p><p><strong>Alla nuvarande anteckningar ersätts.</strong></p><div className="row"><button className="danger" onClick={restore}>Ja, ersätt alla data</button><button onClick={() => { setPendingBackup(null); if (fileInput.current) fileInput.current.value = '' }}>Avbryt</button></div></div>}</section>}
      {view === 'search' && sectionResults.length > 0 && <section className="section-results"><h3>Sektioner och möten</h3>{sectionResults.map(s => <div className="section-label" key={s.id}><span>{s.type === 'meeting' ? 'Möte' : 'Sektion'}</span><strong>{s.title}</strong>{s.participants.length > 0 && <small>{s.participants.join(', ')}</small>}</div>)}</section>}
      {view !== 'data' && <div className="note-list">{list.length === 0 && sectionResults.length === 0 && <p className="empty">{view === 'search' && !query.trim() ? 'Skriv något att söka efter.' : 'Inga anteckningar att visa ännu.'}</p>}{list.map((note, index) => {
        const section = note.sectionId ? sectionMap.get(note.sectionId) : null
        const previous = list[index + 1]
        const isSectionStart = view === 'flow' && section && (!previous || previous.sectionId !== section.id)
        return <div key={note.id}>{isSectionStart && <div className="section-label"><span>{section.type === 'meeting' ? 'Möte' : 'Sektion'}</span><strong>{section.title}</strong>{section.type === 'meeting' && <small>{section.meetingTime && dateLabel(section.meetingTime)}{section.participants.length > 0 && ` · ${section.participants.join(', ')}`}</small>}</div>}
          <NoteCard note={note} section={section ?? undefined} highlighted={focusId === note.id} onNavigate={view === 'flow' ? undefined : navigateTo} onEdit={text => service ? run(() => service.edit(note.id,text),'Ändringen är sparad.') : Promise.resolve(false)} onImportant={() => service && run(() => service.markImportant(note.id))} onAction={() => service && run(() => service.markAction(note.id))} onComplete={resolution => service ? run(() => service.finishAction(note.id,resolution),'Åtgärden är slutförd.') : Promise.resolve(false)} />
        </div>
      })}{view === 'flow' && hasMore && <button className="load-more" onClick={() => void loadMore()}>Visa äldre anteckningar</button>}</div>}
    </main><aside className="sidebar"><h2>En anteckning i taget</h2><p>Skriv först. Ordna i sektioner när du behöver och markera det som ska följas upp.</p><div className="sidebar-card"><strong>{notes.length}</strong><span>senaste anteckningar i flödet</span></div><p className="sidebar-tip">Tips: skapa regelbundet en backup under Data.</p></aside></div>
  </div>
}
function NoteCard({note,section,highlighted,onNavigate,onEdit,onImportant,onAction,onComplete}: {note:NoteBlock;section:Section | undefined;highlighted:boolean;onNavigate?: (id:string)=>void;onEdit:(text:string)=>Promise<boolean>;onImportant:()=>void;onAction:()=>void;onComplete:(resolution:string)=>Promise<boolean>}) {
  const [editing,setEditing] = useState(false), [text,setText] = useState(note.text), [resolution,setResolution] = useState(''), [resolving,setResolving] = useState(false)
  return <article className={`note ${highlighted ? 'highlight' : ''}`} id={`note-${note.id}`}><div className="note-meta"><time dateTime={note.createdAt}>{dateLabel(note.createdAt)}</time>{section && <span>{section.type === 'meeting' ? 'Möte' : 'Sektion'}: {section.title}</span>}{note.important && <span className="badge">Viktigt</span>}{note.actionStatus !== 'none' && <span className="badge">{note.actionStatus === 'open' ? 'Öppen åtgärd' : 'Slutförd'}</span>}</div>
    {editing ? <form onSubmit={e => {e.preventDefault();if(text.trim()) void onEdit(text).then(saved => { if (saved) setEditing(false) })}}><label className="sr-only" htmlFor={`edit-${note.id}`}>Redigera anteckning</label><textarea id={`edit-${note.id}`} value={text} onChange={e => setText(e.target.value)} rows={4}/><div className="row"><button className="primary">Spara</button><button type="button" onClick={() => {setEditing(false);setText(note.text)}}>Avbryt</button></div></form> : <p className="note-text">{note.text}</p>}
    {note.actionStatus === 'completed' && <p className="resolution"><strong>Lösning:</strong> {note.actionResolution} {note.actionCompletedAt && <small>({dateLabel(note.actionCompletedAt)})</small>}</p>}
    {resolving && <form onSubmit={e => {e.preventDefault();if(resolution.trim()) void onComplete(resolution).then(saved => { if (saved) { setResolving(false); setResolution('') } })}}><label>Hur löstes åtgärden?<textarea required value={resolution} onChange={e => setResolution(e.target.value)} /></label><div className="row"><button className="primary">Slutför</button><button type="button" onClick={() => setResolving(false)}>Avbryt</button></div></form>}
    <div className="note-actions"><button onClick={() => { setText(note.text); setEditing(true) }}>Redigera</button><button aria-pressed={note.important} onClick={onImportant}>{note.important ? 'Ta bort viktigt' : 'Markera viktigt'}</button>{note.actionStatus !== 'completed' && <button onClick={onAction}>{note.actionStatus === 'open' ? 'Ta bort åtgärd' : 'Gör till åtgärd'}</button>}{note.actionStatus === 'open' && <button onClick={() => setResolving(true)}>Slutför</button>}{onNavigate && <button onClick={() => onNavigate(note.id)}>Visa i flödet</button>}</div>
  </article>
}
