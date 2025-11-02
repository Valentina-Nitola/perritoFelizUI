import React, { useMemo, useRef, useState } from 'react'
import {
  CAvatar,
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

const MOCK_USER = {
  name: 'Junior',
  lastname: 'Pérez Ortiz',
  nacimiento: '1997-03-15',
  correo: 'junior12ortiz@gmail.com',
  celular: '3001234567',
  direccion: 'Calle 123 #45-67',
  documento: '1009234576',
  role: 'cliente',
  petsCount: 2,
  createdAt: '2023-10-12',
  about: 'Vivo en blabla y tengo dos mascotas muy gentiles que les encanta comer.',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
}

// helpers -------------------------------------------------
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
  switch (role) {
    case 'director': return 'danger'
    case 'administrador': return 'warning'
    case 'entrenador': return 'info'
    case 'cliente': return 'success'
    default: return 'secondary'
  }
}
// Validaciones
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

const Profile = () => {
  // cache -------------------------------------------------
  let cached = MOCK_USER
  try {
    const raw = localStorage.getItem('user')
    if (raw) cached = { ...MOCK_USER, ...JSON.parse(raw) }
  } catch {}

  // state -------------------------------------------------
  const [form, setForm] = useState({
    name: cached.name || '',
    lastname: cached.lastname || '',
    nacimiento: fmtDate(cached.nacimiento),
    correo: cached.correo || cached.email || '',
    celular: cached.celular || '',
    direccion: cached.direccion || cached.address || '',
    documento: cached.documento || cached.doc || '',
    about: cached.about || '',
  })
  const [errors, setErrors] = useState({})
  const [avatarUrl, setAvatarUrl] = useState(cached.avatarUrl || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [validated, setValidated] = useState(false)
  const fileRef = useRef(null)

  const initials = useMemo(() => {
    const a = (form.name?.[0] || '') + (form.lastname?.[0] || '')
    return a.toUpperCase() || 'PF'
  }, [form.name, form.lastname])
  const age = useMemo(() => getAge(form.nacimiento), [form.nacimiento])

  // handlers ----------------------------------------------
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
      case 'documento':
        if (!value.trim()) return 'El documento es obligatorio.'
        return ''
      default:
        return ''
    }
  }

  const validateAll = () => {
    const nextErrors = {}
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'about') return // opcional
      const msg = validateField(k, v)
      if (msg) nextErrors[k] = msg
    })
    setErrors(nextErrors)
    setValidated(true)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (validated || errors[name]) {
      // valida en caliente si ya intentaron guardar o ya había error
      const msg = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: msg }))
    }
  }

  const handlePickAvatar = () => fileRef.current?.click()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB.')
      return
    }
    const url = URL.createObjectURL(file) // previsualización
    setAvatarUrl(url)
    setAvatarFile(file)
  }

  const handleEditToggle = () => {
    // al cancelar, restablece valores/errores
    if (editMode) {
      setForm({
        name: cached.name || '',
        lastname: cached.lastname || '',
        nacimiento: fmtDate(cached.nacimiento),
        correo: cached.correo || cached.email || '',
        celular: cached.celular || '',
        direccion: cached.direccion || cached.address || '',
        documento: cached.documento || cached.doc || '',
        about: cached.about || '',
      })
      setAvatarUrl(cached.avatarUrl || '')
      setAvatarFile(null)
      setErrors({})
      setValidated(false)
    }
    setEditMode((v) => !v)
  }

  const handleSave = async () => {
    if (!validateAll()) {
      // activa modo edición si no lo estaba y frena guardado
      if (!editMode) setEditMode(true)
      return
    }

    // TODO: conecta con backend (FormData + PUT)
    // const fd = new FormData()
    // Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    // if (avatarFile) fd.append('avatar', avatarFile)
    // await fetch('/api/profile', { method: 'PUT', body: fd })

    try {
      const toSave = { ...cached, ...form, avatarUrl: avatarUrl || cached.avatarUrl }
      localStorage.setItem('user', JSON.stringify(toSave))
      // refresca cache local
      cached = toSave
      setEditMode(false)
      alert('Cambios guardados localmente (mock).')
    } catch {
      alert('No se pudo guardar localmente.')
    }
  }

  // UI ----------------------------------------------------
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
                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Nombres"
                      value={form.name}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.name}
                      required
                    />
                    <CFormFeedback invalid>{errors.name}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      name="lastname"
                      placeholder="Apellidos"
                      value={form.lastname}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.lastname}
                      required
                    />
                    <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="nacimiento"
                      placeholder="Fecha de nacimiento"
                      value={form.nacimiento}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.nacimiento}
                      required
                    />
                    <CFormFeedback invalid>{errors.nacimiento}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilEnvelopeClosed} /></CInputGroupText>
                    <CFormInput
                      type="email"
                      name="correo"
                      placeholder="Correo"
                      value={form.correo}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.correo}
                      required
                    />
                    <CFormFeedback invalid>{errors.correo}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                    <CFormInput
                        type="text"
                        name="celular"
                        placeholder="Celular"
                        value={form.celular}
                        onChange={(e) => {
                            // Solo permite números
                            const numericValue = e.target.value.replace(/\D/g, '')
                            handleChange({ target: { name: e.target.name, value: numericValue } })
                        }}
                        onKeyDown={(e) => {
                            // Bloquea letras, símbolos y espacios
                            if (
                            !/[0-9]/.test(e.key) && // no número
                            e.key !== 'Backspace' &&
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight' &&
                            e.key !== 'Tab'
                            ) {
                            e.preventDefault()
                            }
                        }}
                        readOnly={!editMode}
                        invalid={!!errors.celular}
                        required
                    />
                    <CFormFeedback invalid>{errors.celular}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilHome} /></CInputGroupText>
                    <CFormInput
                      name="direccion"
                      placeholder="Dirección"
                      value={form.direccion}
                      onChange={handleChange}
                      readOnly={!editMode}
                      invalid={!!errors.direccion}
                      required
                    />
                    <CFormFeedback invalid>{errors.direccion}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol md={6}>
                  <CInputGroup hasValidation>
                    <CInputGroupText><CIcon icon={cilBadge} /></CInputGroupText>
                    <CFormInput
                      name="documento"
                      placeholder="Número de documento"
                      value={form.documento}
                      readOnly // no editable
                      invalid={!!errors.documento}
                      required
                    />
                    <CFormFeedback invalid>{errors.documento}</CFormFeedback>
                  </CInputGroup>
                </CCol>

                <CCol xs={12}>
                  <label className="form-label">Sobre mí (opcional)</label>
                  <CFormTextarea
                    rows={4}
                    name="about"
                    placeholder="Escribe algo sobre ti…"
                    value={form.about}
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarChange}
            />
            <CButton color="link" className="p-0 mb-3" onClick={handlePickAvatar}>
              Editar
            </CButton>

            <h6 className="mb-0 text-center">
              {form.name} {form.lastname}{age ? `, ${age}` : ''} años
            </h6>

            <div className="d-flex justify-content-center align-items-center gap-4 my-3">
              <div className="text-center">
                <div className="fs-6 fw-bold">{cached.petsCount ?? 0}</div>
                <div className="text-body-secondary">Mascotas</div>
              </div>
              <div className="vr" />
              <div className="text-center">
                <div className="fs-6 fw-bold">{fmtDate(cached.createdAt)}</div>
                <div className="text-body-secondary">Miembro desde</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mb-2">
              <CBadge color={roleColor(cached.role)}>{cached.role || 'rol'}</CBadge>
            </div>

            <div className="w-100">
              <label className="form-label">Sobre mí</label>
              <CFormTextarea
                rows={4}
                value={form.about}
                onChange={handleChange}
                name="about"
                readOnly={!editMode}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
