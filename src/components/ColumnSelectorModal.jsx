import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'
import Button from './ui/Button'

const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Tarea' },
  { id: 'startDate', label: 'Fecha inicio' },
  { id: 'endDate', label: 'Fecha fin' },
  { id: 'status', label: 'Estado' }
]

export default function ColumnSelectorModal() {
  const {
    columnSelectorOpen,
    closeColumnSelector,
    visibleGanttColumns,
    setVisibleGanttColumns
  } = useStore()

  const toggleColumn = (colId) => {
    setVisibleGanttColumns(
      visibleGanttColumns.includes(colId)
        ? visibleGanttColumns.filter((c) => c !== colId)
        : [...visibleGanttColumns, colId]
    )
  }

  return (
    <AnimatePresence>
      {columnSelectorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={closeColumnSelector}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 w-80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-pink-900 mb-4">
              Columnas del Gantt
            </h2>

            {/* Columns List */}
            <div className="space-y-2 mb-6">
              {AVAILABLE_COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-pink-200 hover:bg-pink-50 transition-colors text-left"
                >
                  <div className="flex-1 text-pink-900 font-medium">
                    {col.label}
                  </div>
                  {visibleGanttColumns.includes(col.id) ? (
                    <Eye size={18} className="text-rose-600" />
                  ) : (
                    <EyeOff size={18} className="text-pink-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={closeColumnSelector}
                variant="default"
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
