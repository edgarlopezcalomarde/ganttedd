import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Button from './ui/Button'

const PROJECT_COLORS = [
  '#f472b6',
  '#fb7185',
  '#c084fc',
  '#818cf8',
  '#34d399',
  '#fbbf24',
  '#60a5fa',
  '#a78bfa'
]

export default function ProjectModal() {
  const {
    projectModalOpen,
    projectModalData,
    closeProjectModal,
    addProject,
    updateProject
  } = useStore()

  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])

  useEffect(() => {
    if (projectModalData) {
      setName(projectModalData.name)
      setColor(projectModalData.color)
    } else {
      setName('')
      setColor(PROJECT_COLORS[0])
    }
  }, [projectModalOpen, projectModalData])

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, ingresa un nombre')
      return
    }

    if (projectModalData) {
      updateProject(projectModalData.id, { name, color })
    } else {
      addProject(name, color)
    }

    closeProjectModal()
  }

  return (
    <AnimatePresence>
      {projectModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={closeProjectModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-pink-900 mb-4">
              {projectModalData ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-pink-900 mb-2">
                Nombre del proyecto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                className="w-full border border-pink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Ej: Rediseño web"
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-pink-900 mb-3">
                Color
              </label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-rose-600 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={closeProjectModal}
                variant="ghost"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                variant="default"
              >
                Guardar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
