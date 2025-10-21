import React, { useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useNavigate } from 'react-router-dom'


const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token') // o la variable que uses para sesión
    if (!token) {
      navigate('/login', { replace: true }) // redirige al login si no hay token
    }
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
