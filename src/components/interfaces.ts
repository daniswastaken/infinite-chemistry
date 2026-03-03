export interface DragItem {
  type: string
  id: string
  top: number | null
  left: number | null
  emoji?: string
  symbol?: string
  icon?: string
  title: string
  formula?: string
  components?: Record<string, number>
  atomicId?: string
}
