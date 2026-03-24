import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import ProjectModal from './components/ProjectModal'
import ColumnSelectorModal from './components/ColumnSelectorModal'

export default function App() {
  return (
    <div className="flex h-screen bg-pink-50 overflow-hidden">
      <Sidebar />
      <MainContent />
      <ProjectModal />
      <ColumnSelectorModal />
    </div>
  )
}
