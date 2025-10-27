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

// Solo dígitos
const digitsRe = /^[0-9]+$/

const Code = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // email desde navigate('/code', { state: { email } }) o ?email=
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
      err.code = 'El código es obligatorio.'
    } else if (!digitsRe.test(value.trim())) {
      err.code = 'El código solo debe contener números.'
    } else if (value.trim().length < 6) {
      err.code = 'El código debe tener al menos 6 dígitos.'
    }
    return err
  }

  const handleChange = (e) => {
    const v = e.target.value.replace(/\s+/g, '')
    // solo permitimos limpiar o números
    if (v === '' || digitsRe.test(v)) {
      setCode(v)
      if (touched) setErrors(validate(v))
    }
  }

  const handleBlur = () => {
    if (!touched) setTouched(true)
    setErrors(validate(code))
  }

  useEffect(() => {
    // limpiar mensajes al cambiar el code
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

      // 🚀 LLAMADA AL BACKEND: verificar código
      // Descomenta y ajusta a tu servicio real:
      /*
      const res = await fetch('/auth/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      if (!res.ok) {
        // opcional: leer mensaje del backend
        // const data = await res.json().catch(() => ({}))
        // throw new Error(data?.message || 'Código inválido o expirado')
        throw new Error('Código inválido o expirado')
      }
      */

      // 🔹 Simulación temporal (quítala al conectar el back)
      await new Promise((r) => setTimeout(r, 800))

      setServerMsg('Código verificado correctamente.')
      // ✅ Redirigir a la pantalla de reset (lleva email y token/código)
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

  const Code = async () => {
    if (!email) {
      setServerErr('No se detectó el correo asociado.')
      return
    }
    try {
      setLoading(true)
      setServerMsg('')
      setServerErr('')

      // 🚀 LLAMADA AL BACKEND: reenviar código
      // Descomenta y ajusta a tu servicio real:
      /*
        const res = await fetch('/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo reenviar el código.')
      */

      // 🔹 Simulación temporal
      await new Promise((r) => setTimeout(r, 800))
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
                      inputMode="numeric"
                      placeholder="Código de 6 dígitos"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={isInvalid}
                      required
                      maxLength={6}
                      aria-describedby="codeHelp"
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
