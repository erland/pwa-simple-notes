import 'fake-indexeddb/auto'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { IndexedDbRepository, openDatabase } from '../persistence/database'
import { createNote } from '../domain/model'
import { serializeBackup } from '../application/backup'

afterEach(async () => {
  cleanup()
  await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase('simple-notes'); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) })
})
describe('Simple Notes app', () => {
  it('creates, edits and marks a note, then finds it in special views', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', {name:'Spara anteckning'})).toBeDisabled())
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Skriv en anteckning'), {target:{value:'En viktig idé'}})
    fireEvent.click(screen.getByRole('button', {name:'Spara anteckning'}))
    const card = await screen.findByRole('article')
    expect(within(card).getByText('En viktig idé')).toBeInTheDocument()
    fireEvent.click(within(card).getByRole('button', {name:'Markera viktigt'}))
    await waitFor(() => expect(within(card).getByText('Viktigt')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', {name:/^Viktigt$/}))
    expect(await screen.findByText('En viktig idé')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', {name:'Sök'}))
    fireEvent.change(screen.getByLabelText('Sök i anteckningarna'), {target:{value:'VIKTIG'}})
    expect(await screen.findByText('En viktig idé')).toBeInTheDocument()
  })
  it('creates a section and a note tied to it', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', {name:'Spara anteckning'})).toBeDisabled())
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', {name:'+ Ny sektion'}))
    fireEvent.change(screen.getByLabelText('Rubrik'), {target:{value:'Projekt'}})
    fireEvent.click(screen.getByRole('button', {name:/^Starta$/}))
    await screen.findByText('I sektion: Projekt')
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Skriv en anteckning'), {target:{value:'Beslut'}})
    fireEvent.click(screen.getByRole('button', {name:'Spara anteckning'}))
    const card = await screen.findByRole('article')
    expect(within(card).getByText('Sektion: Projekt')).toBeInTheDocument()
  })
  it('tracks an action through completion with its resolution', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Skriv en anteckning'), {target:{value:'Ring Ada'}})
    fireEvent.click(screen.getByRole('button', {name:'Spara anteckning'}))
    const card = await screen.findByRole('article')
    fireEvent.click(within(card).getByRole('button', {name:'Gör till åtgärd'}))
    await waitFor(() => expect(within(card).getByText('Öppen åtgärd')).toBeInTheDocument())
    fireEvent.click(within(card).getByRole('button', {name:'Slutför'}))
    fireEvent.change(within(card).getByLabelText('Hur löstes åtgärden?'), {target:{value:'Ada kontaktad'}})
    fireEvent.click(within(card).getAllByRole('button', {name:'Slutför'})[0])
    await waitFor(() => expect(within(card).getByText(/Ada kontaktad/)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', {name:'Åtgärder'}))
    fireEvent.click(screen.getByRole('button', {name:'Slutförda'}))
    expect(await screen.findByText('Ring Ada')).toBeInTheDocument()
  })

  it('rejects invalid restore, allows cancel, and requires explicit replacement', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Skriv en anteckning'), {target:{value:'Keep'}})
    fireEvent.click(screen.getByRole('button', {name:'Spara anteckning'}))
    await screen.findByText('Keep')
    fireEvent.click(screen.getByRole('button', {name:'Data'}))
    const input = screen.getByLabelText('Välj .snotes-fil')
    fireEvent.change(input, {target:{files:[{text:async () => '{'}]}})
    expect(await screen.findByRole('alert')).toHaveTextContent('giltig JSON')
    const replacement = serializeBackup({notes:[createNote('Restored')],sections:[]})
    fireEvent.change(input, {target:{files:[{text:async () => replacement}]}})
    await screen.findByText(/1 anteckningar och 0 sektioner/)
    fireEvent.click(screen.getByRole('button', {name:'Avbryt'}))
    const db = await openDatabase(), repo = new IndexedDbRepository(db)
    expect((await repo.snapshot()).notes.map(n => n.text)).toEqual(['Keep'])
    fireEvent.change(input, {target:{files:[{text:async () => replacement}]}})
    await screen.findByText(/1 anteckningar och 0 sektioner/)
    fireEvent.click(screen.getByRole('button', {name:'Ja, ersätt alla data'}))
    await screen.findByText(/Återställningen lyckades/)
    expect((await repo.snapshot()).notes.map(n => n.text)).toEqual(['Restored'])
    repo.close()
  })

  it('navigates from an old important note back into the paginated flow', async () => {
    const db = await openDatabase(), repo = new IndexedDbRepository(db)
    const oldest = {...createNote('Old target', null, '2026-01-01T00:00:00.000Z'), important:true}
    await repo.putNote(oldest)
    for (let i=0; i<75; i++) await repo.putNote(createNote(`Recent ${i}`, null, new Date(Date.UTC(2026,0,2,0,0,i)).toISOString()))
    repo.close()
    Element.prototype.scrollIntoView = () => undefined
    render(<App />)
    await waitFor(() => expect(screen.queryByText('Öppnar dina lokala anteckningar…')).not.toBeInTheDocument())
    expect(screen.queryByText('Old target')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', {name:'Viktigt'}))
    const oldCard = await screen.findByText('Old target')
    fireEvent.click(within(oldCard.closest('article')!).getByRole('button', {name:'Visa i flödet'}))
    await waitFor(() => expect(screen.getByRole('button', {name:'Flöde'})).toHaveAttribute('aria-current','page'))
    expect(screen.getByText('Old target')).toBeInTheDocument()
  })

})
