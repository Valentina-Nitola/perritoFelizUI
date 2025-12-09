import React, { useEffect, useState } from 'react'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilBusAlt, cilSearch } from '@coreui/icons'

const AsistenciaCaninos = () => {
  // ---------- FORMULARIO ----------
  const [form, setForm] = useState({
    duenoDocumento: '', // cédula del dueño
    canino: '', // id de la matrícula / canino
    tipo_llegada: '',
    llegoDuenio: '',
  })
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ---------- MASCOTAS DEL DUEÑO ----------
  const [mascotasDueno, setMascotasDueno] = useState([])
  const [loadingMascotas, setLoadingMascotas] = useState(false)
  const [errorMascotas, setErrorMascotas] = useState('')
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  // ---------- ASISTENCIAS DEL DÍA ----------
  const [asistencias, setAsistencias] = useState([])
  const [loadingAsistencias, setLoadingAsistencias] = useState(false)
  const [errorAsistencias, setErrorAsistencias] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // estado para el modal de salida / clase terminada
  const [salidaModalVisible, setSalidaModalVisible] = useState(false)
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState(null)
  const [salidaForm, setSalidaForm] = useState({
    salidaAnticipada: false,
    tipoSalida: '',
    observaciones: '',
  })
  const [salidaValidated, setSalidaValidated] = useState(false)
  const [salidaSubmitting, setSalidaSubmitting] = useState(false)

  const getAccessToken = () =>
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token')

  // ---------- CARGAR ASISTENCIAS DEL DÍA ----------
  const fetchAsistencias = async () => {
    try {
      setLoadingAsistencias(true)
      setErrorAsistencias('')

      const accessToken = getAccessToken()
      if (!accessToken) {
        setErrorAsistencias('No hay sesión iniciada. Vuelve a iniciar sesión.')
        return
      }

      const baseUrl = `${import.meta.env.VITE_API_BASE}/asistencias/listar/`
      const url = `${baseUrl}?solo_presentes=true` // el backend decide qué significa "presentes"
      console.log('GET asistencias del día ->', url)

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log('Status listado asistencias:', res.status)

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body listado asistencias:', text)
        throw new Error(text || 'Error al listar asistencias.')
      }

      const data = await res.json()
      console.log('Data cruda listado asistencias:', data)

      let lista = []
      if (Array.isArray(data)) {
        lista = data
      } else if (Array.isArray(data.results)) {
        lista = data.results
      } else if (Array.isArray(data.data)) {
        lista = data.data
      } else {
        console.warn('Formato inesperado en respuesta de asistencias:', data)
      }

      setAsistencias(lista)
    } catch (err) {
      console.error('Error en fetchAsistencias:', err)
      setErrorAsistencias('Ocurrió un error al cargar la asistencia.')
    } finally {
      setLoadingAsistencias(false)
    }
  }

  useEffect(() => {
    fetchAsistencias()
  }, [])

  // ---------- BÚSQUEDA DE MASCOTAS POR CÉDULA ----------
  const buscarMascotasPorDueno = async () => {
    const doc = form.duenoDocumento.trim()
    setMascotasDueno([])
    setBusquedaRealizada(false)
    setErrorMascotas('')

    if (!doc) {
      setErrorMascotas('Escribe la cédula del dueño para buscar.')
      return
    }

    try {
      setLoadingMascotas(true)

      const accessToken = getAccessToken()
      if (!accessToken) {
        setErrorMascotas('No hay sesión iniciada. Vuelve a iniciar sesión.')
        return
      }

      const baseUrl = `${import.meta.env.VITE_API_BASE}/matriculas/`
      const url = `${baseUrl}?dueno_identificacion=${encodeURIComponent(
        doc,
      )}&solo_vigentes=true`
      console.log('GET mascotas por dueño ->', url)

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log('Status listado mascotas dueño:', res.status)

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body listado mascotas dueño:', text)
        throw new Error(text || 'Error al listar mascotas del dueño.')
      }

      const data = await res.json()
      console.log('Data cruda mascotas dueño:', data)

      let lista = []
      if (Array.isArray(data)) {
        lista = data
      } else if (Array.isArray(data.results)) {
        lista = data.results
      } else if (Array.isArray(data.data)) {
        lista = data.data
      } else {
        console.warn('Formato inesperado en respuesta de mascotas dueño:', data)
      }

      setMascotasDueno(lista)
      setBusquedaRealizada(true)
      setForm((prev) => ({ ...prev, canino: '' }))
    } catch (err) {
      console.error('Error en buscarMascotasPorDueno:', err)
      setErrorMascotas('Ocurrió un error al buscar las mascotas del dueño.')
    } finally {
      setLoadingMascotas(false)
    }
  }

  // ---------- MANEJO FORMULARIO ----------
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'canino') {
      console.log('Mascota seleccionada id_matricula:', value)
    }
  }

  const handleReset = () => {
    setForm({
      duenoDocumento: '',
      canino: '',
      tipo_llegada: '',
      llegoDuenio: '',
    })
    setMascotasDueno([])
    setBusquedaRealizada(false)
    setErrorMascotas('')
    setValidated(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    const { canino, tipo_llegada } = form

    if (!canino || !tipo_llegada) {
      return alert('Por favor completa todos los campos.')
    }

    try {
      setSubmitting(true)
      const accessToken = getAccessToken()
      if (!accessToken) return alert('No hay sesión iniciada.')

      const url = `${import.meta.env.VITE_API_BASE}/asistencias/`

      const hoy = new Date()
      const yyyy = hoy.getFullYear()
      const mm = String(hoy.getMonth() + 1).padStart(2, '0')
      const dd = String(hoy.getDate()).padStart(2, '0')
      const fechaLocal = `${yyyy}-${mm}-${dd}`

      const payload = {
        id_canino: Number(canino),
        tipo_llegada: tipo_llegada, // 'Ruta' o 'Propietario'
        fecha: fechaLocal,
      }
      console.log(
        'Fecha local (frontend) que se enviará:',
        new Date().toISOString(),
        '->',
        new Date().toISOString().slice(0, 10),
      )

      console.log('POST asistencia ->', url, payload)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body en crear asistencia:', text)
        throw new Error(text || 'No se pudo registrar la asistencia.')
      }

      alert('Asistencia registrada correctamente.')
      handleReset()
      fetchAsistencias()
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al registrar la asistencia.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- ELIMINAR ASISTENCIA ----------
  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas borrar esta asistencia?')
    if (!confirmar) return

    try {
      setDeletingId(id)

      const accessToken = getAccessToken()
      if (!accessToken) {
        alert('No hay sesión iniciada.')
        return
      }

      const url = `${import.meta.env.VITE_API_BASE}/asistencias/${id}/`
      console.log('DELETE asistencia ->', url)

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body DELETE asistencia:', text)
        throw new Error(text || 'No se pudo borrar la asistencia.')
      }

      setAsistencias((prev) => prev.filter((a) => a.id !== id))
      alert('Asistencia borrada correctamente.')
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al borrar la asistencia.')
    } finally {
      setDeletingId(null)
    }
  }

  // abrir/cerrar modal de salida
  const openSalidaModal = (asistencia) => {
    setAsistenciaSeleccionada(asistencia)
    setSalidaForm({
      salidaAnticipada: false,
      tipoSalida: '',
      observaciones: '',
    })
    setSalidaValidated(false)
    setSalidaModalVisible(true)
  }

  const closeSalidaModal = () => {
    setSalidaModalVisible(false)
    setAsistenciaSeleccionada(null)
  }

  // manejo del formulario de salida
  const handleSalidaChange = (e) => {
    const { name, value, checked, type } = e.target
    setSalidaForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleRegistrarSalida = async (e) => {
    e.preventDefault()
    setSalidaValidated(true)

    if (!salidaForm.tipoSalida) {
      return
    }

    try {
      setSalidaSubmitting(true)
      const accessToken = getAccessToken()
      if (!accessToken) {
        alert('No hay sesión iniciada.')
        return
      }

      if (!asistenciaSeleccionada?.id) {
        alert('No se encontró la asistencia seleccionada.')
        return
      }

      // 👉 endpoint de ejemplo, el backend debe implementarlo
      const url = `${import.meta.env.VITE_API_BASE}/asistencias/registrar_salida/`

      const payload = {
        id_asistencia: asistenciaSeleccionada.id,
        salida_anticipada: salidaForm.salidaAnticipada,
        tipo_salida: salidaForm.tipoSalida, // 'Ruta' o 'Propietario'
        observaciones: salidaForm.observaciones.trim() || null, // opcional
      }

      console.log('POST registrar salida ->', url, payload)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Error body en registrar salida:', text)
        throw new Error(text || 'No se pudo registrar la salida.')
      }

      alert('Salida registrada correctamente.')
      closeSalidaModal()
      fetchAsistencias() // refrescar listado de presentes
    } catch (err) {
      console.error(err)
      alert('Ocurrió un problema al registrar la salida.')
    } finally {
      setSalidaSubmitting(false)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Registro de asistencia de caninos</CCardHeader>
        <CCardBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <CRow>
              {/* CÉDULA DEL DUEÑO */}
              <CCol md={5}>
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="duenoDocumento"
                      placeholder="Cédula del dueño"
                      value={form.duenoDocumento}
                      onChange={handleChange}
                      required
                    />
                    <CFormFeedback invalid>Escribe la cédula del dueño.</CFormFeedback>
                  </CInputGroup>
                  <div className="mt-2 d-flex gap-2">
                    <CButton
                      size="sm"
                      color="secondary"
                      type="button"
                      onClick={buscarMascotasPorDueno}
                      disabled={loadingMascotas}
                    >
                      {loadingMascotas ? (
                        <>
                          <CSpinner size="sm" className="me-1" /> Buscando…
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSearch} className="me-1" />
                          Buscar mascotas
                        </>
                      )}
                    </CButton>
                  </div>
                  {errorMascotas && (
                    <CAlert color="danger" className="mt-2 mb-0">
                      {errorMascotas}
                    </CAlert>
                  )}
                  {busquedaRealizada && !loadingMascotas && mascotasDueno.length === 0 && (
                    <small className="text-body-secondary d-block mt-1">
                      No se encontraron mascotas vigentes para esta cédula.
                    </small>
                  )}
                </div>
              </CCol>

              {/* CANINO DEL DUEÑO */}
              <CCol md={4}>
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormSelect
                      name="canino"
                      value={form.canino}
                      onChange={handleChange}
                      required
                      disabled={mascotasDueno.length === 0}
                    >
                      <option value="">
                        {mascotasDueno.length === 0
                          ? 'Primero busca al dueño'
                          : 'Selecciona un canino'}
                      </option>
                      {mascotasDueno.map((m, idx) => (
                        <option key={m.id_matricula ?? idx} value={m.id_canino}>
                          {m.nombre} {m.raza ? `- ${m.raza}` : ''} {m.talla ? `(${m.talla})` : ''}
                        </option>
                      ))}
                    </CFormSelect>

                    <CFormFeedback invalid>Selecciona un canino matriculado.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>

              {/* Llegó en ruta / propietario */}
              <CCol md={3}>
                <div className="mb-3">
                  <CInputGroup hasValidation>
                    <CInputGroupText>
                      <CIcon icon={cilBusAlt} />
                    </CInputGroupText>
                    <CFormSelect
                      name="tipo_llegada"
                      value={form.tipo_llegada}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona tipo de llegada</option>
                      <option value="Ruta">Ruta</option>
                      <option value="Propietario">Propietario</option>
                    </CFormSelect>

                    <CFormFeedback invalid>Selecciona una opción.</CFormFeedback>
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <div className="d-grid d-sm-flex gap-2">
              <CButton color="primary" type="submit" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar asistencia'}
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

        {/* ---------- LISTADO DE CANINOS EN EL COLEGIO ---------- */}
        <CCardHeader>Caninos actualmente en el colegio</CCardHeader>
        <CCardBody>
          {loadingAsistencias && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <CSpinner size="sm" />
              <span>Cargando registro de asistencia…</span>
            </div>
          )}

          {errorAsistencias && (
            <CAlert color="danger" className="mb-3">
              {errorAsistencias}
            </CAlert>
          )}

          {!loadingAsistencias && !errorAsistencias && asistencias.length === 0 && (
            <p className="text-body-secondary m-0">
              No hay caninos registrados en asistencia para hoy.
            </p>
          )}

          {!loadingAsistencias && !errorAsistencias && asistencias.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Canino</CTableHeaderCell>
                  <CTableHeaderCell>Ruta</CTableHeaderCell>
                  <CTableHeaderCell>Dueño</CTableHeaderCell>
                  <CTableHeaderCell>Hora ingreso</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {asistencias.map((a, idx) => (
                  <CTableRow key={a.id ?? idx}>
                    <CTableDataCell>{idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      {a.mascota_nombre || a.canino_nombre || '—'}
                    </CTableDataCell>
                    <CTableDataCell>{a.llego_ruta ? 'Sí' : 'No'}</CTableDataCell>
                    <CTableDataCell>{a.llego_duenio ? 'Sí' : 'No'}</CTableDataCell>
                    <CTableDataCell>{a.hora_ingreso || a.created_at || '—'}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      
                      <CButton
                        color="success"
                        size="sm"
                        variant="outline"
                        className="me-2"
                        onClick={() => openSalidaModal(a)}
                        disabled={deletingId === a.id || submitting || salidaSubmitting}
                      >
                        Clase terminada
                      </CButton>

                      <CButton
                        color="danger"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id || submitting || salidaSubmitting}
                      >
                        {deletingId === a.id ? 'Eliminando…' : 'Borrar'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={salidaModalVisible} onClose={closeSalidaModal}>
        <CForm noValidate validated={salidaValidated} onSubmit={handleRegistrarSalida}>
          <CModalHeader closeButton>
            <CModalTitle>Registrar fin de clase</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="mb-3">
              Canino:{' '}
              <strong>
                {asistenciaSeleccionada?.mascota_nombre ||
                  asistenciaSeleccionada?.canino_nombre ||
                  '—'}
              </strong>
            </p>

            {/* ¿Salida anticipada? */}
            <div className="mb-3">
              <CFormCheck
                type="checkbox"
                id="salidaAnticipada"
                label="Salida anticipada"
                name="salidaAnticipada"
                checked={salidaForm.salidaAnticipada}
                onChange={handleSalidaChange}
              />
            </div>

            {/* Tipo de salida (ruta / propietario) */}
            <div className="mb-3">
              <CInputGroup hasValidation>
                <CInputGroupText>
                  <CIcon icon={cilBusAlt} />
                </CInputGroupText>
                <CFormSelect
                  name="tipoSalida"
                  value={salidaForm.tipoSalida}
                  onChange={handleSalidaChange}
                  required
                >
                  <option value="">Selecciona tipo de salida</option>
                  <option value="Ruta">Ruta</option>
                  <option value="Propietario">Propietario</option>
                </CFormSelect>
                <CFormFeedback invalid>Selecciona el tipo de salida.</CFormFeedback>
              </CInputGroup>
            </div>

            {/* Observaciones (opcional) */}
            <div className="mb-3">
              <CFormTextarea
                name="observaciones"
                rows={3}
                placeholder="Observaciones de la clase (opcional)"
                value={salidaForm.observaciones}
                onChange={handleSalidaChange}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" type="button" onClick={closeSalidaModal}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={salidaSubmitting}>
              {salidaSubmitting ? 'Guardando…' : 'Guardar salida'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default AsistenciaCaninos