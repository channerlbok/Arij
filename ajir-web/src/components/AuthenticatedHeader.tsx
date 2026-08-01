import { Link, useNavigate } from 'react-router-dom'
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
<header className="authenticated-header">
  <Link to="/projects">Mochu</Link>

  <div>
    {email && <span>{email}</span>}
    <button type="button" onClick={handleLogout}>
      Log out
    </button>
  </div>
</header>
)
}
export default AuthenticatedHeader