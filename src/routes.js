import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Dashboard_Client = React.lazy(() => import('./views/dashboard_Client/Dashboard_Client'))

// Usuario interno
const User_Int = React.lazy(() => import('./views/user_int/User_Int'))

// Perfil
const Profile = React.lazy(() => import('./views/profile/Profile'))

// Matricula
const Matricula = React.lazy(() => import('./views/matricula/Matricula'))

const Login = React.lazy(() => import('./views/pages/login/Login'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard, meta: { anyOf: ['dashboard:ver'] } },
  { path: '/dashboard_Client', name: 'Dashboard Cliente', element: Dashboard_Client, meta: { anyOf: ['dashboard_client:ver'] } },
  { path: '/login', name: 'Login', element: Login },

  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/user_int', name: 'Usuario Interno', element: User_Int, meta: { anyOf: ['user_int:ver'] } },
  { path: '/matricula', name: 'Matrícula', element: Matricula, meta: { anyOf: ['matricula:ver'] } },
]

export default routes
