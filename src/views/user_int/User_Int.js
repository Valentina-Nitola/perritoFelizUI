import { crearUsuarioInterno } from 'src/services/usersService'
import React, { useEffect, useMemo, useState } from 'react'
import {
  CRow, CCol, CCard, CCardHeader, CCardBody,
  CForm, CInputGroup, CInputGroupText, CFormInput, CFormSelect,
  CFormFeedback, CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CSpinner, CPagination, CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilEnvelopeClosed,
  cilLockLocked,
  cilBadge,
  cilCalendar,
  cilBirthdayCake,
  cilSearch,
  cilPencil,
  cilBan,
} from '@coreui/icons'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const strongPassRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const InternalUsers = () => {
  // ---------- FORM CREACIÓN / EDICIÓN ----------
  const initialFormState = {
    name: '',
    lastname: '',
    nacimiento: '',
    tipoDoc: '',
    doc: '',
    vinculacion: '',
    email: '',
    password: '',
    role: '',
  }

  const [form, setForm] = useState(initialFormState)
  const [validated, setValidated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // usuario que se está editando (null = modo crear)
  const [editingUser, setEditingUser] = useState(null)

  const isEditing = !!editingUser

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetFormToCreate = () => {
    setForm(initialFormState)
    setValidated(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    // validaciones comunes (sin incluir password si estamos editando)
    const { password, ...formWithoutPassword } = form
    const fieldsToValidate = isEditing ? formWithoutPassword : form

    const allFilled = Object.values(fieldsToValidate).every(
      (v) => String(v).trim() !== '',
    )
    const validEmail = emailRe.test(form.email)
    const validPass = strongPassRe.test(form.password)

    if (!allFilled) return alert('Por favor completa todos los campos obligatorios.')
    if (!validEmail) return alert('El correo electrónico no tiene un formato válido.')

    if (!isEditing) {
      // solo en creación exigimos contraseña
      if (!validPass) {
        return alert(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
        )
      }
    }

    try {
      setSubmitting(true)

      if (!isEditing) {
        // --------- CREAR USUARIO ---------
        const payload = {
          tipo_usuario: form.role.toUpperCase(),
          tipo_documento: form.tipoDoc,
          documento: form.doc,
          nombres: form.name,
          apellidos: form.lastname,
          fecha_nacimiento: form.nacimiento,
          fecha_vinculacion: form.vinculacion,
          email: form.email,
          password: form.password,
        }
        const nuevoUsuario = await crearUsuarioInterno(payload)
        console.log('Usuario interno creado:', nuevoUsuario)
        alert(`Usuario ${form.name} (${form.role}) creado exitosamente.`)
        resetFormToCreate()
        await refreshList()
      } else {
        // --------- EDITAR / ACTUALIZAR USUARIO ---------
        if (!editingUser.id) {
          throw new Error('No se encontró el ID del usuario a editar.')
        }

        const payloadUpdate = {
          tipo_usuario: form.role.toUpperCase(),
          tipo_documento: form.tipoDoc,
          documento: form.doc,
          nombres: form.name,
          apellidos: form.lastname,
          fecha_nacimiento: form.nacimiento,
          fecha_vinculacion: form.vinculacion,
          email: form.email,
          // NOTA: no enviamos password aquí, para no sobreescribirla
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/usuarios-internos/${editingUser.id}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access')}`,
            },
            body: JSON.stringify(payloadUpdate),
          },
        )

        if (!res.ok) {
          throw new Error(`Error ${res.status} al actualizar el usuario interno`)
        }

        const updatedUser = await res.json()
        console.log('Usuario interno actualizado:', updatedUser)
        alert(`Usuario ${form.name} actualizado correctamente.`)
        resetFormToCreate()
        await refreshList()
      }
    } catch (err) {
      console.error('Error en submit de usuario interno:', err)
      alert(err.message || 'Ocurrió un error al guardar el usuario.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- LISTADO + FILTROS ----------
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  // Filtros (mínimo 2: búsqueda y rol). Extras: fecha desde/hasta
  const [filters, setFilters] = useState({
    q: '',
    role: '',
    from: '',
    to: '',
  })

  // Debounce para búsqueda
  const [qTyping, setQTyping] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: qTyping }))
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [qTyping])

  const refreshList = async () => {
    try {
      setLoading(true)
      // Adaptamos los filtros del frontend a los que espera Django
      const params = {
        page,
        page_size: pageSize,
        search: filters.q?.trim() || undefined, // búsqueda general
        tipo_usuario: filters.role || undefined, // ADMIN, DIRECTOR, ENTRENADOR
        fecha_vinculacion_after: filters.from || undefined, // desde
        fecha_vinculacion_before: filters.to || undefined, // hasta
      }

      // Convertimos params en query string limpia
      const query = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')

      // Petición al backend
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/usuarios-internos/?${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        },
      )

      if (!res.ok) throw new Error(`Error ${res.status} al listar usuarios internos`)
      const data = await res.json()

      const items = data.results || data.items || data
      const totalCount = data.count || data.total || items.length

      setUsers(items)
      setTotal(totalCount)
    } catch (err) {
      console.error('Error listando usuarios internos:', err)
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.role, filters.from, filters.to, filters.q])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / pageSize)),
    [total, pageSize],
  )

  const resetFilters = () => {
    setFilters({ q: '', role: '', from: '', to: '' })
    setQTyping('')
    setPage(1)
  }

  // ---------- ACCIONES (EDITAR / ACTIVAR-DESACTIVAR) ----------
  const handleEditUser = (user) => {
    setEditingUser(user)

    setForm({
      name: user.nombres || '',
      lastname: user.apellidos || '',
      nacimiento: user.fecha_nacimiento || '',
      tipoDoc: user.tipo_documento || '',
      doc: user.documento || '',
      vinculacion: user.fecha_vinculacion || '',
      email: user.email || '',
      password: '', // no editamos contraseña aquí
      role: user.tipo_usuario || '',
    })

    setValidated(false)

    // opcional: subir al inicio del formulario al editar
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggleActiveUser = async (user) => {
    const estaActivo = user.activo // ajusta al nombre real del campo en tu backend
    const accion = estaActivo ? 'Desactivar' : 'Activar'

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion.toLowerCase()} al usuario ${user.nombres} ${user.apellidos}?`,
    )
    if (!confirmar) return

    try {
      // TODO: ajustar endpoint a tu backend real
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/usuarios-internos/${user.id_usuario}/toggle-activo/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        },
      )

      if (!res.ok) {
        throw new Error(`Error ${res.status} al ${accion.toLowerCase()} el usuario`)
      }

      await refreshList()
    } catch (err) {
      console.error(`Error al ${accion.toLowerCase()} usuario:`, err)
      alert(`No fue posible ${accion.toLowerCase()} el usuario.`)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          {isEditing
            ? `Editar usuario interno – ${editingUser?.tipo_documento || ''} ${
                editingUser?.documento || ''
              }`
            : 'Crear usuario interno'}
        </CCardHeader>
        <CCardBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <CRow>
              <CCol md={6}>
                {/* Rol */}
                <div className="mb-3">
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilBadge} />
                    </CInputGroupText>
                    <CFormSelect
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="ENTRENADOR">Entrenador</option>
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilBirthdayCake} />
                    </CInputGroupText>
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilBadge} />
                    </CInputGroupText>
                    <CFormSelect
                      name="tipoDoc"
                      value={form.tipoDoc}
                      onChange={handleChange}
                      required
                      disabled={isEditing} // no editar tipo de documento
                    >
                      <option value="">Selecciona el tipo de documento</option>
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="CE">Cédula de extranjería</option>
                      <option value="PAS">Pasaporte</option>
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} />
                    </CInputGroupText>
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
                  <CInputGroup>
                    <CInputGroupText>#</CInputGroupText>
                    <CFormInput
                      type="text"
                      name="doc"
                      placeholder="Número de documento"
                      value={form.doc}
                      onChange={handleChange}
                      required
                      disabled={isEditing} // no editar número de documento
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
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeClosed} />
                    </CInputGroupText>
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

              {!isEditing && (
                <CCol md={6}>
                  {/* Contraseña (solo en creación) */}
                  <div className="mb-3">
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <CFormFeedback invalid>
                        Debe tener al menos 8 caracteres, una mayúscula, una
                        minúscula y un número.
                      </CFormFeedback>
                    </CInputGroup>
                  </div>
                </CCol>
              )}
            </CRow>

            <div className="d-grid d-sm-flex gap-2">
              <CButton color="primary" type="submit" disabled={submitting}>
                {submitting
                  ? isEditing
                    ? 'Actualizando…'
                    : 'Creando…'
                  : isEditing
                  ? 'Actualizar usuario'
                  : 'Crear usuario'}
              </CButton>

              {isEditing ? (
                <CButton
                  color="secondary"
                  variant="outline"
                  type="button"
                  onClick={resetFormToCreate}
                  disabled={submitting}
                >
                  Cancelar edición
                </CButton>
              ) : (
                <CButton
                  color="secondary"
                  variant="outline"
                  type="button"
                  onClick={resetFormToCreate}
                  disabled={submitting}
                >
                  Limpiar
                </CButton>
              )}
            </div>
          </CForm>
        </CCardBody>

        {/* ------------------ LISTADO / TABLA ------------------ */}
        <CCardHeader>Usuarios</CCardHeader>
        <CCardBody>
          {/* Filtros */}
          <CRow className="g-3 align-items-end mb-3">
            <CCol md={5}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar por nombre, apellidos, email o documento"
                  value={qTyping}
                  onChange={(e) => setQTyping(e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.role}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, role: e.target.value }))
                  setPage(1)
                }}
              >
                <option value="">Todos los roles</option>
                <option value="DIRECTOR">Director</option>
                <option value="ADMIN">Administrador</option>
                <option value="ENTRENADOR">Entrenador</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                value={filters.from}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, from: e.target.value }))
                  setPage(1)
                }}
                placeholder="Desde"
              />
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                value={filters.to}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, to: e.target.value }))
                  setPage(1)
                }}
                placeholder="Hasta"
              />
            </CCol>
            <CCol xs="12" className="d-flex gap-2">
              <CButton color="secondary" variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </CButton>
            </CCol>
          </CRow>

          {/* Tabla */}
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <CSpinner size="sm" /> Cargando usuarios…
            </div>
          ) : users.length === 0 ? (
            <p className="text-body-secondary m-0">
              No se encontraron usuarios con los filtros aplicados.
            </p>
          ) : (
            <>
              <CTable responsive hover align="middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Documento</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Rol</CTableHeaderCell>
                    <CTableHeaderCell>Nacimiento</CTableHeaderCell>
                    <CTableHeaderCell>Vinculación</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">
                      Acciones
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((u) => (
                    <CTableRow
                      key={u.id || `${u.tipo_documento}-${u.documento}`}
                    >
                      <CTableDataCell>
                        {u.tipo_documento} {u.documento}
                      </CTableDataCell>
                      <CTableDataCell>
                        {u.nombres} {u.apellidos}
                      </CTableDataCell>
                      <CTableDataCell>{u.tipo_usuario}</CTableDataCell>
                      <CTableDataCell>{u.fecha_nacimiento}</CTableDataCell>
                      <CTableDataCell>{u.fecha_vinculacion}</CTableDataCell>
                      <CTableDataCell>{u.email}</CTableDataCell>

                      {/* Acciones */}
                      <CTableDataCell className="text-end">
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          variant="outline"
                          onClick={() => handleEditUser(u)}
                          title="Editar usuario"
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>

                        <CButton
                          color={u.activo ? 'danger' : 'success'}
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActiveUser(u)}
                          title={
                            u.activo
                              ? 'Desactivar usuario'
                              : 'Activar usuario'
                          }
                        >
                          <CIcon icon={cilBan} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-body-secondary">Filas por página:</span>
                  <CFormSelect
                    style={{ width: 90 }}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPage(1)
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </CFormSelect>
                </div>

                <CPagination align="end" className="m-0">
                  <CPaginationItem
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                  >
                    «
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={page === 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                  >
                    ‹
                  </CPaginationItem>
                  <CPaginationItem active>{page}</CPaginationItem>
                  <CPaginationItem
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    ›
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    »
                  </CPaginationItem>
                </CPagination>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default InternalUsers
