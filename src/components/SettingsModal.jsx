import { motion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useStore } from '../store/useStore'
import Button from './ui/Button'

export default function SettingsModal() {
  const { confirmDeleteTask, setConfirmDeleteTask } = useStore()

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmDeleteTask}
          onChange={(e) => setConfirmDeleteTask(e.target.checked)}
          className="w-4 h-4 rounded border-pink-300 text-rose-600 focus:ring-pink-400 cursor-pointer"
        />
        <span className="text-sm text-pink-700">Confirmar al eliminar</span>
      </label>
    </div>
  )
}
