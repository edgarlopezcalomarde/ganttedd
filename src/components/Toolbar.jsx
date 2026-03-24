import { useRef } from 'react'
import { Download, Upload, Search, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { exportToCSV, importFromCSV } from '../utils/csv'
import Button from './ui/Button'

export default function Toolbar() {
  const {
    projects,
    tasks,
    selectedProjectId,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    importData,
    confirmDeleteTask,
    setConfirmDeleteTask,
    sidebarCollapsed,
    toggleSidebar
  } = useStore()

  const fileInputRef = useRef(null)

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const projectName = selectedProject ? selectedProject.name : 'Todos los proyectos'

  const handleExport = () => {
    const csv = exportToCSV(projects, tasks)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ganttedd-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result
        const { newProjects, newTasks } = importFromCSV(csv)
        importData(newProjects, newTasks)
        alert('✅ Datos importados exitosamente')
      } catch (error) {
        alert(`❌ Error al importar: ${error.message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-pink-200 shadow-sm gap-4">
      {/* Left: Project name / Menu toggle */}
      <button
        onClick={toggleSidebar}
        className="px-4 py-2 rounded hover:bg-pink-100 active:bg-pink-200 transition-colors cursor-pointer"
        title={sidebarCollapsed ? 'Mostrar menú (click)' : 'Ocultar menú (click)'}
      >
        <h2 className="text-lg font-semibold text-pink-900 min-w-fit">{projectName}</h2>
      </button>

      {/* Center: Search and Filter */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={16} />
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-pink-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-pink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
        >
          <option value="all">Todos</option>
          <option value="todo">Por hacer</option>
          <option value="in-progress">En progreso</option>
          <option value="done">Hecho</option>
        </select>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Export Button */}
        <Button
          onClick={handleExport}
          variant="outline"
          size="md"
          title="Exportar a CSV"
        >
          <Download size={18} />
        </Button>

        {/* Import Button */}
        <Button
          onClick={handleImportClick}
          variant="outline"
          size="md"
          title="Importar CSV"
        >
          <Upload size={18} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Settings */}
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded hover:bg-pink-50 transition-colors">
          <input
            type="checkbox"
            checked={confirmDeleteTask}
            onChange={(e) => setConfirmDeleteTask(e.target.checked)}
            className="w-4 h-4 rounded border-pink-300 text-rose-600 focus:ring-pink-400 cursor-pointer"
          />
          <span className="text-sm text-pink-700 whitespace-nowrap">Confirmar al eliminar</span>
        </label>
      </div>
    </div>
  )
}
