import React, { useState } from 'react'
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
  CFormSelect, 
  CFormFeedback
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBadge, cilCreditCard, cilHouse, cilLockLocked, cilPhone, cilUser } from '@coreui/icons'
import { logo } from 'src/assets/brand/logo'
import { authService } from 'src/services/authService'
import 'src/scss/patterns.scss'

// Valedia que el nombre contenga caracteres validos y que no sea corto
const nameRe = /^[A-Za-zÀ-ÿ\u00f1\u00d1 ]{2,60}$/
// Limita caracteres especiales y/o letras, solo se puede escribir numeros
const digitsRe = /^[0-9]+$/
// Valida que se escriba un correo con la estructura correcta
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Valida que se escriba una contraseña con todos los requisitos (May. min. sim, num, min 8 caracter)
const strongPassRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const Register = () => {
  const [values, setValues] = useState({
    nombres: '', apellidos: '', tipoDoc: '', nroDoc: '',
    celular: '', correo: '', direccion: '', pass: '', pass2: ''
  })

  // Valida que campos el usuario ya selecciono
  const [touched, setTouched] = useState({})
  // Guarda los errores que se detectan al validar
  const [errors, setErrors] = useState({})
  // Indica el procesamiento del formulario
  const [loading, setLoading] = useState(false)
  // Guarda los resultados de la validaciones a BD
  const [remote, setRemote] = useState({ emailTaken: false, docTaken: false })

  const setField = (field, val) => setValues(v => ({ ...v, [field]: val }))
  const markTouched = (field) => setTouched(t => ({ ...t, [field]: true }))

  const validate = (v = values) => {
    const e = {}
    if (!nameRe.test(v.nombres)) e.nombres = 'Ingresa un nombre válido.'
    if (!nameRe.test(v.apellidos)) e.apellidos = 'Ingresa apellidos válidos.'
    if (!v.tipoDoc) e.tipoDoc = 'Selecciona un tipo de documento.'
    if (!digitsRe.test(v.nroDoc) || v.nroDoc.length < 6 || v.nroDoc.length > 12) e.nroDoc = 'Solo dígitos (6–12).'
    if (!digitsRe.test(v.celular) || v.celular.length !== 10) e.celular = 'Solo dígitos (10).'
    if (!emailRe.test(v.correo)) e.correo = 'Correo no válido.'
    if (!strongPassRe.test(v.pass)) e.pass = 'Mín. 8, con mayúscula, número y símbolo.'
    if (v.pass2 !== v.pass) e.pass2 = 'Las contraseñas no coinciden.'
    return e
  }

  const checkEmailRemote = async () => {
    if (!emailRe.test(values.correo)) return
    try {
      const { exists } = await authService.checkEmail(values.correo)
      setRemote(r => ({ ...r, emailTaken: !!exists }))
    } catch {}
  }

  const checkDocRemote = async () => {
    if (!digitsRe.test(values.nroDoc) || values.nroDoc.length < 6) return
    try {
      const { exists } = await authService.checkDocumento(values.nroDoc)
      setRemote(r => ({ ...r, docTaken: !!exists }))
    } catch {}
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const eNow = validate()
    setErrors(eNow)
    setTouched({
      nombres: true, apellidos: true, tipoDoc: true, nroDoc: true,
      celular: true, correo: true, direccion: true, pass: true, pass2: true
    })
    if (Object.keys(eNow).length > 0) return

    setLoading(true)
    try {
      const payload = {
        firstName: values.nombres.trim(),
        lastName: values.apellidos.trim(),
        documentType: values.tipoDoc,
        documentNumber: values.nroDoc,
        phone: values.celular,
        email: values.correo.trim(),
        address: values.direccion.trim(),
        password: values.pass,
      }
      await authService.register(payload)
      alert('Cuenta creada con éxito.')
      
      navigate('/login')
    } catch (err) {
      if (err.status === 409) {
        const msg = (err.data?.field || '').toLowerCase()
        if (msg.includes('email')) setRemote(r => ({ ...r, emailTaken: true }))
        if (msg.includes('document')) setRemote(r => ({ ...r, docTaken: true }))
      }
      alert(err.message || 'Error registrando el usuario.')
    } finally {
      setLoading(false)
    }
  }

  const invalid = (field) => touched[field] && (errors[field] || (field === 'correo' && remote.emailTaken) || (field === 'nroDoc' && remote.docTaken))

  return (
    <div className="page-bg-pattern min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm noValidate onSubmit={onSubmit}>
                  <div className="text-center mb-4">
                    <h1>Crea tu cuenta</h1>
                    <CIcon icon={logo} height={140} className="my-2 text-primary" />
                    <p className="text-body-secondary">
                      Ingresa tus datos para crear tu cuenta y comenzar el camino hacia una mejor conexión con tu mascota. Te acompañaremos en cada paso para que juntos alcancen grandes logros.
                    </p>
                  </div>

                  <CRow className="g-4">
                    {/* Nombres */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                        <CFormInput
                          value={values.nombres}
                          placeholder="Nombres"
                          autoComplete="given-name"
                          onChange={e => setField('nombres', e.target.value)}
                          onBlur={() => { markTouched('nombres'); setErrors(validate()) }}
                          className={invalid('nombres') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>{errors.nombres}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Apellidos */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                        <CFormInput
                          value={values.apellidos}
                          placeholder="Apellidos"
                          autoComplete="family-name"
                          onChange={e => setField('apellidos', e.target.value)}
                          onBlur={() => { markTouched('apellidos'); setErrors(validate()) }}
                          className={invalid('apellidos') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>{errors.apellidos}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Tipo documento */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                        <CFormSelect
                          value={values.tipoDoc}
                          onChange={e => setField('tipoDoc', e.target.value)}
                          onBlur={() => { markTouched('tipoDoc'); setErrors(validate()) }}
                          className={invalid('tipoDoc') ? 'is-invalid' : ''}
                          required
                        >
                          <option value="">Tipo de documento</option>
                          <option value="CC">Cédula de ciudadanía</option>
                          <option value="TI">Tarjeta de identidad</option>
                          <option value="CE">Cédula de extranjería</option>
                          <option value="PA">Pasaporte</option>
                        </CFormSelect>
                        <CFormFeedback invalid>{errors.tipoDoc}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Número documento */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilCreditCard} /></CInputGroupText>
                        <CFormInput
                          value={values.nroDoc}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Número de documento"
                          autoComplete="off"
                          maxLength={12}
                          onChange={e => setField('nroDoc', e.target.value)}
                          onBlur={() => { markTouched('nroDoc'); setErrors(validate()); checkDocRemote() }}
                          onKeyDown={(e) => {
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') e.preventDefault()
                          }}
                          className={invalid('nroDoc') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>
                          {remote.docTaken ? 'Este documento ya está registrado.' : errors.nroDoc}
                        </CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Celular */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                        <CFormInput
                          value={values.celular}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Celular"
                          autoComplete="tel"
                          maxLength={10}
                          onChange={e => setField('celular', e.target.value)}
                          onBlur={() => { markTouched('celular'); setErrors(validate()) }}
                          onKeyDown={(e) => {
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') e.preventDefault()
                          }}
                          className={invalid('celular') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>{errors.celular}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Correo */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText>@</CInputGroupText>
                        <CFormInput
                          value={values.correo}
                          type="email"
                          placeholder="Correo electrónico"
                          autoComplete="email"
                          onChange={e => setField('correo', e.target.value)}
                          onBlur={() => { markTouched('correo'); setErrors(validate()); checkEmailRemote() }}
                          className={invalid('correo') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>
                          {remote.emailTaken ? 'Este correo ya está registrado.' : errors.correo}
                        </CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Dirección */}
                    <CCol md={12}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilHouse} /></CInputGroupText>
                        <CFormInput
                          value={values.direccion}
                          placeholder="Dirección de residencia"
                          autoComplete="street-address"
                          onChange={e => setField('direccion', e.target.value)}
                        />
                      </CInputGroup>
                    </CCol>

                    {/* Contraseña */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                        <CFormInput
                          value={values.pass}
                          type="password"
                          placeholder="Contraseña"
                          autoComplete="new-password"
                          onChange={e => setField('pass', e.target.value)}
                          onBlur={() => { markTouched('pass'); setErrors(validate()) }}
                          className={invalid('pass') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>{errors.pass}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Repetir contraseña */}
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                        <CFormInput
                          value={values.pass2}
                          type="password"
                          placeholder="Repite la contraseña"
                          autoComplete="new-password"
                          onChange={e => setField('pass2', e.target.value)}
                          onBlur={() => { markTouched('pass2'); setErrors(validate()) }}
                          className={invalid('pass2') ? 'is-invalid' : ''}
                          required
                        />
                        <CFormFeedback invalid>{errors.pass2}</CFormFeedback>
                      </CInputGroup>
                    </CCol>

                    {/* Botón */}
                    <CCol xs={12}>
                      <div className="d-grid mt-2">
                        <CButton color="success" size="lg" type="submit" disabled={loading}>
                          {loading ? 'Creando...' : 'Crear cuenta'}
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
