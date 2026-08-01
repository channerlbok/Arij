
import ProjectsPage from './pages/ProjectsPage'
import './App.css'

import { Navigate, Route, Routes} from 'react-router-dom'
import ProjectIssuesPage from './pages/ProjectIssuesPage'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'


function App(){
  return(
    <Routes>
      <Route
        path="/register"
        element={<RegistrationPage/>}
      />  
      <Route
        path="/login"
        element={<LoginPage/>}
      />
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
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