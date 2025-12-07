import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDog,
  cilDrop,
  cilExternalLink,
  cilList,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUsb,
  cilUser,
  cilUserPlus,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    anyOf: ['dashboard:ver'],
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard_Client',
    anyOf: ['dashboard_client:ver'],
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Usuario Interno',
    to: '/user_int',
    anyOf: ['user_int:ver'],
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Matricula',
    to: '/matricula',
    anyOf: ['matricula:ver'],
    icon: <CIcon icon={cilDog} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/asistencia',
    anyOf: ['asistencia:ver'],
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Reportes',
  },
  
  {
    component: CNavItem,
    name: 'Caninos Matriculados',
    to: '/matricula',
    anyOf: ['rematricula:ver'],
    icon: <CIcon icon={cilDog} customClassName="nav-icon" />,
  },

]

export default _nav
