import { readFile } from 'node:fs/promises'
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const tag = process.env.GITHUB_REF_NAME
if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag ?? '') || tag !== `v${version}`) {
  throw new Error('A tag deve ser uma versão SemVer válida e coincidir com package.json.')
}
console.log(`Versão validada: ${version}`)
