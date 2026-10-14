import { type MouseEvent } from 'react'
import type { LineageNode, LineageEdge } from '@/types/app'

export interface LineageGraphProps {
  nodes: LineageNode[]
  edges: LineageEdge[]
  onNodeClick?: (id: string) => void
  className?: string
}

// Stage column assignments
const STAGE_ORDER = ['source', 'bronze', 'silver', 'resolution', 'gold', 'metric'] as const

const STAGE_COLORS: Record<string, string> = {
  source: '#e0f2fe',
  bronze: '#fef3c7',
  silver: '#f3f4f6',
  resolution: '#ede9fe',
  gold: '#fefce8',
  metric: '#d1fae5',
}

const STAGE_BORDER: Record<string, string> = {
  source: '#7dd3fc',
  bronze: '#fcd34d',
  silver: '#9ca3af',
  resolution: '#c4b5fd',
  gold: '#fde047',
  metric: '#6ee7b7',
}

const NODE_WIDTH = 120
const NODE_HEIGHT = 44
const COL_GAP = 80
const ROW_GAP = 60
const PADDING = 20

export function LineageGraph({ nodes, edges, onNodeClick, className }: LineageGraphProps) {
  // Group nodes by stage
  const byStage: Record<string, LineageNode[]> = {}
  for (const stage of STAGE_ORDER) {
    byStage[stage] = nodes.filter((n) => n.stage === stage)
  }

  // Compute positions
  const positions: Record<string, { x: number; y: number }> = {}
  let maxY = 0

  STAGE_ORDER.forEach((stage, colIdx) => {
    const colNodes = byStage[stage] ?? []
    colNodes.forEach((node, rowIdx) => {
      positions[node.id] = {
        x: PADDING + colIdx * (NODE_WIDTH + COL_GAP),
        y: PADDING + rowIdx * (NODE_HEIGHT + ROW_GAP),
      }
      maxY = Math.max(maxY, PADDING + rowIdx * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT)
    })
  })

  const svgWidth = PADDING * 2 + STAGE_ORDER.length * (NODE_WIDTH + COL_GAP)
  const svgHeight = maxY + PADDING

  function handleNodeClick(e: MouseEvent<SVGRectElement>, id: string) {
    e.preventDefault()
    onNodeClick?.(id)
  }

  return (
    <div className={className} role="figure" aria-label="Data lineage graph">
      {/* Stage headers */}
      <div className="flex mb-2" style={{ paddingLeft: PADDING }}>
        {STAGE_ORDER.map((stage, i) => (
          <div
            key={stage}
            className="text-xs font-semibold text-muted-foreground capitalize text-center"
            style={{ width: NODE_WIDTH, marginRight: i < STAGE_ORDER.length - 1 ? COL_GAP : 0 }}
          >
            {stage === 'resolution' ? 'Ent. Resolution' : stage.charAt(0).toUpperCase() + stage.slice(1)}
          </div>
        ))}
      </div>

      <svg
        width={svgWidth}
        height={svgHeight > PADDING * 2 ? svgHeight : 200}
        viewBox={`0 0 ${svgWidth} ${svgHeight > PADDING * 2 ? svgHeight : 200}`}
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = positions[edge.from]
          const to = positions[edge.to]
          if (!from || !to) return null
          const x1 = from.x + NODE_WIDTH
          const y1 = from.y + NODE_HEIGHT / 2
          const x2 = to.x
          const y2 = to.y + NODE_HEIGHT / 2
          const mx = (x1 + x2) / 2
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              stroke="#9ca3af"
              strokeWidth={1.5}
              fill="none"
              markerEnd="url(#arrow)"
            />
          )
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id]
          if (!pos) return null
          const fillColor = STAGE_COLORS[node.stage] ?? '#f3f4f6'
          const strokeColor = STAGE_BORDER[node.stage] ?? '#9ca3af'

          return (
            <g key={node.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={6}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={1.5}
                style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                onClick={(e) => handleNodeClick(e, node.id)}
                role="button"
                aria-label={`${node.stage}: ${node.label}`}
              />
              <text
                x={pos.x + NODE_WIDTH / 2}
                y={pos.y + NODE_HEIGHT / 2 - 6}
                textAnchor="middle"
                fontSize={10}
                fontWeight="600"
                fill="#374151"
                style={{ pointerEvents: 'none' }}
              >
                {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
              </text>
              {node.rowCount != null && (
                <text
                  x={pos.x + NODE_WIDTH / 2}
                  y={pos.y + NODE_HEIGHT / 2 + 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b7280"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.rowCount.toLocaleString()} rows
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
