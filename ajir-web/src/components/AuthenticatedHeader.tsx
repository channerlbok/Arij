import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate
} from 'react-router-dom'
import { API_BASE_URL } from '../config'

function AuthenticatedHeader() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadAccountInformation() {
      try {
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
      } catch {
        // The rest of the page will display its own load error.
      }
    }

    loadAccountInformation()
  }, [navigate])

  async function handleLogout() {
    const response = await fetch(
      `${API_BASE_URL}/auth/logout`,
      {
        method: 'POST',
        credentials: 'include'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to log out')
    }

    navigate('/login')
  }

  return (
    <header className="app-header">
      <Link className="app-brand" to="/projects">
        <span className="app-brand-mark">M</span>

        <span>
          <strong>Mochu</strong>
          <small>Workspace</small>
        </span>
      </Link>

      <div className="app-header-actions">
        <span className="user-avatar">
          {email ? email.charAt(0).toUpperCase() : 'M'}
        </span>

        <span className="header-email">{email}</span>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default AuthenticatedHeader