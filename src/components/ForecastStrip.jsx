export default function ForecastStrip({ forecast, units }) {
  if (forecast == null) {
    return (
      <div className="card" aria-label="5-day forecast">
        <div className="small" style={{ opacity: 0.85 }}>
          5-day forecast unavailable. Try again later.
        </div>
      </div>
    )
  }

  if (!forecast?.days?.length) return null

  const unitSymbol = units === 'metric' ? '°C' : '°F'

  return (
    <div className="card" aria-label="5-day forecast">
      <div className="small" style={{ marginBottom: 8, opacity: 0.85 }}>5-day forecast</div>
      <div className="forecast">
        {forecast.days.map((d) => {
          const day = new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })
          return (
            <div className="forecast-item" key={d.date}>
              <div className="small">{day}</div>
              {d.icon ? <img alt={d.desc || 'weather'} src={`https://openweathermap.org/img/wn/${d.icon}.png`} width="48" height="48" /> : <div style={{ height: 48 }} />}
              <div style={{ fontWeight: 700 }}>{d.temp}{unitSymbol}</div>
              <div className="small" style={{ textAlign: 'center' }}>
                {d.desc ? d.desc[0].toUpperCase() + d.desc.slice(1) : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
