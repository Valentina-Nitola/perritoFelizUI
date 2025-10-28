import React, { useState } from 'react'
import {
  CRow, CCol, CCard, CCardHeader, CCardBody,
  CForm, CInputGroup, CInputGroupText, CFormInput, CFormSelect,
  CFormFeedback, CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilEnvelopeClosed, cilLockLocked, cilBadge, cilCalendar, cilBirthdayCake } from '@coreui/icons'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const strongPassRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const InternalUsers = () => {
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    nacimiento: '',
    tipoDoc: '',
    doc: '',
    vinculacion: '',
    email: '',
    password: '',
    role: '',
  })
  const [validated, setValidated] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }


  // por favor aqui conectar con el backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    // validación general
    const allFilled = Object.values(form).every((v) => v.trim() !== '')
    const validEmail = emailRe.test(form.email)
    const validPass = strongPassRe.test(form.password)

    if (!allFilled) {
      alert('Por favor completa todos los campos.')
      return
    }
    if (!validEmail) {
      alert('El correo electrónico no tiene un formato válido.')
      return
    }
    if (!validPass) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.')
      return
    }

    // Si pasa las validaciones:
    console.log('Usuario interno creado:', form)
    alert(`Usuario ${form.name} (${form.role}) creado exitosamente.`)
    handleReset()
  }

  const handleReset = () => {
    setForm({
      name: '',
      lastname: '',
      nacimiento: '',
      tipoDoc: '',
      doc: '',
      vinculacion: '',
      email: '',
      password: '',
      role: '',
    })
    setValidated(false)
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Crear usuario interno</CCardHeader>
        <CCardBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <CRow>
              <CCol md={6}>
                {/* Rol */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormSelect
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <option value="director">Director</option>
                      <option value="admin">Administrador</option>
                      <option value="trainer">Entrenador</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Selecciona un rol.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                {/* Nombre */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="name"
                      placeholder="Nombre"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Apellidos */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="lastname"
                      placeholder="Apellidos"
                      value={form.lastname}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                {/* Fecha nacimiento */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBirthdayCake} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="nacimiento"
                      value={form.nacimiento}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Tipo de documento */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormSelect
                      name="tipoDoc"
                      value={form.tipoDoc}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona el tipo de documento</option>
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="CE">Cédula de extranjería</option>
                      <option value="PA">Pasaporte</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                {/* Fecha de vinculación */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="vinculacion"
                      value={form.vinculacion}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Número de documento */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>#</CInputGroupText>
                    <CFormInput
                      type="text"
                      name="doc"
                      placeholder="Número de documento"
                      value={form.doc}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                {/* Correo */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilEnvelopeClosed} /></CInputGroupText>
                    <CFormInput
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>
                      Ingrese un correo válido (ejemplo@dominio.com).
                    </CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Contraseña */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      type="password"
                      name="password"
                      placeholder="Contraseña"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>
                      Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
                    </CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <div className="d-grid d-sm-flex gap-2">
              <CButton color="primary" type="submit">Crear usuario</CButton>
              <CButton color="secondary" variant="outline" type="button" onClick={handleReset}>
                Limpiar
              </CButton>
            </div>
          </CForm>
        </CCardBody>

        <CCardHeader>Usuarios</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary m-0">Próximamente: tabla de usuarios internos…</p>
        </CCardBody>
      </CCard>
    </>
  )
}

export default InternalUsers
