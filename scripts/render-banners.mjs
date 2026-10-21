import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const mark = (await readFile('assets/icons/enois-mark.svg')).toString('base64')
const variants = [
  { name: 'banner', directory: 'docs/assets', width: 1800, height: 600 },
  { name: 'social-preview', directory: 'docs/assets', width: 1280, height: 640 },
  { name: 'featured-banner', directory: 'assets/store', width: 1800, height: 600 },
]

for (const variant of variants) {
  const { name, directory, width, height } = variant
  const compact = width < 1500
  const left = compact ? 64 : 96
  const baseline = compact ? 260 : 254
  const logoSize = compact ? 208 : 280
  const logoX = width - logoSize - (compact ? 50 : 112)
  const logoY = compact ? 168 : 124
  const titleSize = compact ? 66 : 90
  const captionSize = compact ? 22 : 28
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">Énóis Desktop — cliente independente para Linux</title>
  <desc id="description">Projeto derivado e paralelo à plataforma Énóis. Créditos à plataforma original e à sua comunidade.</desc>
  <rect width="${width}" height="${height}" fill="#faf8ff"/>
  <path d="M${width - 430} 0h430v${height}h-210C${width - 560} ${height - 160} ${width - 540} 120 ${width - 430} 0Z" fill="#f0eafb"/>
  <circle cx="${logoX + logoSize / 2}" cy="${logoY + logoSize / 2}" r="${logoSize / 2 + 34}" fill="#e7def8"/>
  <image href="data:image/svg+xml;base64,${mark}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}"/>
  <g font-family="Noto Sans, sans-serif">
    <rect x="${left}" y="${compact ? 70 : 80}" width="251" height="38" rx="19" fill="#ede5f8"/>
    <text x="${left + 22}" y="${compact ? 95 : 105}" font-size="15" font-weight="600" letter-spacing="2" fill="#674098">LINUX · COMUNIDADE</text>
    <text x="${left}" y="${baseline}" font-size="${titleSize}" font-weight="700" letter-spacing="-3" fill="#292032">Énóis <tspan font-weight="400" fill="#74568e">Desktop</tspan></text>
    <text x="${left}" y="${baseline + 65}" font-size="${captionSize}" fill="#665b73">Sua comunidade, em uma janela sua.</text>
    <text x="${left}" y="${height - 124}" font-size="${compact ? 19 : 24}" fill="#766782">Um projeto derivado e paralelo à plataforma Énóis.</text>
    <path d="M${left} ${height - 94}H${width - left}" stroke="#e1d8ed"/>
    <text x="${left}" y="${height - 48}" font-size="${compact ? 16 : 19}" fill="#8b7e97">Plataforma e comunidade originais: enois.ia.br</text>
    <text x="${width - left}" y="${height - 48}" font-size="${compact ? 16 : 19}" text-anchor="end" fill="#674098">Cliente independente</text>
  </g>
</svg>
`
  await mkdir(directory, { recursive: true })
  const source = resolve(directory, `${name}.svg`)
  const output = resolve(directory, `${name}.png`)
  await writeFile(source, svg)
  execFileSync('inkscape', [source, '--export-type=png', `--export-filename=${output}`], {
    stdio: 'pipe',
  })
  console.log(`${directory}/${name}: SVG e PNG ${width}×${height}`)
}
