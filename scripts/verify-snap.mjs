import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const { version } = JSON.parse(await readFile('package.json', 'utf8'))
const artifact = `dist/enois-desktop_${version}_amd64.snap`
const read = (path) => execFileSync('unsquashfs', ['-cat', artifact, path], { encoding: 'utf8' })
const manifest = read('meta/snap.yaml')
if (!/^confinement: strict$/m.test(manifest) || !/allow-sandbox: true/.test(manifest)) {
  throw new Error('O pacote precisa de confinamento strict e suporte ao sandbox Chromium.')
}
for (const file of [
  'command.sh',
  'desktop-init.sh',
  'desktop-common.sh',
  'desktop-gnome-specific.sh',
]) {
  const contents = read(file)
  if (!contents.trim() || contents.includes('--no-sandbox')) {
    throw new Error(`Launcher ausente ou inseguro: ${file}`)
  }
}
const entry = read('meta/gui/enois-desktop.desktop')
if (!entry.includes('StartupWMClass=enois-desktop'))
  throw new Error('Associação desktop incorreta.')
console.log(`Snap inspecionado: ${artifact}; strict, sandbox preservado e launchers presentes.`)
