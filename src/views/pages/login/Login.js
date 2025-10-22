import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { authService } from '../../../services/authService'

const Login = () => {
  const [documento, setDocumento] = useState('')
  const [password, setPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef(null)

  const navigate = useNavigate() 

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITEKEY
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

  const handleCaptchaChange = (value) => setRecaptchaToken(value)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!documento || !password) {
      alert('Por favor, completa documento y contraseña')
      return
    }
    if (!recaptchaToken) {
      alert('Por favor, confirma que no eres un robot')
      return
    }

    try {
      setLoading(true)
      await authService.verifyRecaptcha(recaptchaToken)
      const data = await authService.login({ documento, password, recaptchaToken })
      localStorage.setItem('token', data.token || 'mock-token')
      localStorage.setItem('user', JSON.stringify(data.user || { id: 1, name: 'Demo' }))

      console.log('Login OK', data)

      navigate('/dashboard')

    } catch (err) {
      console.error(err)
      alert(err.message)
      if (recaptchaRef.current) recaptchaRef.current.reset()
      setRecaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !!documento && !!password && !!recaptchaToken && !loading

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Iniciar Sesión</h1>
                    <p className="text-body-secondary">
                      Recuerda que debes iniciar sesión con el documento de identidad con el cual te registraste
                    </p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Documento de identidad"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        autoComplete="off"
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                      />
                    </CInputGroup>

                    <div className="mb-3 d-flex justify-content-center">
                      {siteKey ? (
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={siteKey}
                          onChange={handleCaptchaChange}
                        />
                      ) : (
                        <small className="text-danger">
                          Falta configurar <code>VITE_RECAPTCHA_SITEKEY</code> en el .env del frontend
                        </small>
                      )}
                    </div>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={!canSubmit}>
                          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          ¿Olvidaste tu contraseña?
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Nota visible de modo mock */}
                    {useMocks && (
                      <p className="mt-3 text-body-secondary" style={{ fontSize: 12 }}>
                        Modo sin backend activado (mock). Usa documento <code>123</code> y contraseña <code>perrito</code>.
                      </p>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Crea tu cuenta</h2>
                    <p>
                      Convierte el amor por tu mascota en su mejor versión. ¡Regístrate y empieza su camino hacia la obediencia y la grandeza!
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        ¡Regístrate ahora!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
