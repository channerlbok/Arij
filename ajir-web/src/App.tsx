
import ProjectsPage from './pages/ProjectsPage'
import './App.css'

import { Navigate, Route, Routes} from 'react-router-dom'
import ProjectIssuesPage from './pages/ProjectIssuesPage'



function App(){
  return(
        <Routes>
      <Route
        path="/"
        element={<Navigate to="/projects" replace />}
      />

      <Route
        path="/projects"
        element={<ProjectsPage />}
      />

      <Route
        path="/projects/:projectId/issues"
        element={<ProjectIssuesPage />}
      />
    </Routes>
  )
}


export default App