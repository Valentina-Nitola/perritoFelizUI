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
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch, cilFilter, cilReload } from '@coreui/icons'

import {
  listarMatriculas,
  actualizarMatricula,
  eliminarMatricula,
} from 'src/services/reMatriculaService'

const ListadoMatriculas = () => {
  const [matriculas, setMatriculas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({
    tamano: '',
    raza: '',
    plan: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  // Modal editar
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null)
  const [formEditar, setFormEditar] = useState({
    plan: '',
    fechaInicio: '',
    fechaFin: '',
    estado: '',
  })

  // Modal eliminar
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [matriculaAEliminar, setMatriculaAEliminar] = useState(null)

  // ================= CARGA INICIAL =================
  useEffect(() => {
    cargarMatriculas()
  }, [])

  const cargarMatriculas = async () => {
    try {
      setCargando(true)
      setError(null)

      const data = await listarMatriculas()
      setMatriculas(data || [])
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las matrículas.')
    } finally {
      setCargando(false)
    }
  }

  // ================= FILTROS =================
  const handleCambioFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      tamano: '',
      raza: '',
      plan: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    })
    setBusqueda('')
  }

  const matriculasFiltradas = useMemo(() => {
    return matriculas.filter((m) => {
      const { tamano, raza, plan, estado, fechaDesde, fechaHasta } = filtros

      const textoBusqueda = busqueda.trim().toLowerCase()

      if (textoBusqueda) {
        const nombre = (m.nombreCanino || '').toLowerCase()
        const razaM = (m.raza || '').toLowerCase()
        const planM = (m.plan || '').toLowerCase()
        const tamanoM = (m.tamano || '').toLowerCase()
        const estadoM = (m.estado || '').toLowerCase()

        const coincide =
          nombre.includes(textoBusqueda) ||
          razaM.includes(textoBusqueda) ||
          planM.includes(textoBusqueda) ||
          tamanoM.includes(textoBusqueda) ||
          estadoM.includes(textoBusqueda)

        if (!coincide) return false
      }

      if (tamano && m.tamano !== tamano) return false
      if (raza && m.raza !== raza) return false
      if (plan && m.plan !== plan) return false
      if (estado && m.estado !== estado) return false

      if (fechaDesde || fechaHasta) {
        const fecha = m.fechaInicio ? new Date(m.fechaInicio) : null
        if (!fecha || Number.isNaN(fecha.getTime())) return false

        if (fechaDesde) {
          const desde = new Date(fechaDesde)
          if (fecha < desde) return false
        }

        if (fechaHasta) {
          const hasta = new Date(fechaHasta)
          hasta.setHours(23, 59, 59, 999)
          if (fecha > hasta) return false
        }
      }

      return true
    })
  }, [matriculas, filtros, busqueda])

  const opcionesTamano = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.tamano))).filter(Boolean),
    [matriculas],
  )
  const opcionesRaza = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.raza))).filter(Boolean),
    [matriculas],
  )
  const opcionesPlan = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.plan))).filter(Boolean),
    [matriculas],
  )

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('es-CO')
  }

  const renderBadgeEstado = (estado) => {
    if (!estado) return '-'
    if (estado.toUpperCase() === 'ACTIVO') return <span className="badge bg-success">Activo</span>
    if (estado.toUpperCase() === 'VENCIDO') return <span className="badge bg-warning text-dark">Vencido</span>
    if (estado.toUpperCase() === 'CANCELADO') return <span className="badge bg-secondary">Cancelado</span>
    return <span className="badge bg-light text-dark">{estado}</span>
  }

  // ================= EDITAR =================
  const abrirModalEditar = (matricula) => {
    setMatriculaSeleccionada(matricula)
    setFormEditar({
      plan: matricula.plan || '',
      fechaInicio: matricula.fechaInicio || '',
      fechaFin: matricula.fechaFin || '',
      estado: matricula.estado || '',
    })
    setMostrarModalEditar(true)
  }

  const handleChangeEditar = (campo, valor) => {
    setFormEditar((prev) => ({ ...prev, [campo]: valor }))
  }

  const guardarCambiosEditar = async (e) => {
    e.preventDefault()
    if (!matriculaSeleccionada) return

    try {
      setCargando(true)

      const actualizada = await actualizarMatricula(matriculaSeleccionada.id, {
        ...matriculaSeleccionada,
        ...formEditar,
      })

      setMatriculas((prev) =>
        prev.map((m) => (m.id === actualizada.id ? actualizada : m)),
      )

      setMostrarModalEditar(false)
      setMatriculaSeleccionada(null)
    } catch (err) {
      console.error(err)
      setError('Error al actualizar la matrícula.')
    } finally {
      setCargando(false)
    }
  }

  // ================= ELIMINAR =================
  const abrirModalEliminar = (matricula) => {
    setMatriculaAEliminar(matricula)
    setMostrarModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!matriculaAEliminar) return

    try {
      setCargando(true)

      await eliminarMatricula(matriculaAEliminar.id)

      setMatriculas((prev) =>
        prev.filter((m) => m.id !== matriculaAEliminar.id),
      )

      setMostrarModalEliminar(false)
      setMatriculaAEliminar(null)
    } catch (err) {
      console.error(err)
      setError('Error al eliminar la matrícula.')
    } finally {
      setCargando(false)
    }
  }

  // ================= RENDER =================
  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Reporte de caninos matriculados</h5>
              <small className="text-medium-emphasis">
                Consulta, filtra y administra las matrículas de los caninos en la escuela.
              </small>
            </div>

            <div className="text-end">
              <div className="fw-bold">Total: {matriculas.length}</div>
              <div className="text-medium-emphasis">
                Filtrados: {matriculasFiltradas.length}
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            )}

            {/* BUSQUEDA */}
            <CForm className="mb-3">
              <CRow className="align-items-end">
                <CCol md={6} className="mb-2">
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Buscar por nombre, raza, plan, tamaño o estado"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>

                <CCol md={6} className="mb-2 text-md-end">
                  <CButton
                    color="secondary"
                    variant="outline"
                    className="me-2"
                    onClick={limpiarFiltros}
                  >
                    <CIcon icon={cilFilter} className="me-1" />
                    Limpiar filtros
                  </CButton>

                  <CButton
                    color="primary"
                    variant="outline"
                    onClick={cargarMatriculas}
                  >
                    <CIcon icon={cilReload} className="me-1" />
                    Actualizar datos
                  </CButton>
                </CCol>
              </CRow>

              {/* FILTROS */}
              <CRow className="mt-3">
                <CCol md={3} className="mb-2">
                  <label className="form-label">Tamaño</label>
                  <CFormSelect
                    value={filtros.tamano}
                    onChange={(e) => handleCambioFiltro('tamano', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {opcionesTamano.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3} className="mb-2">
                  <label className="form-label">Raza</label>
                  <CFormSelect
                    value={filtros.raza}
                    onChange={(e) => handleCambioFiltro('raza', e.target.value)}
                  >
                    <option value="">Todas</option>
                    {opcionesRaza.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3} className="mb-2">
                  <label className="form-label">Plan</label>
                  <CFormSelect
                    value={filtros.plan}
                    onChange={(e) => handleCambioFiltro('plan', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {opcionesPlan.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3} className="mb-2">
                  <label className="form-label">Estado</label>
                  <CFormSelect
                    value={filtros.estado}
                    onChange={(e) => handleCambioFiltro('estado', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="CANCELADO">Cancelado</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mt-3">
                <CCol md={3} className="mb-2">
                  <label className="form-label">Fecha inicio desde</label>
                  <CFormInput
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => handleCambioFiltro('fechaDesde', e.target.value)}
                  />
                </CCol>

                <CCol md={3} className="mb-2">
                  <label className="form-label">Fecha inicio hasta</label>
                  <CFormInput
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => handleCambioFiltro('fechaHasta', e.target.value)}
                  />
                </CCol>
              </CRow>
            </CForm>

            {/* TABLA */}
            {cargando ? (
              <div className="text-center my-4">
                <CSpinner />
              </div>
            ) : (
              <CTable striped responsive hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Nombre canino</CTableHeaderCell>
                    <CTableHeaderCell>Raza</CTableHeaderCell>
                    <CTableHeaderCell>Tamaño</CTableHeaderCell>
                    <CTableHeaderCell>Plan</CTableHeaderCell>
                    <CTableHeaderCell>Fecha inicio</CTableHeaderCell>
                    <CTableHeaderCell>Fecha fin</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {matriculasFiltradas.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={9} className="text-center">
                        No se encontraron matrículas.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    matriculasFiltradas.map((m, index) => (
                      <CTableRow key={m.id || index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{m.nombreCanino}</CTableDataCell>
                        <CTableDataCell>{m.raza}</CTableDataCell>
                        <CTableDataCell>{m.tamano}</CTableDataCell>
                        <CTableDataCell>{m.plan}</CTableDataCell>
                        <CTableDataCell>{formatearFecha(m.fechaInicio)}</CTableDataCell>
                        <CTableDataCell>{formatearFecha(m.fechaFin)}</CTableDataCell>
                        <CTableDataCell>{renderBadgeEstado(m.estado)}</CTableDataCell>

                        <CTableDataCell className="text-center">
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => abrirModalEditar(m)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>

                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => abrirModalEliminar(m)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL EDITAR */}
      <CModal visible={mostrarModalEditar} onClose={() => setMostrarModalEditar(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Editar matrícula</CModalTitle>
        </CModalHeader>

        <CForm onSubmit={guardarCambiosEditar}>
          <CModalBody>
            <p>
              Canino: <strong>{matriculaSeleccionada?.nombreCanino}</strong>
            </p>

            <CRow className="mb-3">
              <CCol>
                <CFormInput
                  label="Plan"
                  value={formEditar.plan}
                  onChange={(e) => handleChangeEditar('plan', e.target.value)}
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  type="date"
                  label="Fecha inicio"
                  value={formEditar.fechaInicio}
                  onChange={(e) => handleChangeEditar('fechaInicio', e.target.value)}
                  required
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="date"
                  label="Fecha fin"
                  value={formEditar.fechaFin}
                  onChange={(e) => handleChangeEditar('fechaFin', e.target.value)}
                  required
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol>
                <CFormInput
                  label="Estado"
                  value={formEditar.estado}
                  onChange={(e) => handleChangeEditar('estado', e.target.value)}
                  placeholder="Activo / Vencido / Cancelado"
                  required
                />
              </CCol>
            </CRow>
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setMostrarModalEditar(false)}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit">
              Guardar cambios
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* MODAL ELIMINAR */}
      <CModal visible={mostrarModalEliminar} onClose={() => setMostrarModalEliminar(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Eliminar matrícula</CModalTitle>
        </CModalHeader>

        <CModalBody>
          ¿Seguro que deseas eliminar la matrícula del canino{' '}
          <strong>{matriculaAEliminar?.nombreCanino}</strong>?
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setMostrarModalEliminar(false)}>
            Cancelar
          </CButton>

          <CButton color="danger" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default ListadoMatriculas
