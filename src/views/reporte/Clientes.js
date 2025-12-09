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
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilFilter, cilReload } from '@coreui/icons'

import { listarClientes } from 'src/services/clientesService'

const ReporteClientes = () => {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  useEffect(() => {
    obtenerClientes()
  }, [])

  const obtenerClientes = async () => {
    try {
      setCargando(true)
      setError(null)

      // Puedes pasar filtros al backend si luego los soporta:
      // const data = await listarClientes({ ...filtros, busqueda })
      const data = await listarClientes()

      setClientes(data || [])
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al cargar los clientes.')
    } finally {
      setCargando(false)
    }
  }

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    })
    setBusqueda('')
  }

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const { estado, fechaDesde, fechaHasta } = filtros
      const textoBusqueda = busqueda.trim().toLowerCase()

      if (textoBusqueda) {
        const nombre = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase()
        const doc = (cliente.numeroDocumento || '').toLowerCase()
        const correo = (cliente.email || '').toLowerCase()
        const telefono = (cliente.telefono || '').toLowerCase()

        const coincideBusqueda =
          nombre.includes(textoBusqueda) ||
          doc.includes(textoBusqueda) ||
          correo.includes(textoBusqueda) ||
          telefono.includes(textoBusqueda)

        if (!coincideBusqueda) return false
      }

      if (estado && cliente.estado !== estado) {
        return false
      }

      if (fechaDesde || fechaHasta) {
        const fechaReg = cliente.fechaRegistro ? new Date(cliente.fechaRegistro) : null
        if (!fechaReg) return false

        if (fechaDesde) {
          const desde = new Date(fechaDesde)
          if (fechaReg < desde) return false
        }

        if (fechaHasta) {
          const hasta = new Date(fechaHasta)
          hasta.setHours(23, 59, 59, 999)
          if (fechaReg > hasta) return false
        }
      }

      return true
    })
  }, [clientes, filtros, busqueda])

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('es-CO')
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Reporte de clientes (dueños de mascotas)</h5>
              <small className="text-medium-emphasis">
                Consulta, filtra y busca los clientes registrados en la plataforma.
              </small>
            </div>
            <div className="text-end">
              <div className="fw-bold">Total: {clientes.length}</div>
              <div className="text-medium-emphasis">
                Filtrados: {clientesFiltrados.length}
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            )}

            {/* Búsqueda + acciones */}
            <CForm className="mb-3">
              <CRow className="align-items-end">
                <CCol md={6} className="mb-2">
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Buscar por nombre, documento, correo o teléfono"
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
                  <CButton color="primary" variant="outline" onClick={obtenerClientes}>
                    <CIcon icon={cilReload} className="me-1" />
                    Actualizar datos
                  </CButton>
                </CCol>
              </CRow>

              {/* Filtros */}
              <CRow className="mt-3">
                <CCol md={4} className="mb-2">
                  <label className="form-label">Estado</label>
                  <CFormSelect
                    name="estado"
                    value={filtros.estado}
                    onChange={handleChangeFiltro}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </CFormSelect>
                </CCol>

                <CCol md={4} className="mb-2">
                  <label className="form-label">Fecha desde</label>
                  <CFormInput
                    type="date"
                    name="fechaDesde"
                    value={filtros.fechaDesde}
                    onChange={handleChangeFiltro}
                  />
                </CCol>

                <CCol md={4} className="mb-2">
                  <label className="form-label">Fecha hasta</label>
                  <CFormInput
                    type="date"
                    name="fechaHasta"
                    value={filtros.fechaHasta}
                    onChange={handleChangeFiltro}
                  />
                </CCol>
              </CRow>
            </CForm>

            {/* Tabla */}
            {cargando ? (
              <div className="text-center my-4">
                <CSpinner />
              </div>
            ) : (
              <CTable striped responsive hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Nombre completo</CTableHeaderCell>
                    <CTableHeaderCell>Documento</CTableHeaderCell>
                    <CTableHeaderCell>Correo</CTableHeaderCell>
                    <CTableHeaderCell>Teléfono</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Fecha registro</CTableHeaderCell>
                    <CTableHeaderCell>Mascotas</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {clientesFiltrados.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center">
                        No se encontraron clientes con los criterios seleccionados.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    clientesFiltrados.map((cliente, index) => (
                      <CTableRow key={cliente.id || index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>
                          {(cliente.nombre || '') + ' ' + (cliente.apellido || '')}
                        </CTableDataCell>
                        <CTableDataCell>
                          {(cliente.tipoDocumento || '') + ' ' + (cliente.numeroDocumento || '')}
                        </CTableDataCell>
                        <CTableDataCell>{cliente.email || '-'}</CTableDataCell>
                        <CTableDataCell>{cliente.telefono || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {cliente.estado === 'INACTIVO' ? (
                            <span className="badge bg-danger">Inactivo</span>
                          ) : (
                            <span className="badge bg-success">Activo</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{formatearFecha(cliente.fechaRegistro)}</CTableDataCell>
                        <CTableDataCell>
                          {cliente.cantidadMascotas != null
                            ? cliente.cantidadMascotas
                            : cliente.mascotas
                            ? cliente.mascotas.length
                            : 0}
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
    </CRow>
  )
}

export default ReporteClientes