import type { Scores } from '@/types/idea'

interface ScoreRadarProps {
  scores: Scores
  size?: number
}

const dimensions = [
  { key: 'value' as const, label: 'Value' },
  { key: 'learnability' as const, label: 'Learn' },
  { key: 'fun' as const, label: 'Fun' },
  { key: 'feasibility' as const, label: 'Feasible' },
]

export function ScoreRadar({ scores, size = 200 }: ScoreRadarProps) {
  const center = size / 2
  const radius = size / 2 - 30

  function polarToCartesian(value: number, index: number): [number, number] {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2
    const r = (value / 10) * radius
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const points = dimensions
    .map((d, i) => polarToCartesian(scores[d.key], i))
    .map(([x, y]) => `${x},${y}`)
    .join(' ')

  const gridLevels = [2, 4, 6, 8, 10]

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => {
        const gridPoints = dimensions
          .map((_, i) => polarToCartesian(level, i))
          .map(([x, y]) => `${x},${y}`)
          .join(' ')
        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth="1"
          />
        )
      })}

      {/* Axes */}
      {dimensions.map((_, i) => {
        const [x, y] = polarToCartesian(10, i)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#e7e5e4"
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={points}
        fill="rgba(14, 165, 233, 0.15)"
        stroke="#0ea5e9"
        strokeWidth="2"
      />

      {/* Data points */}
      {dimensions.map((d, i) => {
        const [x, y] = polarToCartesian(scores[d.key], i)
        return <circle key={d.key} cx={x} cy={y} r="4" fill="#0ea5e9" />
      })}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const [x, y] = polarToCartesian(11.5, i)
        return (
          <text
            key={d.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-stone-500"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
