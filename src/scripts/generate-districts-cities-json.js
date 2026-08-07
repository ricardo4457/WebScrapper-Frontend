import fs from 'fs/promises'
import path from 'path'

const BASE = 'https://json.geoapi.pt'
const OUT_PATH = path.resolve('src/data/districts-cities.json')

const DISTRICT_ALIASES = {
  'Ilha de São Miguel': 'Açores',
  'Ilha Terceira': 'Açores',
  'Ilha do Pico': 'Açores',
  'Ilha do Faial': 'Açores',
  'Ilha de Santa Maria': 'Açores',
  'Ilha Graciosa': 'Açores',
  'Ilha da Graciosa': 'Açores',
  'Ilha de São Jorge': 'Açores',
  'Ilha das Flores': 'Açores',
  'Ilha Das Flores': 'Açores',
  'Ilha do Corvo': 'Açores',
  'Ilha da Madeira': 'Madeira',
  'Porto Santo': 'Madeira',
  'Ilha de Porto Santo': 'Madeira',
}

function normalizeDistrict(name) {
  return DISTRICT_ALIASES[name] ?? name
}

async function fetchJson(url) {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`)
  }

  return res.json()
}

function unwrap(json, key) {
  if (Array.isArray(json)) return json
  return json?.[key] ?? []
}

function resolveName(item) {
  if (typeof item === 'string') return item
  return item?.nome ?? item?.distrito ?? item?.concelho ?? item?.municipio ?? null
}

async function main() {
  const rawDistritos = unwrap(await fetchJson(`${BASE}/distritos`), 'distritos')
  const mapa = unwrap(await fetchJson(`${BASE}/distritos/municipios`), 'distritos')

  const grouped = new Map()

  for (const rawDistrito of rawDistritos) {
    const original = resolveName(rawDistrito)
    const district = normalizeDistrict(original)

    const entry = mapa.find((x) => resolveName(x) === original)
    const municipios = entry?.municipios ?? []

    if (!grouped.has(district)) {
      grouped.set(district, new Set())
    }

    municipios.forEach((m) => grouped.get(district).add(m))
  }

  const distritos = [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'pt'))
    .map(([name, municipios]) => ({
      name,
      concelhos: [...municipios].sort((a, b) => a.localeCompare(b, 'pt')).map((m) => ({ name: m })),
    }))

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })

  await fs.writeFile(OUT_PATH, JSON.stringify({ distritos }, null, 2), 'utf-8')

  console.log(`Saved ${distritos.length} districts to ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
