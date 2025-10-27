import React, { useState, useRef } from 'react'
export const API_BASE = import.meta.env.VITE_API_BASE
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCarousel,
  CCarouselItem,
  CImage,
  CCarouselCaption,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { authService } from '../../../services/authService'
import { logo } from 'src/assets/brand/logo'
import 'src/scss/patterns.scss'


const images = import.meta.glob('/src/assets/images/Carrusel/*.{png,PNG,jpg,jpeg,webp}', {
  eager: true,
  as: 'url',
})

const slides = Object.values(images).map((url) => ({ src: url }))
console.log('slides', slides)

const Login = () => {
  const [documento, setDocumento] = useState('')
  const [password, setPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef(null)

  const navigate = useNavigate() 

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITEKEY
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

  const handleCaptchaChange = (value) => setRecaptchaToken(value)

//--------------------------------------------------------------------------------
// Adapted handleLogin for Django backend
//--------------------------------------------------------------------------------
const handleLogin = async (e) => {
  e.preventDefault();

  if (!documento || !password) {
    alert('Por favor, completa documento y contraseña');
    return;
  }
  if (!recaptchaToken) {
    alert('Por favor, confirma que no eres un robot');
    return;
  }

  try {
    setLoading(true);
    await authService.verifyRecaptcha(recaptchaToken); 

    // 🔹 Fetch to Django backend
    const response = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documento: documento,  // Django usa 'username', pero tu input es 'documento'
        password: password,
      }),
    });
    console.log("response: ",response)

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)

    console.log("data:", data);

    if (response.ok) {
      console.log("Holaa")
      // 🔹 Guardar sesión local
      localStorage.setItem("user", JSON.stringify(data.usuario));
      alert("✅ Login correcto");
      console.log("Usuario autenticado:", data.usuario);

      navigate("/dashboard");
      console.log("Intentando navegar a /dashboard");
    } else {
      alert(data.error || "Credenciales inválidas");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  } finally {
    setLoading(false);
  }
};


  const canSubmit = !!documento && !!password && !!recaptchaToken && !loading

  return (
    <div className="page-bg-pattern d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4 shadow-lg" style={{ borderRadius: '20px 0 0 20px' }}>
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <div className="text-center mb-4">
                      <h1 className="mb-2">Bienvenido a</h1>
                      <CIcon
                        icon={logo}
                        height={140}
                        className="my-2 text-primary"
                      />

                      <h2 className="mt-2">Iniciar sesión</h2>
                      <p className="text-body-secondary">
                      Recuerda que debes iniciar sesión con el documento de identidad con el cual te registraste
                      </p>
                    </div>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Documento de identidad"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        autoComplete="off"
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                      />
                    </CInputGroup>

                    <div className="mb-3 d-flex justify-content-center">
                      {siteKey ? (
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={siteKey}
                          onChange={handleCaptchaChange}
                        />
                      ) : (
                        <small className="text-danger">
                          Falta configurar <code>VITE_RECAPTCHA_SITEKEY</code> en el .env del frontend
                        </small>
                      )}
                    </div>

                    <CRow className="align-items-center">
                      <CCol xs="auto">
                        <CButton
                          color="success"
                          className="px-4 btn-white-text"
                          type="submit"
                          disabled={!canSubmit}
                        >
                          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </CButton>
                      </CCol>
                      
                      <CCol className="text-end">
                        <Link to="/password">
                          <CButton color="link" className="px-0 text-nowrap">
                            ¿Olvidaste tu contraseña?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>

                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%', borderRadius: '0 20px 20px 0' }}>
                <CCardBody className="text-center">

                  <div className="mb-4" style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <CCarousel
                      ride="carousel"
                      interval={3000}
                      pause={false}     // o "hover" si prefieres que se pause al pasar el mouse
                      wrap
                      controls={false}
                      indicators
                      dark
                    >
                      {slides.map((s, i) => (
                        <CCarouselItem key={i}>
                          <CImage
                            className="d-block w-100"
                            src={s.src}
                            alt={`slide-${i}`}
                            style={{ objectFit: 'cover', height: 240 }}
                          />
                        </CCarouselItem>
                      ))}
                    </CCarousel>
                  </div>


                  <div>
                    <h2>Crea tu cuenta</h2>
                    <p>
                      Convierte el amor por tu mascota en su mejor versión. ¡Regístrate y empieza su camino hacia la obediencia y la grandeza!
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        ¡Regístrate ahora!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login