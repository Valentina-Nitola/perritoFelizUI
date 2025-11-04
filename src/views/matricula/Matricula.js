import React, { useMemo, useState } from 'react'
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
  const [nacimientoError, setNacimientoError] = useState('') 

  // Utilidad: formatear fecha a YYYY-MM-DD
  const fmt = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  
  const maxNacimiento = useMemo(() => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 4)
    return fmt(cutoff)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Si el usuario cambia nacimiento, validamos en caliente
    if (name === 'nacimiento') {
      setNacimientoError(validateNacimiento(value, maxNacimiento))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setVacunasPdf(file)
  }

  // Valida que la fecha sea <= maxNacimiento (al menos 4 meses)
  const validateNacimiento = (value, maxAllowed) => {
    if (!value) return 'Campo obligatorio.'
    // Si es posterior al máximo (hoy - 4 meses), es inválida
    if (value > maxAllowed) return 'El canino debe tener mínimo 4 meses.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    // Validaciones mínimas
    const allFilled = Object.values(form).every((v) => String(v).trim() !== '')
    if (!allFilled) return

    const nErr = validateNacimiento(form.nacimiento, maxNacimiento)
    setNacimientoError(nErr)
    if (nErr) return

    if (!vacunasPdf) {
      alert('Adjunta el carné de vacunación en PDF.')
      return
    }

    const isPdf = vacunasPdf.type === 'application/pdf'
    const under5mb = vacunasPdf.size <= 5 * 1024 * 1024
    if (!isPdf || !under5mb) {
      alert('El archivo debe ser PDF y pesar menos de 5MB.')
      return
    }

    try {
      setSubmitting(true)

      // 1️⃣ Subir PDF a Supabase
      const { supabase } = await import('../../supabaseClient')
      const fileName = `carnet_${Date.now()}_${vacunasPdf.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('carnet_vacunacion')
        .upload(fileName, vacunasPdf, { contentType: 'application/pdf' })

      if (uploadError) throw uploadError

      // 2️⃣ Obtener URL pública o firmada (según tu configuración)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('carnet_vacunacion')
        .getPublicUrl(fileName)

      if (urlError) throw urlError

      const vacunasUrl = urlData.publicUrl
      console.log('✅ PDF subido correctamente:', vacunasUrl)

      // 3️⃣ Preparar los datos para enviar al backend
      const fd = new FormData()
      fd.append('nombre', form.nombre)
      fd.append('raza', form.raza)
      fd.append('talla', form.talla)
      fd.append('nacimiento', form.nacimiento)
      fd.append('plan', form.plan)
      fd.append('transporte', form.transporte)
      fd.append('vacunas_url', vacunasUrl)

      // 4️⃣ Enviar los datos al backend Django
      // ✅ Usa siempre el token más nuevo
      const accessToken =
        localStorage.getItem('access') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token')

      console.log("🔐 Enviando token:", accessToken ? accessToken.slice(0, 30) + "..." : "❌ ninguno")

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/matriculas/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: fd, // ✅ usamos FormData
      })

      if (!res.ok) throw new Error('No se pudo crear la matrícula.')

      handleReset()
      alert('✅ Matrícula creada correctamente.')
    } catch (err) {
      console.error(err)
      alert('❌ Ocurrió un problema al crear la matrícula.')
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
    setNacimientoError('')
    setValidated(false)
  }

  // Mensaje de error para el PDF
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
                    <CInputGroupText>
                      <CIcon icon={cilBadge} />
                    </CInputGroupText>
                    <CFormSelect name="plan" value={form.plan} onChange={handleChange} required>
                      <option value="">Selecciona un plan</option>
                      <option value="1 mes">1 mes</option>
                      <option value="1 bimestre">1 bimestre</option>
                      <option value="1 trimestre">1 trimestre</option>
                      <option value="1 semestre">1 semestre</option>
                      <option value="1 año">1 año</option>
                    </CFormSelect>

                    <CFormFeedback invalid>Selecciona un plan.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Plan de transporte */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>
                      <CIcon icon={cilBusAlt} />
                    </CInputGroupText>
                    <CFormSelect
                      name="transporte"
                      value={form.transporte}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Tipo de transporte</option>
                      <option value="Total">Todo el día</option>
                      <option value="Parcial">Medio día</option>
                      <option value="Ninguno">Sin transporte</option>
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
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
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
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
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
                    <CInputGroupText>
                      <CIcon icon={cilBirthdayCake} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      name="nacimiento"
                      value={form.nacimiento}
                      onChange={handleChange}
                      max={maxNacimiento} // <-- clave: al menos 4 meses
                      required
                    />
                    <CFormFeedback invalid>
                      {nacimientoError || 'Campo obligatorio.'}
                    </CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              <CCol md={6}>
                {/* Talla */}
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>
                      <CIcon icon={cilBadge} />
                    </CInputGroupText>
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

            {/* Subir PDF del carné de vacunación */}
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
                      aria-label="Subir PDF con el carné de vacunación"
                    />
                    <CFormFeedback invalid>
                      {pdfError || 'Adjunta el PDF del carné de vacunación.'}
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
              <CButton
                color="secondary"
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={submitting}
              >
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
