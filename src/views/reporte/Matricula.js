import React, { useEffect, useMemo, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
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
  CForm,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

import {
  listarMatriculas,
  actualizarMatricula,
  eliminarMatricula,
} from 'src/services/reMatriculaService'

const ListadoMatriculas = () => {
  const [matriculas, setMatriculas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [filtros, setFiltros] = useState({
    tamano: '',
    raza: '',
    plan: '',
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
      setMatriculas(data)
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

  const matriculasFiltradas = useMemo(() => {
    return matriculas.filter((m) => {
      const coincideTamano = filtros.tamano ? m.tamano === filtros.tamano : true
      const coincideRaza = filtros.raza ? m.raza === filtros.raza : true
      const coincidePlan = filtros.plan ? m.plan === filtros.plan : true
      return coincideTamano && coincideRaza && coincidePlan
    })
  }, [matriculas, filtros])

  const limpiarFiltros = () => {
    setFiltros({ tamano: '', raza: '', plan: '' })
  }

  // Para llenar selects dinámicamente
  const opcionesTamano = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.tamano))),
    [matriculas],
  )
  const opcionesRaza = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.raza))),
    [matriculas],
  )
  const opcionesPlan = useMemo(
    () => Array.from(new Set(matriculas.map((m) => m.plan))),
    [matriculas],
  )

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

      // Actualizamos en el estado local
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
    <CCard>
      <CCardHeader>
        <strong>Listado de Caninos Matriculados</strong>
      </CCardHeader>

      <CCardBody>
        {/* FILTROS */}
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormSelect
              label="Tamaño"
              value={filtros.tamano}
              onChange={(e) => handleCambioFiltro('tamano', e.target.value)}
            >
              <option value="">Todos</option>
              {opcionesTamano.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              label="Raza"
              value={filtros.raza}
              onChange={(e) => handleCambioFiltro('raza', e.target.value)}
            >
              <option value="">Todas</option>
              {opcionesRaza.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              label="Plan de matrícula"
              value={filtros.plan}
              onChange={(e) => handleCambioFiltro('plan', e.target.value)}
            >
              <option value="">Todos</option>
              {opcionesPlan.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3} className="d-flex align-items-end">
            <CButton
              color="secondary"
              variant="outline"
              className="me-2"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </CButton>
          </CCol>
        </CRow>

        {cargando && (
          <div className="text-center my-3">
            <CSpinner /> Cargando...
          </div>
        )}

        {error && <p className="text-danger">{error}</p>}

        {/* TABLA */}
        <CTable hover responsive bordered>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>Nombre canino</CTableHeaderCell>
              <CTableHeaderCell>Raza</CTableHeaderCell>
              <CTableHeaderCell>Tamaño</CTableHeaderCell>
              <CTableHeaderCell>Plan</CTableHeaderCell>
              <CTableHeaderCell>Fecha inicio</CTableHeaderCell>
              <CTableHeaderCell>Fecha fin</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell className="text-center">
                Acciones
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {matriculasFiltradas.length === 0 && !cargando && (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center">
                  No hay matrículas para mostrar.
                </CTableDataCell>
              </CTableRow>
            )}

            {matriculasFiltradas.map((m) => (
              <CTableRow key={m.id}>
                <CTableDataCell>{m.nombreCanino}</CTableDataCell>
                <CTableDataCell>{m.raza}</CTableDataCell>
                <CTableDataCell>{m.tamano}</CTableDataCell>
                <CTableDataCell>{m.plan}</CTableDataCell>
                <CTableDataCell>{m.fechaInicio}</CTableDataCell>
                <CTableDataCell>{m.fechaFin}</CTableDataCell>
                <CTableDataCell>{m.estado}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <CButton
                    color="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => abrirModalEditar(m)}
                    title="Editar matrícula"
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => abrirModalEliminar(m)}
                    title="Eliminar matrícula"
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* MODAL EDITAR */}
      <CModal
        visible={mostrarModalEditar}
        onClose={() => setMostrarModalEditar(false)}
      >
        <CModalHeader closeButton>
          <CModalTitle>Editar matrícula</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={guardarCambiosEditar}>
          <CModalBody>
            <p>
              Canino:{' '}
              <strong>{matriculaSeleccionada?.nombreCanino || ''}</strong>
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
                  onChange={(e) =>
                    handleChangeEditar('fechaInicio', e.target.value)
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="date"
                  label="Fecha fin"
                  value={formEditar.fechaFin}
                  onChange={(e) =>
                    handleChangeEditar('fechaFin', e.target.value)
                  }
                  required
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol>
                <CFormInput
                  label="Estado"
                  value={formEditar.estado}
                  onChange={(e) =>
                    handleChangeEditar('estado', e.target.value)
                  }
                  placeholder="Activo / Vencido / Cancelado"
                  required
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => setMostrarModalEditar(false)}
            >
              Cancelar
            </CButton>
            <CButton color="primary" type="submit">
              Guardar cambios
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* MODAL ELIMINAR */}
      <CModal
        visible={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
      >
        <CModalHeader closeButton>
          <CModalTitle>Eliminar matrícula</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Seguro que quieres eliminar la matrícula del canino{' '}
          <strong>{matriculaAEliminar?.nombreCanino}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setMostrarModalEliminar(false)}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default ListadoMatriculas