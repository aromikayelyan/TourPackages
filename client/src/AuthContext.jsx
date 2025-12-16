import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('tour-user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  const saveUser = (u) => {
    setUser(u)
    if (u) {
      window.localStorage.setItem('tour-user', JSON.stringify(u))
    } else {
      window.localStorage.removeItem('tour-user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser: saveUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}


