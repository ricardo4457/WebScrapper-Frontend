import fs from 'fs/promises'
import path from 'path'

const BASE = 'https://json.geoapi.pt'
const REQUEST_DELAY_MS = 1500
const MAX_RETRIES = 6
const OUT_PATH = path.resolve('src/data/districts-cities.json')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url, attempt = 1) {
  const res = await fetch(url)

  if (res.status === 429 && attempt <= MAX_RETRIES) {
    const wait = REQUEST_DELAY_MS * attempt * 3
    console.warn(
      `Rate limited em ${url}, a aguardar ${Math.round(wait / 1000)}s (tentativa ${attempt}/${MAX_RETRIES})`,
    )
    await sleep(wait)
    return fetchJson(url, attempt + 1)
  }

  if (!res.ok) {
    throw new Error(`Pedido falhou com status ${res.status} para ${url}`)
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

function extractCentro(item) {
  return (
    item?.geojson?.properties?.centros?.centro ??
    item?.geojsons?.municipio?.properties?.centros?.centro ??
    item?.geojsons?.distrito?.properties?.centros?.centro ??
    item?.centros?.centro ??
    null
  )
}

function pickPlace(item) {
  const name = resolveName(item)
  const centro = extractCentro(item)

  return {
    name,
    coordenadas: {
      lat: centro?.[1] ?? item?.lat ?? null,
      lon: centro?.[0] ?? item?.lon ?? null,
    },
  }
}

function findEntryByName(list, nome) {
  return list.find((x) => resolveName(x) === nome)
}

async function loadExisting() {
  try {
    const raw = await fs.readFile(OUT_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.distritos) ? parsed.distritos : []
  } catch {
    return []
  }
}

async function saveProgress(distritos) {
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })
  await fs.writeFile(OUT_PATH, JSON.stringify({ distritos }, null, 2))
}

async function main() {
  const distritos = await loadExisting()
  const jaFeitos = new Set(distritos.map((d) => d.name))

  if (jaFeitos.size) {
    console.log(
      `A retomar. Ja existem ${jaFeitos.size} distritos guardados em ${OUT_PATH}:`,
      [...jaFeitos].join(', '),
    )
  }

  console.log('A obter lista de distritos...')
  const rawDistritos = unwrap(await fetchJson(`${BASE}/distritos`), 'distritos')

  await sleep(REQUEST_DELAY_MS)

  console.log('A obter mapa distritos -> municipios...')
  const mapaJson = await fetchJson(`${BASE}/distritos/municipios`)
  const mapaDistritosMunicipios = unwrap(mapaJson, 'distritos')

  for (const d of rawDistritos) {
    const nomeDistrito = resolveName(d)
    if (!nomeDistrito) {
      console.warn('Distrito sem nome resolvido, a saltar:', d)
      continue
    }

    if (jaFeitos.has(nomeDistrito)) {
      console.log(`Ja feito, a saltar: ${nomeDistrito}`)
      continue
    }

    const entry = findEntryByName(mapaDistritosMunicipios, nomeDistrito)
    const nomesConcelhos = entry?.municipios ?? entry?.concelhos ?? []

    if (!nomesConcelhos.length) {
      console.warn(`Sem municipios encontrados para o distrito ${nomeDistrito}`)
    }

    await sleep(REQUEST_DELAY_MS)

    console.log(`A obter detalhes do distrito ${nomeDistrito}...`)
    let distritoDetalhado
    try {
      distritoDetalhado = await fetchJson(`${BASE}/distrito/${encodeURIComponent(nomeDistrito)}`)
    } catch (err) {
      console.warn(
        `Falhou obter detalhes de ${nomeDistrito}, a usar dados da lista inicial:`,
        err.message,
      )
      distritoDetalhado = d
    }

    const concelhos = []
    for (const nomeConcelho of nomesConcelhos) {
      await sleep(REQUEST_DELAY_MS)

      try {
        const raw = await fetchJson(`${BASE}/municipio/${encodeURIComponent(nomeConcelho)}`)
        concelhos.push(pickPlace(raw))
      } catch (err) {
        console.warn(
          `Falhou obter municipio ${nomeConcelho}, a parar aqui para nao perder o progresso ja feito:`,
          err.message,
        )
        // guarda o que ja foi conseguido para este distrito antes de sair
        distritos.push({ ...pickPlace(distritoDetalhado), concelhos })
        await saveProgress(distritos)
        console.log(
          `Progresso guardado em ${OUT_PATH}. Corre o script outra vez mais tarde para continuar.`,
        )
        return
      }
    }

    distritos.push({ ...pickPlace(distritoDetalhado), concelhos })
    await saveProgress(distritos)
    jaFeitos.add(nomeDistrito)
    console.log(`OK: ${nomeDistrito} (${concelhos.length} concelhos) guardado em ${OUT_PATH}`)
  }

  console.log(`Concluido. Total de distritos guardados: ${distritos.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
