import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import Button from './ui/Button'

export default function Sidebar() {
  const {
    projects,
    selectedProjectId,
    setSelectedProject,
    openProjectModal,
    deleteProject,
    sidebarCollapsed,
  } = useStore()

  const handleDeleteProject = (id) => {
    if (
      window.confirm(
        '¿Eliminar este proyecto y todas sus tareas?'
      )
    ) {
      deleteProject(id)
    }
  }

  return (
    <div
      className="bg-pink-100 border-r border-pink-200 flex flex-col h-full shadow-lg transition-all duration-300 overflow-hidden"
      style={{ width: sidebarCollapsed ? '0px' : '320px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-pink-200 mt-1">
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-rose-600">ganttedd</h1>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'hidden' : ''}`}>
        <div className="p-4">
          {/* Add Project Button */}
          <Button
            onClick={() => openProjectModal()}
            className="w-full mb-4"
            variant="secondary"
            size="md"
          >
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </Button>

          {/* Projects */}
          <AnimatePresence>
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group p-2 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-pink-200'
                    : 'hover:bg-pink-50'
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium truncate text-pink-900">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openProjectModal(project)
                      }}
                      className="p-1 rounded hover:bg-pink-300"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      className="p-1 rounded hover:bg-pink-300"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
