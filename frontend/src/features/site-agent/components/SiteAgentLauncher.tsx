import { useEffect, useRef } from 'react'
import { Bot, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

export function SiteAgentLauncher() {
  const openPanel = useSiteAgentStore((state) => state.openPanel)
  const floatingPosition = useSiteAgentStore((state) => state.floatingPosition)
  const ensureFloatingPosition = useSiteAgentStore((state) => state.ensureFloatingPosition)
  const clampFloatingPosition = useSiteAgentStore((state) => state.clampFloatingPosition)
  const setFloatingPosition = useSiteAgentStore((state) => state.setFloatingPosition)
  const dragStateRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    ensureFloatingPosition()
  }, [ensureFloatingPosition])

  useEffect(() => {
    function handleResize() {
      clampFloatingPosition()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [clampFloatingPosition])

  useEffect(() => {
    if (!floatingPosition) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      const x = Math.min(Math.max(16, event.clientX - dragState.offsetX), window.innerWidth - 80)
      const y = Math.min(Math.max(80, event.clientY - dragState.offsetY), window.innerHeight - 80)
      dragState.moved = true
      setFloatingPosition({ x, y })
    }

    function handlePointerUp(event: PointerEvent) {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }
      window.setTimeout(() => {
        dragStateRef.current = null
      }, 0)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [floatingPosition, setFloatingPosition])

  if (!floatingPosition) {
    return null
  }

  return (
    <div
      className="fixed z-50 flex items-center gap-2"
      style={{ left: `${floatingPosition.x}px`, top: `${floatingPosition.y}px` }}
    >
      <button
        aria-label="Drag site agent launcher"
        className="hidden cursor-grab items-center rounded-full border border-stone-200 bg-white/90 px-2 py-1 text-[11px] font-medium text-stone-500 shadow-sm backdrop-blur md:inline-flex"
        type="button"
        onPointerDown={(event) => {
          if (window.innerWidth < 768) {
            return
          }

          dragStateRef.current = {
            pointerId: event.pointerId,
            offsetX: 12,
            offsetY: 12,
            moved: false,
          }
        }}
      >
        <GripVertical className="size-3" />
        Move
      </button>
      <Button
        aria-label="Open site agent"
        className={cn(
          'rounded-full border border-stone-900/10 bg-stone-900 px-4 text-white shadow-lg shadow-stone-900/20 transition hover:bg-stone-800',
          'supports-[backdrop-filter]:bg-stone-900/95',
        )}
        size="lg"
        type="button"
        onClick={() => openPanel()}
      >
        <Bot className="size-4" />
        Agent
      </Button>
    </div>
  )
}
