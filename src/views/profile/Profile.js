// ----------------------------------------------
// src/views/profile/Profile.js
// ----------------------------------------------
import React, { useMemo, useRef, useState, useEffect } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormFeedback,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilEnvelopeClosed, cilHome, cilPhone, cilUser, cilBadge } from '@coreui/icons'
import { useAuthUser } from 'src/context/AuthUserContext'
import { profileService } from 'src/services/profileService'

// ----------------------------------------------
// Usuario por defecto (mock local)
// ----------------------------------------------
const MOCK_USER = {
  name: 'Usuario',
  lastname: '',
  nacimiento: '',
  correo: '',
  celular: '',
  direccion: '',
  documento: '',
  role: 'cliente',
  petsCount: 0,
  createdAt: '',
  about: 'Aquí puedes escribir algo sobre ti...',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
}

// ----------------------------------------------
// Helpers
// ----------------------------------------------
const fmtDate = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getAge = (isoStr) => {
  if (!isoStr) return ''
  const b = new Date(isoStr)
  if (Number.isNaN(b.getTime())) return ''
  const t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  const m = t.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--
  return age
}

const roleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'director': return 'danger'
    case 'administrador': return 'warning'
    case 'entrenador': return 'info'
    case 'cliente': return 'success'
    default: return 'secondary'
  }
}

// ----------------------------------------------
// Validaciones
// ----------------------------------------------
const nameRe = /^[A-Za-zÀ-ÿ\u00f1\u00d1 ]{2,60}$/
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const digitsRe = /^[0-9]{7,15}$/
const isFuture = (yyyyMmDd) => {
  if (!yyyyMmDd) return false
  const d = new Date(yyyyMmDd)
  const today = new Date()
  d.setHours(0,0,0,0); today.setHours(0,0,0,0)
  return d.getTime() > today.getTime()
}

