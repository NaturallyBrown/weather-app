import { useState, useRef, useEffect } from 'react'
import { fetchCitySuggestions } from '../lib/openWeather.js'

export default function SearchBar({ onSearch, onGeolocate, disabled }) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleChange(e) {
    const text = e.target.value
    setValue(text)

    if (text.length < 2) {
      setSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      const results = await fetchCitySuggestions(text, 5)
      setSuggestions(results)
    } catch (err) {
      console.error('Suggestion fetch failed:', err)
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSearch(value.trim())
    setValue('')
    setSuggestions([])
  }

  function handlePick(suggestion) {
    setValue('')
    setSuggestions([])
    onSearch(suggestion.label) // use "City, State, Country"
  }

  return (
    <div className="searchbar-wrapper">
      <form className="row searchbar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          placeholder="Search city (e.g., Seattle)"
          value={value}
          onChange={handleChange}
          aria-label="City"
          autoComplete="off"
          spellCheck="false"
        />
        <button disabled={disabled} type="submit">Search</button>
        <button
          type="button"
          className="ghost"
          onClick={onGeolocate}
          disabled={disabled}
          title="Use my location"
        >
          📍
        </button>
      </form>

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handlePick(s)}
              className="suggestion"
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {loadingSuggestions && (
        <div className="suggestions loading">Loading…</div>
      )}
    </div>
  )
}
