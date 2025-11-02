import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { logo } from 'src/assets/brand/logo'
import 'src/scss/patterns.scss'

const strongPassRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const API_BASE = import.meta.env.VITE_API_BASE

const ChangePassword = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 👇 Vienen desde /code
  const email = location?.state?.email || ''
  const token = location?.state?.token || ''

  const [values, setValues] = useState({ pass: '', pass2: '' })
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverMsg, setServerMsg] = useState('')

  const setField = (field, val) => setValues((v) => ({ ...v, [field]: val }))
  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const validate = (v = values) => {
    const e = {}
    if (!strongPassRe.test(v.pass))
      e.pass = 'Mín. 8 caracteres, con mayúscula, número y símbolo.'
    if (v.pass2 !== v.pass) e.pass2 = 'Las contraseñas no coinciden.'
    return e
  }

  const invalid = (field) => touched[field] && !!errors[field]

  const onSubmit = async (e) => {
    e.preventDefault()
    const eNow = validate()
    setErrors(eNow)
    setTouched({ pass: true, pass2: true })
    setServerMsg('')

    if (Object.keys(eNow).length > 0) return
    if (!token) {
      setServerMsg('No se encontró el token. Regresa y solicita uno nuevo.')
      return
    }

    try {
      setLoading(true)

      // 🔥 Llamada real al backend
      const res = await fetch(`${API_BASE}/password_reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          password: values.pass.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || 'Error al cambiar la contraseña.')
      }

      setServerMsg('✅ Tu contraseña fue actualizada correctamente.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setServerMsg(err?.message || 'No se pudo cambiar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-bg-pattern min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm noValidate onSubmit={onSubmit}>
                  <div className="text-center mb-4">
                    <h1>Cambia tu contraseña</h1>
                    <CIcon icon={logo} height={120} className="my-3 text-primary" />
                    <p className="text-body-secondary">
                      Introduce tu nueva contraseña para continuar.
                    </p>
                  </div>

                  {/* Nueva contraseña */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      value={values.pass}
                      type="password"
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                      onChange={(e) => setField('pass', e.target.value)}
                      onBlur={() => {
                        markTouched('pass')
                        setErrors(validate())
                      }}
                      invalid={invalid('pass')}
                      required
                    />
                    <CFormFeedback invalid>{errors.pass}</CFormFeedback>
                  </CInputGroup>

                  {/* Repetir contraseña */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      value={values.pass2}
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      autoComplete="new-password"
                      onChange={(e) => setField('pass2', e.target.value)}
                      onBlur={() => {
                        markTouched('pass2')
                        setErrors(validate())
                      }}
                      invalid={invalid('pass2')}
                      required
                    />
                    <CFormFeedback invalid>{errors.pass2}</CFormFeedback>
                  </CInputGroup>

                  {serverMsg && (
                    <p
                      className={`small mb-3 ${
                        serverMsg.startsWith('✅') ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {serverMsg}
                    </p>
                  )}

                  <CCol xs={12}>
                    <div className="d-grid">
                      <CButton color="success" size="lg" type="submit" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                      </CButton>
                    </div>
                  </CCol>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ChangePassword
