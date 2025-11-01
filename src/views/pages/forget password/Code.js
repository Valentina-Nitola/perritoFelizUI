import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

const Code = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const emailFromState = location?.state?.email || ''
  const emailFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location.search)
    return sp.get('email') || ''
  }, [location.search])

  const email = emailFromState || emailFromQuery

  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [errors, setErrors] = useState({ code: '' })
  const [loading, setLoading] = useState(false)
  const [serverMsg, setServerMsg] = useState('')
  const [serverErr, setServerErr] = useState('')

  const validate = (value) => {
    const err = { code: '' }
    if (!value.trim()) {
      err.code = 'El token es obligatorio.'
    } else if (value.trim().length < 10) {
      err.code = 'El token parece demasiado corto.'
    }
    return err
  }

  const handleChange = (e) => {
    const v = e.target.value.trim()
    setCode(v)
    if (touched) setErrors(validate(v))
  }

  const handleBlur = () => {
    if (!touched) setTouched(true)
    setErrors(validate(code))
  }

  useEffect(() => {
    setServerMsg('')
    setServerErr('')
  }, [code])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    const v = validate(code)
    setErrors(v)
    setServerMsg('')
    setServerErr('')

    if (v.code) return
    if (!email) {
      setServerErr('No se detectó el correo asociado. Regresa y solicita el código nuevamente.')
      return
    }

    try {
      setLoading(true)

      // ✅ Verificar el token real con django_rest_passwordreset
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/password_reset/validate_token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || 'Código inválido o expirado')
      }

      setServerMsg('Código verificado correctamente.')
      // Redirigir al paso de restablecimiento de contraseña
      navigate('/reset', {
        replace: true,
        state: { email: email.trim(), token: code.trim() },
      })
    } catch (err) {
      setServerErr(err?.message || 'No pudimos validar el código. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!email) {
      setServerErr('No se detectó el correo asociado.')
      return
    }
    try {
      setLoading(true)
      setServerMsg('')
      setServerErr('')

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/password_reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) throw new Error('No se pudo reenviar el código.')

      setServerMsg('Si el correo existe, reenviamos un nuevo código. Revisa tu bandeja y SPAM.')
    } catch (err) {
      setServerErr(err?.message || 'No se pudo reenviar el código. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const isInvalid = Boolean(touched && errors.code)

  return (
    <div className="page-bg-pattern min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit} noValidate>
                  <h1>Verifica tu código</h1>
                  <p className="text-body-secondary">
                    Ingresa el código de verificación enviado a <strong>{email || 'tu correo'}</strong>.
                  </p>

                  <CInputGroup className="mb-1">
                    <CInputGroupText>#</CInputGroupText>
                    <CFormInput
                      type="text"
                      placeholder="Pega el token recibido por correo"
                      value={code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={isInvalid}
                      required
                    />
                    <CFormFeedback invalid role="alert">
                      {errors.code}
                    </CFormFeedback>
                  </CInputGroup>

                  <div className="d-grid mt-2">
                    <CButton color="success" type="submit" disabled={loading}>
                      {loading ? 'Verificando…' : 'Verificar código'}
                    </CButton>
                  </div>

                  <div className="d-grid mt-2">
                    <CButton
                      color="secondary"
                      type="button"
                      variant="outline"
                      onClick={resendCode}
                      disabled={loading || !email}
                    >
                      Reenviar código
                    </CButton>
                  </div>

                  {serverErr && (
                    <div className="mt-3">
                      <small className="text-danger">{serverErr}</small>
                    </div>
                  )}
                  {serverMsg && (
                    <div className="mt-2">
                      <small className="text-body-secondary">{serverMsg}</small>
                    </div>
                  )}

                  {!email && (
                    <div className="mt-2">
                      <small className="text-warning">
                        No detectamos un correo. Regresa y solicita el código nuevamente.
                      </small>
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

export default Code