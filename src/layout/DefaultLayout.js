import React, { useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useNavigate } from 'react-router-dom'

const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Recuperar los tokens JWT o del login normal
    const access = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    // Si no hay token válido, redirigir al login
    if (!access && !refresh) {
      console.warn('⚠️ No hay token en localStorage, redirigiendo a /login')
      navigate('/login', { replace: true })
      return
    }

    // Si existe token pero no usuario, también redirigir
    if (!user || !user.id) {
      console.warn('⚠️ No se encontró información de usuario, redirigiendo a /login')
      navigate('/login', { replace: true })
      return
    }

    console.log('✅ Usuario autenticado:', user)
  }, [navigate])

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
