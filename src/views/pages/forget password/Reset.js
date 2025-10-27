import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CFormFeedback
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { logo } from 'src/assets/brand/logo'
import { authService } from 'src/services/authService'
import 'src/scss/patterns.scss'

// Contraseña fuerte: Mayúscula, minúscula, número, símbolo, 8+ chars
const strongPassRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const ChangePassword = () => {
  const navigate = useNavigate()

  const [values, setValues] = useState({
    pass: '',
    pass2: '',
  })

  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverMsg, setServerMsg] = useState('')

  const setField = (field, val) => setValues(v => ({ ...v, [field]: val }))
  const markTouched = (field) => setTouched(t => ({ ...t, [field]: true }))

  const validate = (v = values) => {
    const e = {}
    if (!strongPassRe.test(v.pass)) e.pass = 'Mín. 8, con mayúscula, número y símbolo.'
    if (v.pass2 !== v.pass) e.pass2 = 'Las contraseñas no coinciden.'
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const eNow = validate()
    setErrors(eNow)
    setTouched({ pass: true, pass2: true })
    if (Object.keys(eNow).length > 0) return

    setLoading(true)
    setServerMsg('')
    try {
      // El backend debe tomar el token/código del contexto (URL/sesión).
      await authService.resetPassword({ newPassword: values.pass })
      alert('¡Listo! Tu contraseña fue actualizada.')
      navigate('/login')
      
    } catch (err) {
      const msg = err?.message || 'No se pudo cambiar la contraseña. Intenta de nuevo.'
      setServerMsg(msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const invalid = (field) => touched[field] && !!errors[field]

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
                    <CIcon icon={logo} height={140} className="my-2 text-primary" />
                    <p className="text-body-secondary">
                      Cambia tu contraseña para mantener tu cuenta segura y continuar brindándole a tu peludo la mejor experiencia de entrenamiento.
                    </p>
                  </div>

                  {/* Nueva contraseña */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      value={values.pass}
                      type="password"
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                      onChange={e => setField('pass', e.target.value)}
                      onBlur={() => { markTouched('pass'); setErrors(validate()) }}
                      className={invalid('pass') ? 'is-invalid' : ''}
                      required
                    />
                    <CFormFeedback invalid>{errors.pass}</CFormFeedback>
                  </CInputGroup>

                  {/* Repetir contraseña */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      value={values.pass2}
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      autoComplete="new-password"
                      onChange={e => setField('pass2', e.target.value)}
                      onBlur={() => { markTouched('pass2'); setErrors(validate()) }}
                      className={invalid('pass2') ? 'is-invalid' : ''}
                      required
                    />
                    <CFormFeedback invalid>{errors.pass2}</CFormFeedback>
                  </CInputGroup>

                  {/* Reglas cortas (opcional) */}
                  <p className="text-body-secondary small mb-3">
                    Debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.
                  </p>

                  {/* Mensaje del servidor */}
                  {serverMsg && <p className="text-danger small mb-3">{serverMsg}</p>}

                  {/* Botón */}
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
