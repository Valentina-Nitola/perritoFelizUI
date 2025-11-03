import React, { useEffect, useRef, useState } from 'react'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDog, cilCalendar, cilChart, cilChartPie, cilUser } from '@coreui/icons'
import 'chart.js/auto'
import { Chart } from 'chart.js'

/**
 * DASHBOARD CLIENTE – ESCUELA CANINA
 * Funcionando con Mocks por ahora
 */

// Utils
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)

// Mocks de fecha
const mockNow = new Date()
const mockMonthIndex = mockNow.getMonth()
const mockYear = mockNow.getFullYear()

// ====== MOCKS DE DATOS (simulan respuesta de backend) ======
const mockDogs = [
  {
    id: 1,
    name: 'Luna',
    plan: 'Mensual',
    avatar: 'https://place-puppy.com/80x80',
    expiresAt: new Date(mockYear, mockMonthIndex, 28), // vence este mes
    absencesThisMonth: 1,
    learning: { animo: 85, obediencia: 78, sociabilidad: 90, conciencia: 82, actividad: 75 }, // 0–100
    health: { conciencia: 90, mucosas: 84, pelajePiel: 88, peso: 80, abdomen: 92 }, // 0–100
  },
  {
    id: 2,
    name: 'Rocky',
    plan: 'Bimestral',
    avatar: 'https://place-puppy.com/81x81',
    expiresAt: new Date(mockYear, mockMonthIndex + 1, 12), // siguiente mes
    absencesThisMonth: 2,
    learning: { animo: 70, obediencia: 74, sociabilidad: 76, conciencia: 68, actividad: 82 },
    health: { conciencia: 88, mucosas: 79, pelajePiel: 85, peso: 76, abdomen: 86 },
  },
  {
    id: 3,
    name: 'Kira',
    plan: 'Semestral',
    avatar: 'https://place-puppy.com/83x83',
    expiresAt: new Date(mockYear, mockMonthIndex + 2, 5),
    absencesThisMonth: 0,
    learning: { animo: 92, obediencia: 88, sociabilidad: 91, conciencia: 87, actividad: 89 },
    health: { conciencia: 93, mucosas: 90, pelajePiel: 95, peso: 88, abdomen: 91 },
  },
]

// Helpers de cálculo
const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24))

const calcNextExpiryDays = (dogs) => {
  const today = new Date()
  const future = dogs
    .map((d) => ({ id: d.id, days: daysBetween(today, d.expiresAt) }))
    .filter((d) => d.days >= 0)
  if (!future.length) return 0
  return Math.min(...future.map((f) => f.days))
}

const avg = (arr) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0)

const learningKeys = ['animo', 'obediencia', 'sociabilidad', 'conciencia', 'actividad']
const healthKeys = ['conciencia', 'mucosas', 'pelajePiel', 'peso', 'abdomen']

const averageLearning = (dogs) => {
  const values = dogs.map((d) => avg(Object.values(d.learning)))
  return Math.round(avg(values))
}

const aggregateByKeys = (dogs, keys, selector) => {
  const res = {}
  keys.forEach((k) => {
    res[k] = Math.round(avg(dogs.map((d) => selector(d)[k])))
  })
  return res
}

// ====== COMPONENTES REUTILIZABLES ======
const KpiCard = ({ title, value, subtitle, icon = cilDog }) => (
  <CCard className="h-100 shadow-sm">
    <CCardBody className="p-3">
      <div className="border-start border-start-4 border-start-primary ps-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="text-body-secondary small text-uppercase fw-semibold">{title}</div>
          <div className="opacity-50">
            <CIcon icon={icon} size="lg" />
          </div>
        </div>
        <div className="display-6 fw-bold lh-1">
          {typeof value === 'number' ? fmt(value) : value}
        </div>
        {subtitle && <div className="small text-body-secondary mt-2">{subtitle}</div>}
      </div>
    </CCardBody>
  </CCard>
)

const RadarChart = ({ title, labels, data, icon = cilChart }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{ label: title, data: data }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: { r: { beginAtZero: true, suggestedMax: 100, ticks: { stepSize: 20 } } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [labels, data, title])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={icon} />
        <span>{title} – {monthNames[mockMonthIndex]} {mockYear}</span>
      </CCardHeader>
      <CCardBody style={{ height: 340 }}>
        <canvas ref={canvasRef} />
      </CCardBody>
    </CCard>
  )
}

const BarAbsences = ({ dogs }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: dogs.map((d) => d.name),
        datasets: [
          { label: 'Faltas en el mes', data: dogs.map((d) => d.absencesThisMonth) },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [dogs])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilCalendar} />
        <span>Faltas por canino – {monthNames[mockMonthIndex]} {mockYear}</span>
      </CCardHeader>
      <CCardBody style={{ height: 320 }}>
        <canvas ref={canvasRef} />
      </CCardBody>
      <CCardFooter className="text-center small text-body-secondary">
        Total de faltas del mes: <strong>{fmt(dogs.reduce((s, d) => s + d.absencesThisMonth, 0))}</strong>
      </CCardFooter>
    </CCard>
  )
}

