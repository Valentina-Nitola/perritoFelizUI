import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CFormFeedback,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilBadge, cilBirthdayCake, cilBusAlt } from '@coreui/icons'

const MatricularCanino = () => {
  const [form, setForm] = useState({
    plan: '',
    transporte: '',
    nombre: '',
    raza: '',
    nacimiento: '',
    talla: '',
  })
  const [vacunasPdf, setVacunasPdf] = useState(null) // File
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setVacunasPdf(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    // Validaciones mínimas
    const allFilled = Object.values(form).every((v) => String(v).trim() !== '')
    if (!allFilled) {
      return
    }
    // Validación archivo: requerido, PDF y tamaño (p. ej., <= 5MB)
    if (!vacunasPdf) return
    const isPdf = vacunasPdf.type === 'application/pdf'
    const under5mb = vacunasPdf.size <= 5 * 1024 * 1024
    if (!isPdf || !under5mb) return

    // ---- Envío a backend: FormData multipart ----
    try {
      setSubmitting(true)
      const fd = new FormData()
      fd.append('plan', form.plan)
      fd.append('transporte', form.transporte)
      fd.append('nombre', form.nombre)
      fd.append('raza', form.raza)
      fd.append('nacimiento', form.nacimiento)
      fd.append('talla', form.talla)
      fd.append('vacunas_pdf', vacunasPdf) // campo de archivo

      // Ejemplo de endpoint (ajusta URL y auth según tu contrato)
      const res = await fetch('/api/matriculas', {
        method: 'POST',
        body: fd, // ¡NO pongas Content-Type, el navegador lo añade con boundary!
        // credentials: 'include', // si usas cookies httpOnly
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || 'No se pudo crear la matrícula.')
      }

      // Opcional: leer respuesta JSON
      // const data = await res.json()

      // Reset
      handleReset()
      alert('Matrícula creada correctamente.')
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al crear la matrícula.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm({
      plan: '',
      transporte: '',
      nombre: '',
      raza: '',
      nacimiento: '',
      talla: '',
    })
    setVacunasPdf(null)
    setValidated(false)
  }

  // Ayuda visual: mensaje de error para el PDF
  const pdfError = (() => {
    if (!validated) return ''
    if (!vacunasPdf) return 'Adjunta el carné de vacunación en PDF.'
    if (vacunasPdf.type !== 'application/pdf') return 'El archivo debe ser un PDF.'
    if (vacunasPdf.size > 5 * 1024 * 1024) return 'El archivo no debe superar 5MB.'
    return ''
  })()

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Matricular Mascota</CCardHeader>
        <CCardBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <CRow>
              <CCol md={6}>
                {/* Plan de matrícula */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormSelect name="plan" value={form.plan} onChange={handleChange} required>
                      <option value="">Selecciona un plan</option>
                      <option value="mensual">1 mes</option>
                      <option value="bimestre">2 meses</option>
                      <option value="trimestre">3 meses</option>
                      <option value="medio_año">6 meses</option>
                      <option value="año">1 año</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Selecciona un plan.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Plan de transporte */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBusAlt} /></CInputGroupText>
                    <CFormSelect
                      name="transporte"
                      value={form.transporte}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Tipo de transporte</option>
                      <option value="all">Todo el día</option>
                      <option value="medio">Medio día</option>
                      <option value="none">Sin transporte</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Selecciona el tipo de transporte.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                {/* Nombre del canino */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="nombre"
                      placeholder="Nombre del canino"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Raza */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="raza"
                      placeholder="Raza"
                      value={form.raza}
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
                {/* Fecha de nacimiento */}
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
                {/* Talla */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormSelect name="talla" value={form.talla} onChange={handleChange} required>
                      <option value="">Selecciona la talla del canino</option>
                      <option value="min">Mini</option>
                      <option value="peq">Pequeño</option>
                      <option value="med">Mediano</option>
                      <option value="gran">Grande</option>
                    </CFormSelect>
                    <CFormFeedback invalid>Campo obligatorio.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            {/* === Subir PDF del carné de vacunación (debajo de los inputs, antes de los botones) === */}
            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>PDF carné vacunación</CInputGroupText>
                    <CFormInput
                      type="file"
                      name="vacunas_pdf"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                      aria-label="Subir PDF con el carnét de vacunación"
                    />
                    <CFormFeedback invalid>
                      {pdfError || 'Adjunta el PDF del carnét de vacunación.'}
                    </CFormFeedback>
                  </CInputGroup>
                  {vacunasPdf && (
                    <small className="text-body-secondary d-block mt-1">
                      Archivo: {vacunasPdf.name} ({(vacunasPdf.size / 1024 / 1024).toFixed(2)} MB)
                    </small>
                  )}
                </div>
              </CCol>
            </CRow>

            <div className="d-grid d-sm-flex gap-2">
              <CButton color="primary" type="submit" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Confirmar la matrícula'}
              </CButton>
              <CButton color="secondary" variant="outline" type="button" onClick={handleReset} disabled={submitting}>
                Limpiar
              </CButton>
            </div>
          </CForm>
        </CCardBody>

        <CCardHeader>Mis Mascotas</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary m-0">Próximamente: tabla de caninos matriculados…</p>
        </CCardBody>
      </CCard>
    </>
  )
}

export default MatricularCanino
