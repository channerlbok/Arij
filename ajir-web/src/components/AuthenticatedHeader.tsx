import { Link, NavLink, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { useEffect, useState } from 'react'

function AuthenticatedHeader(){
    const navigate = useNavigate()
    const [email, setEmail] = useState('')

useEffect(() => {
  async function showEmail() {
    const response = await fetch(
      `${API_BASE_URL}/auth/manage/info`,
      {
        credentials: 'include'
      }
    )

    if (response.status === 401) {
      navigate('/login')
      return
    }

    if (!response.ok) {
      return
    }

    const data: { email: string } =
      await response.json()

    setEmail(data.email)
  }

  showEmail()
}, [navigate])

    async function handleLogout(){
      const response = await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
          method : 'POST',
          credentials : 'include'
        }
      );
      if (!response.ok) {
        throw new Error('Failed to log out')
      }
      navigate('/login');
    }

return (
  <div className="sidebar-content">
    <div>
      <Link className="sidebar-brand" to="/projects">
        <span className="brand-mark">M</span>
        <span>Mochu</span>
      </Link>

      <nav className="sidebar-nav">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Projects
        </NavLink>
      </nav>
    </div>

    <div className="sidebar-account">
      {email && <span className="account-email">{email}</span>}

      <button
        className="logout-button"
        type="button"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  </div>
)
}
export default AuthenticatedHeader