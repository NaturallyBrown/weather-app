// src/App.jsx
import { useEffect, useState, useCallback, memo } from 'react'
import SearchBar from './components/SearchBar.jsx'
import WeatherCardBase from './components/WeatherCard.jsx'
import ForecastStripBase from './components/ForecastStrip.jsx'
import RecentChipsBase from './components/RecentChips.jsx'
import {
  fetchCurrentWeather,
  fetchCurrentWeatherByCoords,
  fetchForecast,
} from './lib/openWeather.js'

// Memo wrappers to avoid re-renders while typing
const WeatherCard = memo(WeatherCardBase)
const ForecastStrip = memo(ForecastStripBase)
const RecentChips = memo(RecentChipsBase)

export default function App() {
  const [units, setUnits] = useState(() => localStorage.getItem('units') || 'imperial')
  const [city, setCity] = useState(() => localStorage.getItem('city') || 'Sacramento')
  const [data, setData] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent') || '[]') } catch { return [] }
  })

  // --- STABLE helper: no deps; uses functional state update ---
  function rememberCity(c) {
    setRecent(prev => {
      const next = [c, ...prev.filter(x => x.toLowerCase() !== c.toLowerCase())].slice(0, 5)
      localStorage.setItem('recent', JSON.stringify(next))
      return next
    })
    localStorage.setItem('city', c)
  }

  // Fetch CURRENT first, then FORECAST. Guard setCity to avoid ping-pong.
  const loadAllForCity = useCallback(async (q) => {
    const query = q?.trim()
    if (!query) return
    setError('')
    setLoading(true)
    try {
      const w = await fetchCurrentWeather({ q: query, units })
      setData(w)
      if (query !== city) setCity(query)   // only update if it actually changed
      rememberCity(query)

      try {
        const f = await fetchForecast({ q: query, units })
        setForecast(f)
      } catch (fe) {
        console.warn('Forecast fetch failed:', fe?.message || fe)
        setForecast(null)
      }
    } catch (e) {
      setData(null)
      setForecast(null)
      setError(e.message || 'Failed to fetch weather.')
    } finally {
      setLoading(false)
    }
  }, [units, city]) // <-- no rememberCity here; it's stable

  const loadByCity = useCallback(async (q) => {
    if (!q?.trim()) return
    await loadAllForCity(q.trim())
  }, [loadAllForCity])

  const loadByCoords = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported in this browser.')
      return
    }
    setError('')
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const w = await fetchCurrentWeatherByCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            units,
          })
          setData(w)
          const label = w.name || 'My Location'
          if (label !== city) setCity(label)
          rememberCity(label)

          try {
            const f = await fetchForecast({ q: label, units })
            setForecast(f)
          } catch (fe) {
            console.warn('Forecast fetch failed:', fe?.message || fe)
            setForecast(null)
          }
        } catch (e) {
          setData(null)
          setForecast(null)
          setError(e.message || 'Failed to fetch weather.')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLoading(false)
        if (err.code === 1) setError('Location permission denied. Enable it in browser settings, or search by city.')
        else if (err.code === 2) setError('Location unavailable. Try again or search by city.')
        else if (err.code === 3) setError('Location request timed out. Try again or search by city.')
        else setError(err.message || 'Unable to get location.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [units, city]) // rememberCity is stable; no need to depend on it

  // Persist units
  useEffect(() => {
    localStorage.setItem('units', units)
  }, [units])

  // Initial load (once)
  useEffect(() => {
    loadAllForCity(city)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch when UNITS change (not on every keystroke, and not just because a function ref changed)
  useEffect(() => {
    if (city) loadAllForCity(city)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units])

  return (
    <div className="app">
      <div className="header">
        <div className="title">🌤️ Weather App</div>
        <div className="row">
          <button
            className="ghost"
            onClick={() => setUnits(u => (u === 'metric' ? 'imperial' : 'metric'))}
            title="Toggle °F/°C"
          >
            {units === 'metric' ? '°C' : '°F'}
          </button>
        </div>
      </div>

      <SearchBar onSearch={loadByCity} onGeolocate={loadByCoords} disabled={loading} />

      <RecentChips
        items={recent}
        onPick={loadByCity}
        onClear={() => { setRecent([]); localStorage.setItem('recent', '[]') }}
      />

      {loading && <div className="loading">Loading weather…</div>}
      {error && <div className="error">Error: {error}</div>}

      <WeatherCard data={data} units={units} />
      <ForecastStrip forecast={forecast} units={units} />

      <div className="footer">
        Data from OpenWeather • Try cities like “San Diego”, “Aspen”, “Delhi”
      </div>
    </div>
  )
}
