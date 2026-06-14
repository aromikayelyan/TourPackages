// import { useState } from 'react'
// import { loginUser, registerUser } from '../api.js'
// import { useAuth } from '../AuthContext.jsx'

// function AuthPage() {
//   const { setUser } = useAuth()
//   const [mode, setMode] = useState('login')
//   const [form, setForm] = useState({
//     Username: '',
//     email: '',
//     password: '',
//   })
//   const [error, setError] = useState('')

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     try {
//       if (mode === 'login') {
//         const res = await loginUser({ email: form.email, password: form.password })
//         setUser(res.data.user)
//       } else {
//         const res = await registerUser(form)
//         setUser(res.data.user)
//       }
//     } catch (err) {
//       console.error(err)
//       setError(err.response?.data?.message || 'Request failed')
//     }
//   }

//   return (
//     <div className="page">
//       <h1>{mode === 'login' ? 'Sign in' : 'Sign up'}</h1>
//       <div className="auth-toggle">
//         <button
//           className={mode === 'login' ? 'btn primary' : 'btn secondary'}
//           onClick={() => setMode('login')}
//         >
//           Sign in
//         </button>
//         <button
//           className={mode === 'register' ? 'btn primary' : 'btn secondary'}
//           onClick={() => setMode('register')}
//         >
//           Sign up
//         </button>
//       </div>

//       <form className="form" onSubmit={handleSubmit}>
//         {mode === 'register' && (
//           <label>
//             Username
//             <input
//               name="Username"
//               value={form.Username}
//               onChange={handleChange}
//               required
//             />
//           </label>
//         )}
//         <label>
//           Email
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />
//         </label>
//         <label>
//           Password
//           <input
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//         </label>
//         <button type="submit" className="btn primary">
//           {mode === 'login' ? 'Sign in' : 'Create account'}
//         </button>
//       </form>

//       {error && <p className="error">{error}</p>}

//       {/* user preview теперь в ProfilePage */}
//     </div>
//   )
// }

// export default AuthPage


import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // 1. Импортируем хук навигации
import { loginUser, registerUser } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function AuthPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate() // 2. Инициализируем навигацию
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        const res = await loginUser({ email: form.email, password: form.password })
        setUser(res.data.user)
      } else {
        const res = await registerUser(form)
        setUser(res.data.user)
      }
      
      // 3. После успешного setUser перенаправляем пользователя
      // Замените '/profile' или '/' на нужный вам путь домашней страницы/профиля
      navigate('/profile') 

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Request failed')
    }
  }

  return (
    <div className="page">
      <h1>{mode === 'login' ? 'Sign in' : 'Sign up'}</h1>
      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'btn primary' : 'btn secondary'}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          className={mode === 'register' ? 'btn primary' : 'btn secondary'}
          onClick={() => setMode('register')}
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