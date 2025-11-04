import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import routes from '../routes'
import Guard from '../routes/Guard'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) return null
            const Element = route.element
            return (
              <Route
                key={idx}
                path={route.path}
                exact={route.exact}
                name={route.name}
                element={
                  <Guard meta={route.meta}>
                    <Element />
                  </Guard>
                }
              />
            )
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
