import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const files = (await readdir('dist')).filter((name) => /\.(snap|AppImage)$/.test(name)).sort()
if (files.length === 0) throw new Error('Nenhum artefato real foi gerado.')
const checksums = []
for (const name of files) {
  const content = await readFile(join('dist', name))
  checksums.push(`${createHash('sha256').update(content).digest('hex')}  ${name}`)
}
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const info = {
  name: pkg.name,
  version: pkg.version,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
  builtAt: new Date().toISOString(),
  node: process.version,
  electron: pkg.devDependencies.electron,
  architecture: process.arch,
  checksums,
}
await writeFile('dist/SHA256SUMS', `${checksums.join('\n')}\n`)
await writeFile('dist/build-info.json', `${JSON.stringify(info, null, 2)}\n`)
console.log(`Metadados e hashes de ${files.length} artefato(s) gerados.`)
