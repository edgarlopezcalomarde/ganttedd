import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  getViewRangeFromTasks,
  getMonthHeaders,
  getDayHeaders,
  getTodayOffset,
  getBarStyle,
  getDayWidth
} from '../utils/dates'
import { format, parseISO } from 'date-fns'
import Button from './ui/Button'

const ZOOM_BUTTONS = [
  { id: 'day', label: 'Día' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' }
]

const STATUS_COLORS = {
  todo: 'bg-pink-100 text-pink-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700'
}

const COLUMN_WIDTHS = {
  taskName: 200,
  startDate: 110,
  endDate: 110,
  status: 110,
  actions: 80
}

const FIXED_COLUMNS_WIDTH = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0)

export default function GanttView() {
  const {
    projects,
    tasks,
    selectedProjectId,
    ganttZoom,
    setGanttZoom,
    openColumnSelector,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    searchTerm,
    statusFilter,
    confirmDeleteTask
  } = useStore()

  const fixedScrollRef = useRef(null)
  const ganttScrollRef = useRef(null)
  const ganttHeaderRef = useRef(null)
  const ganttPanelRef = useRef(null)
  const [panelWidth, setPanelWidth] = useState(0)

  useEffect(() => {
    const el = ganttPanelRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setPanelWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    let result = selectedProjectId
      ? tasks.filter((t) => t.projectId === selectedProjectId)
      : tasks

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(term))
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Ordenar por el campo order dentro de cada proyecto
    result = result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    return result
  }, [tasks, selectedProjectId, searchTerm, statusFilter])

  // Para obtener el índice real de una tarea en su proyecto (sin filtros)
  const getTaskIndexInProject = (taskId, projectId) => {
    const projectTasks = tasks
      .filter(t => t.projectId === projectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    return projectTasks.findIndex(t => t.id === taskId)
  }

  const getProjectTasksCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId).length
  }

  // Para month y year: escalar dayWidth para rellenar el panel si el contenido es más estrecho
  const optimalDayWidth = useMemo(() => {
    const defaultWidth = getDayWidth(ganttZoom)
    if (panelWidth <= 0 || ganttZoom === 'day') return defaultWidth
    const base = getViewRangeFromTasks(filteredTasks, ganttZoom, defaultWidth)
    if (base.totalWidth >= panelWidth) return defaultWidth
    // Calcular el dayWidth que hace totalWidth == panelWidth
    // totalWidth = totalDays * pxPerDay = totalDays * (dayWidth / unitDays)
    // panelWidth = totalDays * (dayWidth / unitDays) → dayWidth = panelWidth * unitDays / totalDays
    const unitDays = ganttZoom === 'year' ? 30 : 7
    return (panelWidth * unitDays) / base.totalDays
  }, [filteredTasks, ganttZoom, panelWidth])

  const finalViewRange = getViewRangeFromTasks(filteredTasks, ganttZoom, optimalDayWidth)
  const monthHeaders = getMonthHeaders(filteredTasks, ganttZoom, optimalDayWidth)
  const dayHeaders = getDayHeaders(filteredTasks, ganttZoom, optimalDayWidth)
  const todayOffset = getTodayOffset(filteredTasks, ganttZoom)

  const tasksByProject = filteredTasks.reduce((acc, task) => {
    const proj = projects.find((p) => p.id === task.projectId)
    if (proj) {
      if (!acc[proj.id]) acc[proj.id] = []
      acc[proj.id].push(task)
    }
    return acc
  }, {})

  // Sincronizar scroll vertical (entre paneles) y horizontal (entre header y body del gantt)
  const handleGanttScroll = (e) => {
    if (fixedScrollRef.current) {
      fixedScrollRef.current.scrollTop = e.target.scrollTop
    }
    if (ganttHeaderRef.current) {
      ganttHeaderRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  const handleFixedScroll = (e) => {
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollTop = e.target.scrollTop
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

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-pink-400 text-lg">Sin tareas. ¡Crea tu primera tarea!</p>
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
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-pink-50 border-b border-pink-200 flex-shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-pink-900">Zoom:</span>
          <div className="flex gap-1 bg-white rounded-lg border border-pink-200 p-1">
            {ZOOM_BUTTONS.map((z) => (
              <button
                key={z.id}
                onClick={() => setGanttZoom(z.id)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  ganttZoom === z.id
                    ? 'bg-rose-600 text-white'
                    : 'text-pink-700 hover:bg-pink-50'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={openColumnSelector} variant="secondary" size="md">
            <Settings size={18} />
            <span>Mostrar</span>
          </Button>
          <Button onClick={handleAddTask} variant="secondary" size="md">
            <Plus size={18} />
            <span>Tarea</span>
          </Button>
        </div>
      </div>

      {/* Two-panel layout: Fixed columns + Scrollable Gantt */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Fixed columns */}
        <div
          ref={fixedScrollRef}
          onScroll={handleFixedScroll}
          className="flex-shrink-0 overflow-y-auto overflow-x-hidden bg-white"
          style={{ width: FIXED_COLUMNS_WIDTH }}
        >
          {/* HEADER - FIXED AND STAYS ON TOP */}
          <div className="sticky top-0 z-40 bg-white border-b border-pink-200 h-16 flex flex-col flex-shrink-0">
            <div className="h-6 border-b border-pink-200 px-3 flex items-center text-xs font-semibold text-pink-900 bg-pink-50">
              Tareas
            </div>
            <div className="h-10 flex border-b border-pink-200">
              <div className="flex items-center px-3 font-semibold text-xs text-pink-900 border-r border-pink-200 overflow-hidden truncate" style={{ width: COLUMN_WIDTHS.taskName }}>
                Tarea
              </div>
              <div className="flex items-center px-3 font-semibold text-xs text-pink-900 border-r border-pink-200 overflow-hidden truncate" style={{ width: COLUMN_WIDTHS.startDate }}>
                Inicio
              </div>
              <div className="flex items-center px-3 font-semibold text-xs text-pink-900 border-r border-pink-200 overflow-hidden truncate" style={{ width: COLUMN_WIDTHS.endDate }}>
                Fin
              </div>
              <div className="flex items-center px-3 font-semibold text-xs text-pink-900 border-r border-pink-200 overflow-hidden truncate" style={{ width: COLUMN_WIDTHS.status }}>
                Estado
              </div>
              <div className="flex items-center px-3 font-semibold text-xs text-pink-900" style={{ width: COLUMN_WIDTHS.actions }} />
            </div>
          </div>

          {/* ROWS - FIXED COLUMNS */}
          <AnimatePresence>
            {Object.entries(tasksByProject).map(([projId, projTasks], projIdx) => {
              const project = projects.find((p) => p.id === projId)
              return (
                <div key={projId}>
                  {/* PROJECT HEADER */}
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: projIdx * 0.1 }}
                    className="h-8 border-b border-pink-100 bg-pink-100 flex items-center px-3 gap-2 flex-shrink-0"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project?.color }}
                    />
                    <span className="text-sm font-semibold text-pink-900 truncate">{project?.name}</span>
                  </motion.div>

                  {/* TASK ROWS */}
                  {projTasks.map((task, taskIdx) => {
                    const taskIndexInProject = getTaskIndexInProject(task.id, task.projectId)
                    const projectTasksCount = getProjectTasksCount(task.projectId)

                    return (
                    <motion.div
                      key={task.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ delay: projIdx * 0.1 + taskIdx * 0.05 }}
                      className="h-10 border-b border-pink-100 hover:bg-pink-50/40 flex flex-shrink-0"
                    >
                      <div className="flex items-center border-r border-pink-100 overflow-hidden" style={{ width: COLUMN_WIDTHS.taskName }}>
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
                          className="flex-1 truncate outline-none px-3 py-2 text-xs text-pink-900 font-medium cursor-text focus:bg-pink-100 focus:ring-2 focus:ring-pink-400 rounded"
                          style={{ minWidth: 0 }}
                        >
                          {task.name}
                        </div>
                      </div>

                      <div className="flex items-stretch border-r border-pink-100 overflow-hidden" style={{ width: COLUMN_WIDTHS.startDate }}>
                        <input
                          type="date"
                          value={task.startDate}
                          onChange={(e) => handleDateChange(task.id, 'startDate', e.target.value, task)}
                          className="flex-1 bg-transparent border-0 px-2 py-2 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer text-xs"
                          style={{ colorScheme: 'light', minWidth: 0 }}
                        />
                      </div>

                      <div className="flex items-stretch border-r border-pink-100 overflow-hidden" style={{ width: COLUMN_WIDTHS.endDate }}>
                        <input
                          type="date"
                          value={task.endDate}
                          onChange={(e) => handleDateChange(task.id, 'endDate', e.target.value, task)}
                          className="flex-1 bg-transparent border-0 px-2 py-2 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer text-xs"
                          style={{ colorScheme: 'light', minWidth: 0 }}
                        />
                      </div>

                      <div className="flex items-stretch border-r border-pink-100 overflow-hidden" style={{ width: COLUMN_WIDTHS.status }}>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`flex-1 bg-transparent border-0 px-2 py-2 outline-none focus:ring-2 focus:ring-pink-400 rounded cursor-pointer text-xs font-medium ${STATUS_COLORS[task.status]}`}
                          style={{ minWidth: 0 }}
                        >
                          <option value="todo">Por hacer</option>
                          <option value="in-progress">En progreso</option>
                          <option value="done">Hecho</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-center gap-1" style={{ width: COLUMN_WIDTHS.actions }}>
                        <button
                          onClick={() => moveTask(task.id, 'up')}
                          disabled={taskIndexInProject === 0}
                          className="p-1 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveTask(task.id, 'down')}
                          disabled={taskIndexInProject === projectTasksCount - 1}
                          className="p-1 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirmDeleteTask ? confirm('¿Eliminar esta tarea?') : true) {
                              deleteTask(task.id)
                            }
                          }}
                          className="p-1 text-pink-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                    )
                  })}
                </div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Border separator */}
        <div className="w-px bg-pink-200 flex-shrink-0" />

        {/* RIGHT PANEL: Header fijo + Body scrollable */}
        <div ref={ganttPanelRef} className="flex-1 flex flex-col overflow-hidden">
          {/* HEADER - GANTT (sincronizado horizontalmente con el body) */}
          <div
            ref={ganttHeaderRef}
            className="flex-shrink-0 overflow-hidden border-b border-pink-200"
            style={{ height: 64 }}
          >
            <div style={{ width: finalViewRange.totalWidth }}>
              <div className="h-6 flex border-b border-pink-200 bg-pink-50">
                {monthHeaders.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center border-r border-pink-200 text-xs font-semibold text-pink-900 flex-shrink-0"
                    style={{ width: `${month.widthPx}px` }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
              <div className="h-10 flex bg-white">
                {dayHeaders.map((header, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center flex-shrink-0 text-xs font-medium border-r border-pink-100 flex-col gap-0.5 ${
                      header.type === 'day' && header.isSunday ? 'bg-pink-50' : 'bg-white'
                    } ${header.isToday ? 'bg-rose-100' : ''}`}
                    style={{ width: `${header.width}px` }}
                  >
                    <span>{header.label}</span>
                    {header.subLabel && <span className="text-xs opacity-75">{header.subLabel}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BODY - GANTT (scrollable en ambos ejes) */}
          <div ref={ganttScrollRef} onScroll={handleGanttScroll} className="flex-1 min-w-0 min-h-0 overflow-auto gantt-scroll bg-white">
            <div style={{ width: finalViewRange.totalWidth }}>
              <AnimatePresence>
                {Object.entries(tasksByProject).map(([projId, projTasks], projIdx) => {
                  return (
                    <div key={projId}>
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: projIdx * 0.1 }}
                        className="h-8 border-b border-pink-100 bg-pink-100 relative flex-shrink-0"
                      />

                      {projTasks.map((task, taskIdx) => {
                        const barStyle = getBarStyle(
                          task,
                          finalViewRange.viewStart,
                          finalViewRange.viewEnd,
                          finalViewRange.totalDays,
                          finalViewRange.dayWidth,
                          ganttZoom
                        )

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ delay: projIdx * 0.1 + taskIdx * 0.05 }}
                            className="h-10 border-b border-pink-100 hover:bg-pink-50/40 relative"
                          >
                            {taskIdx === 0 && (
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none z-5"
                                style={{ left: `${(todayOffset / 100) * finalViewRange.totalWidth}px` }}
                              />
                            )}

                            {barStyle && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: projIdx * 0.1 + taskIdx * 0.05, duration: 0.3 }}
                                style={{
                                  left: barStyle.left,
                                  width: barStyle.width,
                                  transformOrigin: 'left',
                                  minWidth: '4px'
                                }}
                                className={`absolute top-2 h-6 rounded-md shadow-sm transition-shadow cursor-pointer group ${
                                  {
                                    todo: 'bg-pink-300 hover:bg-pink-400',
                                    'in-progress': 'bg-amber-400 hover:bg-amber-500',
                                    done: 'bg-emerald-400 hover:bg-emerald-500'
                                  }[task.status]
                                }`}
                                title={`${task.name}: ${format(parseISO(task.startDate), 'dd/MM')} - ${format(parseISO(task.endDate), 'dd/MM')}`}
                              >
                                {parseFloat(barStyle.width) > 80 && (
                                  <div className="px-2 h-full flex items-center text-xs text-white font-medium truncate group-hover:opacity-80 transition-opacity">
                                    {task.name}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
