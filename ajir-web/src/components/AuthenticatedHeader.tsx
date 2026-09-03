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
    <>
    <div className="board-planes" aria-hidden="true">
      <span className="board-plane board-plane-one" />
      <span className="board-plane board-plane-two" />
    </div>

    <header className="app-header">
      <Link className="brand" to="/projects">
        <span className="brand-mark">M</span>

        <span className="brand-copy">
          <strong>Mochu</strong>
          <small>WORKSPACE</small>
        </span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        <Link className="main-nav-link active" to="/projects">
          Projects
        </Link>

        <button
          className="main-nav-link mochu-nav-button"
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new Event('open-mochu-assistant')
            )
          }
        >
          ✦ Plan with Mochu
        </button>
      </nav>

      <div className="header-account">
        <span
          className="header-avatar"
          aria-label="Signed-in user"
        >
          {email.charAt(0).toUpperCase() || 'M'}
        </span>

        <span className="header-email">
          {email}
        </span>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </header>
  </>
)
}

export default AuthenticatedHeader