import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function RegistrationPage(){
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState<string | null> (null); 

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        setRegisterError(null);
        const cleanedDisplayName = displayName.trim()

        if (cleanedDisplayName === '') {
        setRegisterError('Display name is required')
        return
        }

        if (cleanedDisplayName.length > 50) {
        setRegisterError(
            'Display name cannot exceed 50 characters'
        )
        return
        }
        if(password !== confirmPassword){
            setRegisterError('Passwords do not match');
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({email,password})

            }
        )

        if(!response.ok){
            setRegisterError('Failed to Register Account');
            return;
        }

        const loginResponse = await fetch(
            `${API_BASE_URL}/auth/login?useCookies=true`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                email,
                password
                })
            }
        )

        if(!loginResponse.ok){
            setRegisterError('Failed to Register Account');
            return;
        }
        const profileResponse = await fetch(
            `${API_BASE_URL}/auth/profile`,
            {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    displayName: cleanedDisplayName
                })

            }
        )

        if(!profileResponse.ok){
            setRegisterError('Account created, but the display name could not be saved');
            return;
        }


        navigate('/projects');

    }
    return(
      <main className="auth-page">
        <section className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo">M</div>
            <p className="auth-eyebrow">BUILD WITH CLARITY</p>
            <h1>Mochu</h1>
            <p className="auth-tagline">
              A focused command center for projects, issues, and the work that moves them forward.
            </p>
          </div>
          <div className="auth-decoration"><span /><span /><span /></div>
        </section>
        <section className="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-heading">
              <p className="auth-eyebrow">INITIALIZE WORKSPACE</p>
              <h2>Create your account</h2>
              <p>Set up your identity and start organizing work.</p>
            </div>
            <label>
                Display Name
            <input
                type="text"
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                required 
            />
            </label>
            <label>
                Email
            <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required 
            />
            </label>
            <label>
                Password
            <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required 
            />
            </label>
            <label>
                Confirm Password
            <input
                type="password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                required 
            />
            </label>
            {registerError && (
                <p className="error-message">{registerError}</p>
            )}
            <button type="submit"> 
                Create account
            </button>
            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
        </form>
        </section>
      </main>
    )
}

export default RegistrationPage
