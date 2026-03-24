import Toolbar from './Toolbar'
import GanttView from './GanttView'

export default function MainContent() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toolbar />
      <GanttView />
    </div>
  )
}
