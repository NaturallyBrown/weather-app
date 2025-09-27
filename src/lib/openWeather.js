const API_BASE = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''

// Don’t spam console each time; just warn once if missing
if (!API_KEY) {
  console.error(
    'Missing OpenWeather API key. Add .env.local with:\n' +
    'VITE_OPENWEATHER_API_KEY=your_key\nRestart: npm run dev'
  )
}

const cache = new Map()
const inflight = new Map()
const TTL_MS = 5 * 60 * 1000

function toQuery(p) { return new URLSearchParams(p).toString() }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function cachedFetch(url, { retries = 1, backoffMs = 1000 } = {}) {
  const now = Date.now()
  const hit = cache.get(url)
  if (hit && (now - hit.time) < TTL_MS) return hit.data
  if (inflight.has(url)) return inflight.get(url)

  const doFetch = (async () => {
    let attempt = 0
    while (true) {
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        cache.set(url, { time: Date.now(), data: json })
        inflight.delete(url)
        return json
      }
      const body = await res.text().catch(() => '')
      if (res.status === 429 && attempt < retries) {
        attempt++
        await sleep(backoffMs * attempt) // 1s then 2s (max)
        continue
      }
      inflight.delete(url)
      if (res.status === 429) throw new Error('Rate limited (429). Try again shortly.')
      if (res.status === 401) throw new Error('Invalid API key (401). Check your key.')
      throw new Error(`Request failed (${res.status}) ${body}`.trim())
    }
  })()

  inflight.set(url, doFetch)
  return doFetch
}

export async function fetchCurrentWeather({ q, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/weather?${toQuery({ q, units, appid: API_KEY })}`
  return cachedFetch(url)
}

export async function fetchCurrentWeatherByCoords({ lat, lon, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/weather?${toQuery({ lat, lon, units, appid: API_KEY })}`
  return cachedFetch(url)
}

export async function fetchForecast({ q, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/forecast?${toQuery({ q, units, appid: API_KEY })}`
  const json = await cachedFetch(url)

  const byDay = {}
  for (const item of json.list) {
    const [date, time] = item.dt_txt.split(' ')
    if (time === '12:00:00' && !byDay[date]) byDay[date] = item
  }
  for (const item of json.list) {
    const [date] = item.dt_txt.split(' ')
    if (!byDay[date]) byDay[date] = item
  }
  const days = Object.entries(byDay).slice(0, 5).map(([date, item]) => ({
    date,
    temp: Math.round(item.main.temp),
    icon: item.weather?.[0]?.icon,
    desc: item.weather?.[0]?.description ?? '',
  }))

  return { city: json.city?.name ?? q, days }
}
