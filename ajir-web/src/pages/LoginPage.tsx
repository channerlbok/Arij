import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] =
    useState<string | null>(null)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setLoginError(null)

    const response = await fetch(
      `${API_BASE_URL}/auth/login?useCookies=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      }
    )

    if (!response.ok) {
      setLoginError('Invalid email or password')
      return
    }

    navigate('/projects')
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">M</div>

          <p className="auth-eyebrow">
            PROJECTS, SIMPLIFIED
          </p>

          <h1>Mochu</h1>

          <p className="auth-tagline">
            Turn ideas into organized work and keep every
            project moving forward.
          </p>
        </div>

        <div className="auth-decoration">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="auth-form-panel">
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-form-heading">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h2>Log in to Mochu</h2>
            <p>Enter your account details to continue.</p>
          </div>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={event =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={event =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {loginError && (
            <p className="error-message">{loginError}</p>
          )}

          <button
            className="auth-submit"
            type="submit"
          >
            Log in
          </button>

          <p className="auth-switch">
            New to Mochu?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginPage