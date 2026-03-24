import Papa from 'papaparse'

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

export function exportToCSV(projects, tasks) {
  const rows = tasks.map((task) => {
    const project = projects.find((p) => p.id === task.projectId)
    return {
      projectName: project?.name ?? '',
      taskName: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      description: task.description ?? ''
    }
  })

  return Papa.unparse(rows, { header: true, quotes: true })
}

export function importFromCSV(csvText) {
  try {
    const { data, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim()
    })

    if (errors.length) {
      throw new Error(`CSV parse error: ${errors[0].message}`)
    }

    const projectMap = {}
    const newProjects = []
    const newTasks = []
    const VALID_STATUSES = ['todo', 'in-progress', 'done']
    let colorIndex = 0

    for (const row of data) {
      const {
        projectName,
        taskName,
        startDate,
        endDate,
        status,
        description
      } = row

      if (!projectName || !taskName || !startDate || !endDate) continue

      const normalizedStatus = VALID_STATUSES.includes(status)
        ? status
        : 'todo'

      if (!projectMap[projectName]) {
        const id = crypto.randomUUID()
        projectMap[projectName] = id
        newProjects.push({
          id,
          name: projectName,
          color:
            PROJECT_COLORS[colorIndex++ % PROJECT_COLORS.length],
          createdAt: new Date().toISOString()
        })
      }

      newTasks.push({
        id: crypto.randomUUID(),
        projectId: projectMap[projectName],
        name: taskName,
        startDate,
        endDate,
        status: normalizedStatus,
        description: description ?? ''
      })
    }

    return { newProjects, newTasks }
  } catch (error) {
    throw new Error(`CSV import failed: ${error.message}`)
  }
}
