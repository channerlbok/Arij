import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function RegistrationPage(){
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState<string | null> (null); 

    async function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        setRegisterError(null);

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

        navigate('/login');

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