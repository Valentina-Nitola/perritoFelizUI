import React, { useState } from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCreditCard, cilLockLocked, cilSettings, cilUser, cilDog } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthUser } from 'src/context/AuthUserContext'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthUser()    // 👈 también tomamos setUser del contexto
  const [imgOk, setImgOk] = useState(true)

  const initials = ((user?.name?.[0] || '') + (user?.lastname?.[0] || '')).toUpperCase() || 'PF'
  const avatarSrc = user?.avatarUrl || ''

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    navigate('/login', { replace: true })
  }


  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {avatarSrc ? (
          <CAvatar
            src={avatarSrc}
            shape="rounded-circle"
            style={{
              width: 40,
              height: 40,
              overflow: 'hidden',
              border: '2px solid var(--cui-border-color)',
            }}
          >
      
            <img
              src={avatarSrc}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </CAvatar>
        ) : (
          <CAvatar
            color="primary"
            shape="rounded-circle"
            style={{ width: 40, height: 40 }}
          >
            {initials}
          </CAvatar>
        )}
      </CDropdownToggle>
        

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Configuración
        </CDropdownHeader>

        <CDropdownItem onClick={() => navigate('/profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>

        <CDropdownItem onClick={() => navigate('/pets')}>
          <CIcon icon={cilDog} className="me-2" />
          Mascotas
          <CBadge color="primary" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownItem onClick={() => navigate('/settings')}>
          <CIcon icon={cilSettings} className="me-2" />
          Ajustes
        </CDropdownItem>

        <CDropdownItem onClick={() => navigate('/payments')}>
          <CIcon icon={cilCreditCard} className="me-2" />
          Pagos
          <CBadge color="secondary" className="ms-2">42</CBadge>
        </CDropdownItem>

        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
