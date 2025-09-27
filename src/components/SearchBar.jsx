import { useState, useRef, useEffect } from 'react'

export default function SearchBar({ onSearch, onGeolocate, disabled }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit(e) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    onSearch(q)
    setValue('')           // clear after search
    inputRef.current?.focus()
  }

  return (
    <form className="row" onSubmit={submit} style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        placeholder="Search city (e.g., Seattle)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="City"
        autoComplete="off"
        spellCheck="false"
        // IMPORTANT: never disable the input; only disable buttons
        // disabled={disabled}
      />
      <button disabled={disabled} type="submit">Search</button>
      <button
        type="button"
        className="ghost"
        onClick={onGeolocate}
        disabled={disabled}
        title="Use my location"
        aria-label="Use my location"
      >
        📍
      </button>
    </form>
  )
}
