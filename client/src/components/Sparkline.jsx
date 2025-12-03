const Sparkline = ({ points = [], stroke = '#5fff9b' }) => {
  if (!points.length) return null

  const width = 80
  const height = 32
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const pathPoints = points
    .map((point, idx) => {
      const x = (idx / (points.length - 1 || 1)) * width
      const y = height - ((point - min) / range) * height
      return `${idx === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="sparkline"
    >
      <path d={pathPoints} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default Sparkline
