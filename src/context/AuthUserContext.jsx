import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthUserContext = createContext(null)

export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    } catch {}
  }, [user])

  const updateUser = (patch) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...patch }
      return next
    })
  }

  const value = { user, setUser, updateUser }
  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

export const useAuthUser = () => useContext(AuthUserContext)