// ----------------------------------------------
// Componente principal
// ----------------------------------------------
const Profile = () => {
  const { user: ctxUser, updateUser } = useAuthUser()

  const [form, setForm] = useState(MOCK_USER)
  const [baseUser, setBaseUser] = useState(MOCK_USER)
  const [errors, setErrors] = useState({})
  const [avatarUrl, setAvatarUrl] = useState(MOCK_USER.avatarUrl)
  const [avatarFile, setAvatarFile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [validated, setValidated] = useState(false)
  const fileRef = useRef(null)

  // ----------------------------------------------
  // Cargar perfil desde el backend
  // ----------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access')
        console.log("🔹 Token del localStorage:", token) // 👈 agrega esto
        if (!token) return
        const data = await profileService.getProfile(token)

        // 🔹 Mapeo de los campos reales del backend → frontend
        const usuario = {
          name: data.nombres || '',
          lastname: data.apellidos || '',
          nacimiento: fmtDate(data.fecha_nacimiento),
          correo: data.email || '',
          celular: data.telefono || '',
          direccion: data.direccion || '',
          documento: data.documento || '',
          role: data.tipo_usuario?.toLowerCase() || 'cliente',
          petsCount: data.petsCount,
          createdAt: fmtDate(data.fecha_registro),
          about: 'Aquí puedes escribir algo sobre ti...',
          avatarUrl: data.foto || MOCK_USER.avatarUrl,
        }

        setForm(usuario)
        setBaseUser(usuario)
        setAvatarUrl(usuario.avatarUrl)
        updateUser(usuario)
        console.log("Usuario:",usuario)
      } catch (err) {
        console.error('Error al obtener perfil:', err)
      }
    }

    fetchProfile()
  }, [])

  // ----------------------------------------------
  // Validaciones
  // ----------------------------------------------
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio.'
        if (!nameRe.test(value.trim())) return 'Solo letras y espacios (2–60).'
        return ''
      case 'lastname':
        if (!value.trim()) return 'El apellido es obligatorio.'
        if (!nameRe.test(value.trim())) return 'Solo letras y espacios (2–60).'
        return ''
      case 'correo':
        if (!value.trim()) return 'El correo es obligatorio.'
        if (!emailRe.test(value.trim())) return 'Correo inválido.'
        return ''
      case 'celular':
        if (!value.trim()) return 'El celular es obligatorio.'
        if (!digitsRe.test(value.trim())) return 'Debe tener 7–15 dígitos.'
        return ''
      case 'direccion':
        if (!value.trim()) return 'La dirección es obligatoria.'
        return ''
      case 'nacimiento':
        if (!value) return 'La fecha de nacimiento es obligatoria.'
        if (isFuture(value)) return 'La fecha no puede ser futura.'
        return ''
      default:
        return ''
    }
  }

  const validateAll = () => {
    const nextErrors = {}
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'about') return
      const msg = validateField(k, v || '')
      if (msg) nextErrors[k] = msg
    })
    setErrors(nextErrors)
    setValidated(true)
    return Object.keys(nextErrors).length === 0
  }

  // ----------------------------------------------
  // Handlers
  // ----------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value ?? '' }))
    if (validated || errors[name]) {
      const msg = validateField(name, value ?? '')
      setErrors((prev) => ({ ...prev, [name]: msg }))
    }
  }

  const handlePickAvatar = () => fileRef.current?.click()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Selecciona una imagen válida.')
    if (file.size > 5 * 1024 * 1024) return alert('La imagen no debe superar 5MB.')
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    setAvatarFile(file)
  }

  const handleEditToggle = () => {
    if (editMode) {
      setForm(baseUser)
      setAvatarUrl(baseUser.avatarUrl)
      setAvatarFile(null)
      setErrors({})
      setValidated(false)
    }
    setEditMode((v) => !v)
  }

  const handleSave = async () => {
    if (!validateAll()) return
    try {
      const token = localStorage.getItem('access')
      const data = {
        nombres: form.name,
        apellidos: form.lastname,
        fecha_nacimiento: form.nacimiento,
        telefono: form.celular,
        email: form.correo,
        direccion: form.direccion,
      }
      await profileService.updateProfile(data, token)
      alert('✅ Perfil actualizado correctamente.')
      setEditMode(false)
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      alert('⚠️ Error al actualizar el perfil.')
    }
  }

  const age = useMemo(() => getAge(form.nacimiento), [form.nacimiento])

  // ----------------------------------------------
  // Render
  // ----------------------------------------------
  return (
    <CRow className="g-4">
      {/* Columna izquierda */}
      <CCol lg={7}>
        <CCard className="mb-3">
          <CCardHeader className="p-4" style={{ background: 'linear-gradient(135deg,#165f7b,#2c6e91)', color: 'white' }}>
            <h3 className="mb-2">Hola {form.name || 'Usuario'},</h3>
            <p className="mb-3">Esta es tu sección de perfil. Puedes editar tu información personal para mantenernos conectados.</p>
            <div className="d-flex gap-2">
              <CButton color="success" onClick={handleEditToggle}>
                {editMode ? 'Cancelar' : 'Editar perfil'}
              </CButton>
              <CButton color="success" variant="outline" onClick={handleSave}>
                Guardar cambios
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            <CForm noValidate>
              <CRow className="g-4">
                {/* Nombres */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      name="name"
                      value={form.name || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.name}
                      required
                      placeholder="Nombres"
                    />
                    <CFormFeedback invalid>{errors.name}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Apellidos */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      name="lastname"
                      value={form.lastname || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.lastname}
                      required
                      placeholder="Apellidos"
                    />
                    <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Fecha de nacimiento */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="nacimiento"
                      value={form.nacimiento || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.nacimiento}
                      required
                    />
                    <CFormFeedback invalid>{errors.nacimiento}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Correo */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilEnvelopeClosed} /></CInputGroupText>
                    <CFormInput
                      name="correo"
                      value={form.correo || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.correo}
                      required
                      placeholder="Correo"
                    />
                    <CFormFeedback invalid>{errors.correo}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Celular */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                    <CFormInput
                      name="celular"
                      value={form.celular || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.celular}
                      required
                      placeholder="Celular"
                    />
                    <CFormFeedback invalid>{errors.celular}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Dirección */}
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilHome} /></CInputGroupText>
                    <CFormInput
                      name="direccion"
                      value={form.direccion || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.direccion}
                      required
                      placeholder="Dirección"
                    />
                    <CFormFeedback invalid>{errors.direccion}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                {/* Documento */}
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormInput
                      name="documento"
                      value={form.documento || ''}
                      readOnly
                      placeholder="Documento"
                    />
                  </CInputGroup>
                </CCol>

                {/* Sobre mí */}
                <CCol xs={12}>
                  <label className="form-label">Sobre mí (opcional)</label>
                  <CFormTextarea
                    rows={4}
                    name="about"
                    placeholder="Escribe algo sobre ti…"
                    value={form.about || ''}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Columna derecha */}
      <CCol lg={5}>
        <CCard className="h-100">
          <CCardBody className="d-flex flex-column align-items-center">
            <div className="position-relative mb-2" style={{ width: 190, height: 190 }}>
              <div className="rounded-circle overflow-hidden" style={{ width: '100%', height: '100%' }}>
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
            <CButton color="link" className="p-0 mb-3" onClick={handlePickAvatar}>Editar</CButton>

            <h6 className="mb-0 text-center">
              {form.name} {form.lastname}{age ? `, ${age}` : ''} años
            </h6>

            <div className="d-flex justify-content-center align-items-center gap-4 my-3">
              <div className="text-center">
                <div className="fs-6 fw-bold">{baseUser.petsCount ?? 0}</div>
                <div className="text-body-secondary">Mascotas</div>
              </div>
              <div className="vr" />
              <div className="text-center">
                <div className="fs-6 fw-bold">{baseUser.createdAt}</div>
                <div className="text-body-secondary">Miembro desde</div>
              </div>
            </div>

            <CBadge color={roleColor(baseUser.role)}>{baseUser.role}</CBadge>

            <div className="w-100 mt-3">
              <label className="form-label">Sobre mí</label>
              <CFormTextarea rows={4} value={form.about || ''} readOnly />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
