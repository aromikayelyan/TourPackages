import { useState } from 'react'
import { loginUser, registerUser } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function AuthPage() {
  const { setUser } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    Username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Очищаем ошибки и форму при смене режима
  const handleModeChange = (newMode) => {
    setMode(newMode)
    setError('')
    setForm({ Username: '', email: '', password: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        const res = await loginUser({ email: form.email, password: form.password })
        // loginUser возвращает { data: { user, token } }
        setUser(res.data.user)
      } else {
        const res = await registerUser(form)
        // registerUser возвращает { data: newUser }
        // Берем напрямую res.data, так как там лежит созданный юзер
        setUser(res.data)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Request failed')
    }
  }

  return (
    <div className="page">
      <h1>{mode === 'login' ? 'Sign in' : 'Sign up'}</h1>
      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'btn primary' : 'btn secondary'}
          onClick={() => handleModeChange('login')}
        >
          Sign in
        </button>
        <button
          className={mode === 'register' ? 'btn primary' : 'btn secondary'}
          onClick={() => handleModeChange('register')}
        >
          Sign up
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Username
            <input
              name="Username"
              value={form.Username}
              onChange={handleChange}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="btn primary">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default AuthPage