// src/lib/openWeather.js

const API_BASE = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''

function toQuery(params) {
  return new URLSearchParams(params).toString()
}

// Generic fetch wrapper with error handling
async function request(url) {
  const res = await fetch(url)
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const j = await res.json()
      if (j?.message) msg += `: ${j.message}`
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json()
}

// ---- Current Weather ----
export async function fetchCurrentWeather({ q, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/weather?${toQuery({ q, units, appid: API_KEY })}`
  return request(url)
}

// ---- Current Weather by Lat/Lon ----
export async function fetchCurrentWeatherByCoords({ lat, lon, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/weather?${toQuery({ lat, lon, units, appid: API_KEY })}`
  return request(url)
}

// ---- 5-day Forecast ----
export async function fetchForecast({ q, units = 'imperial' }) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const url = `${API_BASE}/forecast?${toQuery({ q, units, appid: API_KEY })}`
  const json = await request(url)

  // Collapse 3-hour blocks into ~1 entry/day
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

// ---- City Suggestions (Geocoding API) ----
export async function fetchCitySuggestions(query, limit = 5) {
  if (!API_KEY) throw new Error('Missing OpenWeather API key')
  const base = 'https://api.openweathermap.org/geo/1.0/direct'
  const url = `${base}?${toQuery({ q: query, limit, appid: API_KEY })}`
  const results = await request(url)

  return results.map((r) => {
    const name = r.name?.trim() || ''
    const state = r.state?.trim() || ''
    const country = r.country?.trim() || ''
    const label = [name, state, country].filter(Boolean).join(', ')
    return { name, state, country, lat: r.lat, lon: r.lon, label }
  })
}
