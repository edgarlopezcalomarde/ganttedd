import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Search, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { format, parseISO } from 'date-fns'
import Button from './ui/Button'

const STATUS_COLORS = {
  todo: 'bg-pink-100 text-pink-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700'
}

const STATUS_LABELS = {
  todo: 'Por hacer',
  'in-progress': 'En progreso',
  done: 'Hecho'
}

export default function TaskListView() {
  const {
    projects,
    tasks,
    selectedProjectId,
    deleteTask,
    addTask,
    updateTask
  } = useStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('startDate')
  const [sortDir, setSortDir] = useState('asc')
  const [hoveredId, setHoveredId] = useState(null)

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (selectedProjectId) {
      result = result.filter((t) => t.projectId === selectedProjectId)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((t) =>
        t.name.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    result.sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      if (sortKey === 'name') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [tasks, selectedProjectId, searchTerm, statusFilter, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleNameChange = (taskId, newName) => {
    if (newName.trim()) {
      updateTask(taskId, { name: newName.trim() })
    }
  }

  const handleDateChange = (taskId, field, newDate, task) => {
    if (!newDate) return

    if (field === 'startDate' && new Date(newDate) > new Date(task.endDate)) {
      alert('Fecha inicio no puede ser posterior a fecha fin')
      return
    }
    if (field === 'endDate' && new Date(task.startDate) > new Date(newDate)) {
      alert('Fecha fin no puede ser anterior a fecha inicio')
      return
    }

    updateTask(taskId, { [field]: newDate })
  }

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus })
  }

  const handleDelete = (taskId) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      deleteTask(taskId)
    }
  }

  const handleAddTask = () => {
    if (!selectedProjectId) {
      alert('Selecciona un proyecto primero')
      return
    }
    const today = format(new Date(), 'yyyy-MM-dd')
    addTask(selectedProjectId, {
      name: 'Nueva tarea',
      startDate: today,
      endDate: today,
      status: 'todo',
      description: ''
    })
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-pink-400 text-lg">
          {tasks.length === 0
            ? 'Sin tareas. ¡Crea tu primera tarea!'
            : 'No hay tareas que coincidan con los filtros.'}
        </p>
        {selectedProjectId && (
          <Button onClick={handleAddTask} variant="default">
            <Plus size={18} />
            Crear primera tarea
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex gap-3 p-4 bg-white border-b border-pink-200 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-pink-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-pink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="todo">Por hacer</option>
          <option value="in-progress">En progreso</option>
          <option value="done">Hecho</option>
        </select>
        <Button onClick={handleAddTask} variant="secondary" size="md">
          <Plus size={18} />
          <span>Tarea</span>
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-pink-50 border-b border-pink-200">
            <tr>
              <th className="text-left p-3 font-semibold text-pink-900 cursor-pointer hover:bg-pink-100 w-32"
                  onClick={() => handleSort('projectId')}>
                Proyecto {sortKey === 'projectId' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-3 font-semibold text-pink-900 cursor-pointer hover:bg-pink-100 flex-1"
                  onClick={() => handleSort('name')}>
                Tarea {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-3 font-semibold text-pink-900 cursor-pointer hover:bg-pink-100 w-28"
                  onClick={() => handleSort('startDate')}>
                Inicio {sortKey === 'startDate' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-3 font-semibold text-pink-900 cursor-pointer hover:bg-pink-100 w-28"
                  onClick={() => handleSort('endDate')}>
                Fin {sortKey === 'endDate' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-3 font-semibold text-pink-900 cursor-pointer hover:bg-pink-100 w-32"
                  onClick={() => handleSort('status')}>
                Estado {sortKey === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-center p-3 font-semibold text-pink-900 w-12">✕</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTasks.map((task, idx) => {
                const project = projects.find((p) => p.id === task.projectId)
                const isEditing = editingId === task.id

                return (
                  <motion.tr
                    key={task.id}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-pink-100 hover:bg-pink-50 transition-colors group"
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Project */}
                    <td className="p-3 text-pink-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project?.color || '#ccc' }}
                        />
                        <span className="text-xs font-medium">{project?.name || 'Sin proyecto'}</span>
                      </div>
                    </td>

                    {/* Name - Contenteditable */}
                    <td className="p-3 text-pink-900 font-medium">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleNameChange(task.id, e.currentTarget.textContent)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleNameChange(task.id, e.currentTarget.textContent)
                            e.currentTarget.blur()
                          }
                        }}
                        className="outline-none rounded px-1 py-0.5 cursor-text hover:bg-pink-100/30 focus:bg-pink-100 focus:ring-2 focus:ring-pink-400"
                      >
                        {task.name}
                      </div>
                    </td>

                    {/* Start Date - Native Input */}
                    <td className="p-3 text-pink-700 text-xs">
                      <input
                        type="date"
                        value={task.startDate}
                        onChange={(e) => handleDateChange(task.id, 'startDate', e.target.value, task)}
                        className="bg-transparent border-0 p-0 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer w-full text-xs"
                        style={{ colorScheme: 'light' }}
                      />
                    </td>

                    {/* End Date - Native Input */}
                    <td className="p-3 text-pink-700 text-xs">
                      <input
                        type="date"
                        value={task.endDate}
                        onChange={(e) => handleDateChange(task.id, 'endDate', e.target.value, task)}
                        className="bg-transparent border-0 p-0 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer w-full text-xs"
                        style={{ colorScheme: 'light' }}
                      />
                    </td>

                    {/* Status - Native Select */}
                    <td className="p-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`bg-transparent border-0 p-1 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer text-xs font-medium ${STATUS_COLORS[task.status]}`}
                      >
                        <option value="todo">Por hacer</option>
                        <option value="in-progress">En progreso</option>
                        <option value="done">Hecho</option>
                      </select>
                    </td>

                    {/* Delete */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded hover:bg-pink-200 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <Trash2 size={16} className="text-pink-600" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
