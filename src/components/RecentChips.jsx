export default function RecentChips({ items, onPick, onClear }) {
  if (!items?.length) return null
  return (
    <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
      {items.map((city) => (
        <button
          key={city}
          type="button"
          className="chip"
          onClick={() => onPick(city)}
          title={`Search ${city}`}
        >
          {city}
        </button>
      ))}
      <button type="button" className="ghost" onClick={onClear} title="Clear recent">
        Clear
      </button>
    </div>
  )
}
