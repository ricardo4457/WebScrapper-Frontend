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

function isIslandOrigin(originalName) {
  return originalName in DISTRICT_ALIASES
}

// "Ilha de São Miguel" -> "São Miguel", "Ilha da Madeira" -> "Madeira"
function islandLabel(originalName) {
  if (/porto santo/i.test(originalName)) return 'Porto Santo'
  const m = originalName.match(/^Ilha\s+(?:de|do|da|das|dos)?\s*(.+)$/i)
  return m ? m[1] : originalName
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

  // Step 1: count how many times each municipality name appears nationwide,
  // using the ORIGINAL district name (before Açores/Madeira alias). This tells
  // us if a name clash involves an island.
  const nameOccurrences = new Map() // name -> count

  for (const rawDistrito of rawDistritos) {
    const original = resolveName(rawDistrito)
    const entry = mapa.find((x) => resolveName(x) === original)
    const municipios = entry?.municipios ?? []

    municipios.forEach((m) => {
      const name = resolveName(m)
      if (!name) return
      nameOccurrences.set(name, (nameOccurrences.get(name) ?? 0) + 1)
    })
  }

  // Step 2: group by normalized district. If a municipality's name is shared
  // with another one nationwide AND it comes from an island, add "(Island)"
  // to match Wook's naming (e.g. "Lagoa (São Miguel)", "Calheta (Madeira)").
  const grouped = new Map()

  for (const rawDistrito of rawDistritos) {
    const original = resolveName(rawDistrito)
    const district = normalizeDistrict(original)

    const entry = mapa.find((x) => resolveName(x) === original)
    const municipios = entry?.municipios ?? []

    if (!grouped.has(district)) {
      grouped.set(district, new Set())
    }

    municipios.forEach((m) => {
      const name = resolveName(m)
      if (!name) return

      const hasClash = (nameOccurrences.get(name) ?? 0) > 1
      const finalName =
        hasClash && isIslandOrigin(original) ? `${name} (${islandLabel(original)})` : name

      grouped.get(district).add(finalName)
    })
  }

  const distritos = [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'pt'))
    .map(([name, municipios]) => ({
      name,
      concelhos: [...municipios]
        .sort((a, b) => String(a).localeCompare(String(b), 'pt'))
        .map((m) => ({ name: m })),
    }))

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })

  await fs.writeFile(OUT_PATH, JSON.stringify({ distritos }, null, 2), 'utf-8')

  console.log(`Saved ${distritos.length} districts to ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
