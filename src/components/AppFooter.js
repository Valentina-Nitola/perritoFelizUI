import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    /**Texto del pie de pagina por lo que por aqui se puede editar */
    <CFooter className="px-4">
      <div>
        <a
          href="https://github.com/Valentina-Nitola/perritoFelizUI"
          target="_blank"
          rel="noopener noreferrer"
        >
          CoreUI
        </a>
        <span className="ms-1">&copy; 2025 Grupo 4.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React Admin &amp; Dashboard Template
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
