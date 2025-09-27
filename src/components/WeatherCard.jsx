export default function WeatherCard({ data, units }) {
  if (!data) return null
  const { name, sys = {}, weather = [], main = {}, wind = {} } = data
  const icon = weather[0]?.icon
  const desc = weather[0]?.description
  const unitSymbol = units === 'metric' ? '°C' : '°F'
  const speedUnit = units === 'metric' ? 'm/s' : 'mph'

  return (
    <div className="card">
      <h2>{name}{sys.country ? `, ${sys.country}` : ''}</h2>
      <div className="meta small">{desc ? desc[0].toUpperCase() + desc.slice(1) : '—'}</div>
      <div className="grid">
        <div className="item">
          <div className="small">Temperature</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {Math.round(main.temp)}{unitSymbol}
          </div>
          <div className="small">Feels like {Math.round(main.feels_like)}{unitSymbol}</div>
        </div>
        <div className="item">
          <div className="small">Humidity</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{main.humidity ?? '—'}%</div>
          <div className="small">Wind {Math.round(wind.speed ?? 0)} {speedUnit}</div>
        </div>
        <div className="item">
          <div className="small">Min / Max</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {Math.round(main.temp_min ?? 0)} / {Math.round(main.temp_max ?? 0)}{unitSymbol}
          </div>
        </div>
        <div className="item">
  <div className="small">Current Conditions</div>
  {icon ? (
    <img
      alt={desc ?? 'weather icon'}
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      className="wx-icon"
      width="64"
      height="64"
    />
  ) : '—'}
</div>
      </div>
    </div>
  )
}
