import React, { useEffect, useMemo, useState } from 'react'
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilBadge, cilBirthdayCake, cilBusAlt } from '@coreui/icons'

const MatricularCanino = () => {
  const [form, setForm] = useState({
    plan: '',
    transporte: '',
    nombre: '',
    raza: '',
    fecha_nacimiento: '',
    talla: '',
  })
  const [vacunasPdf, setVacunasPdf] = useState(null) // File
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [nacimientoError, setNacimientoError] = useState('')

  // 👉 Estado para listar caninos
  const [mascotas, setMascotas] = useState([])
  const [loadingMascotas, setLoadingMascotas] = useState(false)
  const [errorMascotas, setErrorMascotas] = useState('')

  // 👉 Estado para edición / eliminación
  const [editingId, setEditingId] = useState(null) // id de la matrícula que se está editando
  const [deletingId, setDeletingId] = useState(null) // id que se está eliminando

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
    if (value > maxAllowed) return 'El canino debe tener mínimo 4 meses.'
    return ''
  }

  // -------- LISTADO --------
  const fetchMascotas = async () => {
    try {
      setLoadingMascotas(true)
      setErrorMascotas('')

      const accessToken =
        localStorage.getItem('access') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token')

      if (!accessToken) {
        setErrorMascotas('No hay sesión iniciada. Vuelve a iniciar sesión.')
        return
      }

      const url = `${import.meta.env.VITE_API_BASE}/matriculas/`
      console.log('GET mascotas ->', url)

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log('Status listado mascotas:', res.status)

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body listado mascotas:', text)
        throw new Error(text || 'Error al listar matrículas')
      }

      const data = await res.json()
      console.log('Data cruda listado mascotas:', data)

      let lista = []
      if (Array.isArray(data)) {
        lista = data
      } else if (Array.isArray(data.results)) {
        lista = data.results
      } else if (Array.isArray(data.data)) {
        lista = data.data
      } else {
        console.warn('Formato inesperado en respuesta de mascotas:', data)
        lista = []
      }

      setMascotas(lista)
      console.log('Mascotas cargadas:', lista);
    } catch (err) {
      console.error('Error en fetchMascotas:', err)
      setErrorMascotas('Ocurrió un error al cargar tus mascotas.')
    } finally {
      setLoadingMascotas(false)
    }
  }

  useEffect(() => {
    fetchMascotas()
  }, [])

  // -------- CREAR / EDITAR --------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    // Validaciones mínimas
    const allFilled = Object.values(form).every((v) => String(v).trim() !== '')
    if (!allFilled) return

    const nErr = validateNacimiento(form.fecha_nacimiento, maxNacimiento)
    setNacimientoError(nErr)
    if (nErr) return

    const isEditing = Boolean(editingId)

    try {
      setSubmitting(true)

      const accessToken =
        localStorage.getItem('access') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token')

      if (!accessToken) {
        alert('No hay sesión iniciada.')
        return
      }

      // 1️⃣ Subir PDF SOLO si el usuario seleccionó uno nuevo
      let vacunasUrl = ''

      if (vacunasPdf) {
        const { supabase } = await import('../../supabaseClient')
        const fileName = `carnet_${Date.now()}_${vacunasPdf.name}`

        const { error: uploadError } = await supabase.storage
          .from('carnet_vacunacion')
          .upload(fileName, vacunasPdf, { contentType: 'application/pdf' })

        if (uploadError) throw uploadError

        const { data: urlData, error: urlError } = await supabase.storage
          .from('carnet_vacunacion')
          .getPublicUrl(fileName)

        if (urlError) throw urlError

        vacunasUrl = urlData.publicUrl
        console.log('PDF subido correctamente:', vacunasUrl)
      } else if (isEditing) {
        // Si estamos editando y NO se subió un nuevo PDF,
        // conservamos el que ya tenía la matrícula
        const actual = mascotas.find((m) => m.id_matricula === editingId)
        vacunasUrl = actual?.vacunas_url || ''
      }

      // Si estamos creando y no hay vacunasUrl, obligamos PDF
      if (!isEditing && !vacunasUrl) {
        alert('Adjunta el carné de vacunación en PDF.')
        return
      }

      const fd = new FormData()
      fd.append('nombre', form.nombre)
      fd.append('raza', form.raza)
      fd.append('talla', form.talla)
      fd.append('fecha_nacimiento', form.fecha_nacimiento)
      fd.append('plan', form.plan)
      fd.append('transporte', form.transporte)
      if (vacunasUrl) {
        fd.append('vacunas_url', vacunasUrl)
      }

      const baseUrl = `${import.meta.env.VITE_API_BASE}/matriculas/`

      const url = isEditing ? `${baseUrl}${editingId}/` : baseUrl
      const method = isEditing ? 'PUT' : 'POST'

      console.log(`${method} matrícula ->`, url)

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body en submit matrícula:', text)
        throw new Error(text || 'No se pudo guardar la matrícula.')
      }

      handleReset()
      if (isEditing) {
        alert('Matrícula actualizada correctamente.')
      } else {
        alert('Matrícula creada correctamente.')
      }

      fetchMascotas()
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al guardar la matrícula.')
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
    setEditingId(null)
  }

  // -------- ELIMINAR --------
  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta matrícula?')
    if (!confirmar) return

    try {
      setDeletingId(id)
      console.log("ID matrícula a eliminar:", id);
      const accessToken =
        localStorage.getItem('access') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token')

      if (!accessToken) {
        alert('No hay sesión iniciada.')
        return
      }

      const url = `${import.meta.env.VITE_API_BASE}/matriculas/${id}/`
      console.log('DELETE matrícula ->', url)

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const text = await res.text()

      if (!res.ok && res.status < 200 || res.status >= 300) {
        console.error('Error body DELETE matrícula:', text)
        throw new Error(text || 'No se pudo eliminar la matrícula.')
      }

      // Quitamos la matrícula de la tabla en memoria
      setMascotas((prev) => prev.filter((m) => m.id_matricula !== id))
      alert('Matrícula eliminada correctamente.')
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al eliminar la matrícula.')
    } finally {
      setDeletingId(null)
    }
  }

  // -------- INICIAR EDICIÓN DESDE LA TABLA --------
  const startEdit = (m) => {
    setEditingId(m.id_matricula)
    setForm({
      plan: m.plan || '',
      transporte: m.transporte || '',
      nombre: m.nombre || '',
      raza: m.raza || '',
      nacimiento: m.fecha_nacimiento || '',
      talla: m.talla || '',
    })
    setVacunasPdf(null)
    setNacimientoError('')
    setValidated(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Mensaje de error para el PDF (solo para alta; en edición puede ser opcional)
  const pdfError = (() => {
    if (!validated) return ''
    if (!vacunasPdf && !editingId) return 'Adjunta el PDF del carné de vacunación.'
    if (vacunasPdf && vacunasPdf.type !== 'application/pdf') return 'El archivo debe ser un PDF.'
    if (vacunasPdf && vacunasPdf.size > 5 * 1024 * 1024) return 'El archivo no debe superar 5MB.'
    return ''
  })()

  const isEditing = Boolean(editingId)

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          {isEditing ? 'Editar Matrícula' : 'Matricular Mascota'}
        </CCardHeader>
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
                      name="fecha_nacimiento"
                      value={form.fecha_nacimiento}
                      onChange={handleChange}
                      max={maxNacimiento}
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
                  {isEditing && !vacunasPdf && (
                    <small className="text-body-secondary d-block mt-1">
                      Si no seleccionas un nuevo archivo, se conservará el carné actual.
                    </small>
                  )}
                </div>
              </CCol>
            </CRow>

            <div className="d-grid d-sm-flex gap-2">
              <CButton color="primary" type="submit" disabled={submitting}>
                {submitting
                  ? 'Guardando…'
                  : isEditing
                  ? 'Guardar cambios'
                  : 'Confirmar la matrícula'}
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={submitting}
              >
                {isEditing ? 'Cancelar edición' : 'Limpiar'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>

        {/* 👇 Sección de listado de mascotas */}
        <CCardHeader>Mis Mascotas</CCardHeader>
        <CCardBody>
          {loadingMascotas && (
            <div className="d-flex align-items-center gap-2">
              <CSpinner size="sm" />
              <span>Cargando mascotas…</span>
            </div>
          )}

          {errorMascotas && (
            <CAlert color="danger" className="mb-3">
              {errorMascotas}
            </CAlert>
          )}

          {!loadingMascotas && !errorMascotas && mascotas.length === 0 && (
            <p className="text-body-secondary m-0">Aún no tienes mascotas matriculadas.</p>
          )}

          {!loadingMascotas && !errorMascotas && mascotas.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Raza</CTableHeaderCell>
                  <CTableHeaderCell>Plan</CTableHeaderCell>
                  <CTableHeaderCell>Transporte</CTableHeaderCell>
                  <CTableHeaderCell>Talla</CTableHeaderCell>
                  <CTableHeaderCell>Nacimiento</CTableHeaderCell>
                  <CTableHeaderCell>Carné</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {mascotas.map((m, idx) => (
                  <CTableRow key={m.id_matricula ?? idx}>
                    <CTableDataCell>{idx + 1}</CTableDataCell>
                    <CTableDataCell>{m.nombre}</CTableDataCell>
                    <CTableDataCell>{m.raza}</CTableDataCell>
                    <CTableDataCell>{m.plan}</CTableDataCell>
                    <CTableDataCell>{m.transporte}</CTableDataCell>
                    <CTableDataCell>{m.talla}</CTableDataCell>
                    <CTableDataCell>{m.fecha_nacimiento}</CTableDataCell>
                    <CTableDataCell>
                      {m.vacunas_url ? (
                        <a href={m.vacunas_url} target="_blank" rel="noopener noreferrer">
                          Ver carné
                        </a>
                      ) : (
                        <span className="text-body-secondary">No disponible</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="secondary"
                        size="sm"
                        variant="outline"
                        className="me-2"
                        onClick={() => startEdit(m)}
                        disabled={deletingId === m.id_matricula || submitting}
                      >
                        Editar
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(m.id_matricula)}
                        disabled={deletingId === m.id_matricula || submitting}
                      >
                        {deletingId === m.id_matricula ? 'Eliminando…' : 'Eliminar'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default MatricularCanino