const DogsTable = ({ items }) => (
  <CCard className="shadow-sm">
    <CCardHeader>Resumen de tus caninos</CCardHeader>
    <CCardBody>
      <CTable align="middle" hover responsive className="mb-0 border">
        <CTableHead className="text-nowrap">
          <CTableRow>
            <CTableHeaderCell className="bg-body-tertiary text-center"><CIcon icon={cilDog} /></CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Nombre</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Plan</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Dias restantes</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Faltas mes</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Aprendizaje (prom.)</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Salud (prom.)</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.map((it, i) => {
            const daysLeft = Math.max(0, daysBetween(new Date(), it.expiresAt))
            const learnAvg = Math.round(avg(Object.values(it.learning)))
            const healthAvg = Math.round(avg(Object.values(it.health)))
            return (
              <CTableRow key={i}>
                <CTableDataCell className="text-center">
                  <CAvatar size="md" src={it.avatar} />
                </CTableDataCell>
                <CTableDataCell className="fw-semibold">{it.name}</CTableDataCell>
                <CTableDataCell>{it.plan}</CTableDataCell>
                <CTableDataCell className="text-end">
                  <CBadge color={daysLeft <= 7 ? 'danger' : daysLeft <= 15 ? 'warning' : 'success'}>
                    {daysLeft}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-end">{it.absencesThisMonth}</CTableDataCell>
                <CTableDataCell className="text-end">{learnAvg}</CTableDataCell>
                <CTableDataCell className="text-end">{healthAvg}</CTableDataCell>
              </CTableRow>
            )
          })}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

// ====== COMPONENTE PRINCIPAL ======
const Dashboard_Client = () => {
  const [loading, setLoading] = useState(false)

  // Estado con mocks (luego se reemplaza con fetch)
  const [dogs, setDogs] = useState(mockDogs)

  // KPIs calculados
  const kpiDogs = dogs.length
  const kpiNextExpiryDays = calcNextExpiryDays(dogs)
  const kpiAbsences = dogs.reduce((s, d) => s + d.absencesThisMonth, 0)
  const kpiLearningAvg = averageLearning(dogs)

  // Series agregadas para radars
  const learningAgg = aggregateByKeys(dogs, learningKeys, (d) => d.learning)
  const healthAgg = aggregateByKeys(dogs, healthKeys, (d) => d.health)

  /**
   * TODO (BACK): Endpoints sugeridos
   * 1) GET /me/dogs
   *    -> [{ id, name, plan, avatarUrl, expiresAt, absencesThisMonth }]
   * 2) GET /me/dogs/metrics/learning?month=YYYY-MM
   *    -> [{ dogId, animo, obediencia, sociabilidad, conciencia, actividad }]
   * 3) GET /me/dogs/metrics/health?month=YYYY-MM
   *    -> [{ dogId, conciencia, mucosas, pelajePiel, peso, abdomen }]
   * 4) (Opcional) GET /me/dashboard/summary?month=YYYY-MM
   *    -> { dogsCount, nextExpiryDays, totalAbsences, learningAvg }
   */

  // Ejemplo de carga real (descomenta cuando esté el back)
  // useEffect(() => {
  //   const controller = new AbortController()
  //   async function loadAll() {
  //     try {
  //       setLoading(true)
  //       const now = new Date()
  //       const y = now.getFullYear()
  //       const m = String(now.getMonth() + 1).padStart(2, '0')
  //
  //       const dogsRes = await fetch(`/me/dogs`, { signal: controller.signal, credentials: 'include' })
  //       const dogsJson = await dogsRes.json()
  //
  //       const learnRes = await fetch(`/me/dogs/metrics/learning?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const learnJson = await learnRes.json()
  //
  //       const healthRes = await fetch(`/me/dogs/metrics/health?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const healthJson = await healthRes.json()
  //
  //       // Combinar métricas con perros
  //       const merged = dogsJson.map((d) => ({
  //         ...d,
  //         learning: learnJson.find((l) => l.dogId === d.id),
  //         health: healthJson.find((h) => h.dogId === d.id),
  //       }))
  //       setDogs(merged)
  //     } catch (e) {
  //       console.error(e)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   loadAll()
  //   return () => controller.abort()
  // }, [])

  return (
    <>
      {/* FILA 1: KPIs */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Tus caninos"
            value={kpiDogs}
            subtitle="Caninos activos en tu cuenta"
            icon={cilDog}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Próximo vencimiento"
            value={`${kpiNextExpiryDays} días`}
            subtitle="Matrícula más próxima a vencer"
            icon={cilCalendar}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title={`Faltas (${monthNames[mockMonthIndex]} ${mockYear})`}
            value={kpiAbsences}
            subtitle="Total de faltas de tus caninos"
            icon={cilUser}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Aprendizaje (prom.)"
            value={`${kpiLearningAvg}`}
            subtitle="Promedio 0–100 del mes"
            icon={cilChart}
          />
        </CCol>
      </CRow>

      {/* FILA 2: Gráficos principales */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={6}>
          <RadarChart
            title="Aprendizaje"
            labels={['Ánimo', 'Obediencia', 'Sociabilidad', 'Conciencia', 'Actividad']}
            data={learningKeys.map((k) => learningAgg[k])}
            icon={cilChart}
          />
        </CCol>
        <CCol xs={12} md={6}>
          <RadarChart
            title="Salud"
            labels={['Conciencia', 'Mucosas', 'Pelaje/Piel', 'Peso', 'Abdomen']}
            data={healthKeys.map((k) => healthAgg[k])}
            icon={cilChartPie}
          />
        </CCol>
      </CRow>

      {/* FILA 3: Faltas por canino */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <BarAbsences dogs={dogs} />
        </CCol>
      </CRow>

      {/* FILA 4: Tabla resumen */}
      <CRow>
        <CCol xs={12}>
          <DogsTable items={dogs} />
        </CCol>
      </CRow>

      {loading && (
        <div className="text-center my-3 small text-body-secondary">Cargando tus datos…</div>
      )}
    </>
  )
}

export default Dashboard_Client
