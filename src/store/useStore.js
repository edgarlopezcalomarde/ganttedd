import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // State
      projects: [],
      tasks: [],
      selectedProjectId: null,
      activeView: 'gantt',

      projectModalOpen: false,
      projectModalData: null,
      columnSelectorOpen: false,

      ganttZoom: 'month', // 'day', 'week', 'month', 'year'
      visibleGanttColumns: ['name', 'startDate', 'endDate', 'status'],
      searchTerm: '',
      statusFilter: 'all',
      sidebarCollapsed: false,
      confirmDeleteTask: true,

      // Project Actions
      addProject: (name, color) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: crypto.randomUUID(),
              name,
              color,
              createdAt: new Date().toISOString()
            }
          ]
        })),

      updateProject: (id, patches) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...patches } : p
          )
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          selectedProjectId:
            state.selectedProjectId === id ? null : state.selectedProjectId
        })),

      // Task Actions
      addTask: (projectId, fields) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              projectId,
              status: 'todo',
              description: '',
              ...fields
            }
          ]
        })),

      updateTask: (id, patches) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...patches } : t
          )
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        })),

      // Modal Actions
      openProjectModal: (project = null) =>
        set({
          projectModalOpen: true,
          projectModalData: project
        }),

      closeProjectModal: () =>
        set({
          projectModalOpen: false,
          projectModalData: null
        }),

      openColumnSelector: () => set({ columnSelectorOpen: true }),
      closeColumnSelector: () => set({ columnSelectorOpen: false }),

      // View Actions
      setView: (view) => set({ activeView: view }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setGanttZoom: (zoom) => set({ ganttZoom: zoom }),
      setVisibleGanttColumns: (columns) => set({ visibleGanttColumns: columns }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setConfirmDeleteTask: (value) => set({ confirmDeleteTask: value }),

      // Data Import
      importData: (newProjects, newTasks) =>
        set((state) => ({
          projects: [...state.projects, ...newProjects],
          tasks: [...state.tasks, ...newTasks]
        })),

      // Data Export
      exportData: () => {
        const state = get()
        return { projects: state.projects, tasks: state.tasks }
      }
    }),
    {
      name: 'ganttedd-store',
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        selectedProjectId: state.selectedProjectId,
        ganttZoom: state.ganttZoom,
        visibleGanttColumns: state.visibleGanttColumns,
        searchTerm: state.searchTerm,
        statusFilter: state.statusFilter,
        sidebarCollapsed: state.sidebarCollapsed,
        confirmDeleteTask: state.confirmDeleteTask
      })
    }
  )
)
