import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const dist = 'dist'
const manifest = JSON.parse(readFileSync(join(dist, 'manifest.webmanifest'), 'utf8'))
for (const key of ['name','start_url','scope','icons']) if (!manifest[key]) throw new Error(`Manifest field missing: ${key}`)
for (const icon of manifest.icons) if (!existsSync(join(dist, icon.src.replace(/^\//, '')))) throw new Error(`Missing icon: ${icon.src}`)
const sw = readFileSync(join(dist, 'sw.js'), 'utf8')
if (!sw.includes('index.html') || !sw.includes('precache')) throw new Error('App shell is missing from service worker precache')
if (sw.includes('indexedDB') || sw.includes('simple-notes-backup')) throw new Error('User data must not be stored in Cache Storage')
const index = readFileSync(join(dist, 'index.html'), 'utf8')
if (!index.includes('manifest.webmanifest')) throw new Error('HTML does not link to the manifest')
console.log(`PWA build structure PASS (${manifest.name}, ${manifest.scope})`)
