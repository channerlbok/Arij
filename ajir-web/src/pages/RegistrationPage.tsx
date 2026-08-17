import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
        <form onSubmit={handleSubmit}>
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
                Register
            </button>
        </form>
    )
}

export default RegistrationPage