import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function LoginPage(){
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null)


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoginError(null)

        const response = await fetch(
            `${API_BASE_URL}/auth/login?useCookies=true`,
            {
                method: 'Post',
                headers: {
                    'Content-Type' : 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({email,password})
            }
        )
        if(!response.ok){
            setLoginError('Invalid email or password')
            return
        }

        navigate('/projects')
    }
    return(
        <form onSubmit={handleSubmit}>
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
            {loginError && (
                <p className="error-message">{loginError}</p>
            )}
            <button type="submit"> 
                Log in
            </button>
            <Link to="/register">Create an account</Link>
        </form>
    )
}
export default LoginPage