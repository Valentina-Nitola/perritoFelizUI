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
  CFormFeedback,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import 'src/scss/patterns.scss'


// Valida que se escriba un correo con la estructura correcta
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Puedes pasar onRequested como prop para navegar o llamar a tu API
// Ej: <Password onRequested={(email)=> navigate('/reset/confirm?email='+encodeURIComponent(email))} />
const Password = ({ onRequested }) => {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [errors, setErrors] = useState({ email: '' })
  const [loading, setLoading] = useState(false)
  const [serverMsg, setServerMsg] = useState('') 

  const navigate = useNavigate()

  const validate = (value) => {
    const err = { email: '' }
    if (!value.trim()) {
      err.email = 'El correo es obligatorio.'
    } else if (!emailRe.test(value.trim())) {
      err.email = 'Escribe un correo válido (ej. usuario@dominio.com).'
    }
    return err
  }

  const handleChange = (e) => {
    const v = e.target.value
    setEmail(v)
    // validación en tiempo real si ya fue tocado
    if (touched) setErrors(validate(v))
  }

  const handleBlur = () => {
    if (!touched) setTouched(true)
    setErrors(validate(email))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    const v = validate(email)
    setErrors(v)
    setServerMsg('')

    if (v.email) return

    // Aquí ya está validado el correo en frontend
    // Si quieres llamar a tu API desde aquí, descomenta el bloque de fetch:
    try {
      setLoading(true)

      // Ejemplo de llamada (neutral: siempre dice "ok" si existe o no)
      // const res = await fetch('/auth/password-reset/request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim() }),
      // })
      // if (!res.ok) throw new Error('No se pudo solicitar el código.')
      // const data = await res.json()

       navigate('/code', { state: { email: email.trim() } })
    } catch (err) {
      setServerMsg('Ocurrió un problema al solicitar el código. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const isInvalid = Boolean(touched && errors.email)

  return (
    <div className="page-bg-pattern min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit} noValidate>
                  <h1>¿Olvidaste tu contraseña?</h1>
                  <p className="text-body-secondary">
                    Ingresa tu correo electrónico para recibir un código de verificación.
                  </p>

                  <CInputGroup className="mb-1">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Correo electrónico"
                      autoComplete="email"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={isInvalid}
                      required
                      aria-describedby="emailHelp"
                    />
                    <CFormFeedback invalid role="alert">
                      {errors.email}
                    </CFormFeedback>
                  </CInputGroup>

                  <div className="d-grid mt-2">
                    <CButton color="success" type="submit" disabled={loading}>
                      {loading ? 'Enviando...' : 'Recuperar contraseña'}
                    </CButton>
                  </div>

                  {serverMsg && (
                    <div className="mt-3">
                      <small className="text-body-secondary">{serverMsg}</small>
                    </div>
                  )}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Password
