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
import { cilCloudDownload, cilDog, cilChart, cilUser, cilMoney, cilChartPie } from '@coreui/icons'
import 'chart.js/auto'
import { Chart } from 'chart.js'

/**
 * DASHBOARD ADMIN/DIRECTOR – ESCUELA CANINA
 * Funcionando con Mocks por ahora
 */

// Utils
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)

// Mocks
const mockNow = new Date()
const mockMonthIndex = mockNow.getMonth()
const mockYear = mockNow.getFullYear()

// KPIs
const mockKpiMatriculadosMes = 37
const mockKpiEntrenadoresActivos = 6
const mockKpiIngresosMes = 12450000 // COP
const mockKpiAsistenciaPct = 86 // %

const mockTransporteMes = {
  total: 18,
  parcial: 11,
  sin: 8,
}


const mockPlanesMes = {
  mensual: 14,
  bimestral: 9,
  trimestral: 7,
  semestral: 5,
  anual: 3,
}

const buildLast6Months = () => {
  const arr = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(mockYear, mockMonthIndex - i, 1)
    arr.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      value: Math.floor(20 + Math.random() * 40),
    })
  }
  return arr
}
const mockSerie6 = buildLast6Months()

const mockReports = {
  monthly: Array.from({ length: 12 }, (_, m) => ({
    label: monthNames[m],
    value: Math.floor(18 + Math.random() * 45),
  })),
  quarterly: [
    { label: 'Q1', value: 95 },
    { label: 'Q2', value: 110 },
    { label: 'Q3', value: 87 },
    { label: 'Q4', value: 103 },
  ],
  semiannual: [
    { label: 'S1', value: 205 },
    { label: 'S2', value: 190 },
  ],
  annual: [
    { label: `${mockYear - 2}`, value: 360 },
    { label: `${mockYear - 1}`, value: 410 },
    { label: `${mockYear}`, value: 395 },
  ],
}

const mockLatest = [
  { name: 'Luna', owner: 'Lucas', plan: 'Mensual', edad: '2 años', fecha: '01 Oct, ' + mockYear, avatar: 'https://place-puppy.com/80x80' },
  { name: 'Rocky', owner: 'Matias', plan: 'Mensual', edad: '10 meses', fecha: '12 Oct, ' + mockYear, avatar: 'https://place-puppy.com/81x81' },
  { name: 'Max', owner: 'Laura', plan: 'Semestral', edad: '3 años', fecha: '20 Oct, ' + mockYear, avatar: 'https://place-puppy.com/82x82' },
  { name: 'Kira', owner: 'Samuel', plan: 'Bimestral', edad: '1 año', fecha: '25 Oct, ' + mockYear, avatar: 'https://place-puppy.com/83x83' },
]

// === Componentes ===

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

const DoughnutTransport = ({ data }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const total = data.total + data.parcial + data.sin

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Todo el día', 'Medio día', 'Sin transporte'],
        datasets: [{ data: [data.total, data.parcial, data.sin] }],
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true },
        },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilChart} />
        <span>Transporte – {monthNames[mockMonthIndex]} {mockYear}</span>
      </CCardHeader>

      <CCardBody className="d-flex flex-column p-3" style={{ height: 320 }}>
        <div className="flex-grow-1 position-relative">
          <canvas ref={canvasRef} />
        </div>
      </CCardBody>

      <CCardFooter
        className="text-center small text-body-secondary text-wrap"
        style={{ wordBreak: 'break-word' }}
      >
        Total perros con algún transporte este mes: <strong>{fmt(data.total + data.parcial)}</strong> / {fmt(total)}
      </CCardFooter>
    </CCard>
  )
}

const DoughnutPlans = ({ data }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const total =
    (data.mensual ?? 0) +
    (data.bimestral ?? 0) +
    (data.trimestral ?? 0) +
    (data.semestral ?? 0) +
    (data.anual ?? 0)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'],
        datasets: [
          {
            data: [
              data.mensual ?? 0,
              data.bimestral ?? 0,
              data.trimestral ?? 0,
              data.semestral ?? 0,
              data.anual ?? 0,
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true },
        },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilChartPie} />
        <span>Distribución de planes – {monthNames[mockMonthIndex]} {mockYear}</span>
      </CCardHeader>
      <CCardBody className="d-flex flex-column p-3" style={{ height: 320 }}>
        <div className="flex-grow-1 position-relative">
          <canvas ref={canvasRef} />
        </div>
      </CCardBody>
      <CCardFooter className="text-center small text-body-secondary">
        Total matrículas del mes: <strong>{fmt(total)}</strong>
      </CCardFooter>
    </CCard>
  )
}

const LineLast6Months = ({ serie }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: serie.map((s) => s.label),
        datasets: [
          {
            label: 'Matriculados',
            data: serie.map((s) => s.value),
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [serie])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilChart} />
        <span>Últimos 6 meses</span>
      </CCardHeader>
      <CCardBody style={{ height: 320 }}>
        <canvas ref={canvasRef} />
      </CCardBody>
    </CCard>
  )
}

const ReportsTable = ({ period, rows }) => (
  <CCard className="shadow-sm">
    <CCardHeader className="d-flex justify-content-between align-items-center">
      <span>Reportes descriptivos – {periodLabel(period)}</span>
      <div className="small text-body-secondary">Visual con datos mock en lo que se conecta el backend</div>
    </CCardHeader>
    <CCardBody>
      <CTable align="middle" hover responsive className="mb-0 border">
        <CTableHead className="text-nowrap">
          <CTableRow>
            <CTableHeaderCell>Periodo</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Matriculados</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Variación</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {rows.map((r, idx) => (
            <ReportRow key={idx} label={r.label} value={r.value} prev={rows[idx - 1]?.value ?? r.value} />
          ))}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

const ReportRow = ({ label, value, prev }) => {
  const diff = value - prev
  const pct = prev === 0 ? 0 : (diff / prev) * 100
  const up = diff >= 0
  return (
    <CTableRow>
      <CTableDataCell>{label}</CTableDataCell>
      <CTableDataCell className="text-end fw-semibold">{fmt(value)}</CTableDataCell>
      <CTableDataCell className="text-end">
        <CBadge color={up ? 'success' : 'danger'} className="px-2 py-1">
          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </CBadge>
      </CTableDataCell>
    </CTableRow>
  )
}

const LatestTable = ({ items }) => (
  <CCard className="shadow-sm">
    <CCardHeader>Últimas matrículas</CCardHeader>
    <CCardBody>
      <CTable align="middle" hover responsive className="mb-0 border">
        <CTableHead className="text-nowrap">
          <CTableRow>
            <CTableHeaderCell className="bg-body-tertiary text-center"><CIcon icon={cilDog} /></CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Mascota</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Dueño</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Plan</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Edad</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Fecha Matrícula</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.map((it, i) => (
            <CTableRow key={i}>
              <CTableDataCell className="text-center">
                <CAvatar size="md" src={it.avatar} />
              </CTableDataCell>
              <CTableDataCell className="fw-semibold">{it.name}</CTableDataCell>
              <CTableDataCell>{it.owner}</CTableDataCell>
              <CTableDataCell>{it.plan}</CTableDataCell>
              <CTableDataCell>{it.edad}</CTableDataCell>
              <CTableDataCell>{it.fecha}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

// Etiqueta legible para reporte
function periodLabel(p) {
  return p === 'monthly'
    ? 'Mensual'
    : p === 'quarterly'
    ? 'Trimestral'
    : p === 'semiannual'
    ? 'Semestral'
    : 'Anual'
}

// === Componente principal ===
const DashboardAdminDirector = () => {
  const [loading, setLoading] = useState(false)
  const [kpiMonth, setKpiMonth] = useState(mockKpiMatriculadosMes)
  const [trainerActive, setTrainerActive] = useState(mockKpiEntrenadoresActivos)
  const [revenueMonth, setRevenueMonth] = useState(mockKpiIngresosMes)
  const [attendancePct, setAttendancePct] = useState(mockKpiAsistenciaPct)
  const [transportMonth, setTransportMonth] = useState(mockTransporteMes)
  const [plansMonth, setPlansMonth] = useState(mockPlanesMes)
  const [serie6, setSerie6] = useState(mockSerie6)
  const [reportPeriod, setReportPeriod] = useState('monthly')
  const [reportRows, setReportRows] = useState(mockReports['monthly'])

  /**
   * TODO (BACK): Endpoints sugeridos
   * 1) GET /stats/enrollments?from=YYYY-MM-01&to=YYYY-MM-<lastDay> => { count }
   * 2) GET /stats/transport?month=YYYY-MM => { total, parcial, sin }
   * 3) GET /stats/enrollments/series?months=6 => [{ key, label, value }]
   * 4) GET /reports/enrollments?period=monthly|quarterly|semiannual|annual&year=YYYY => [{ label, value }]
   * 5) GET /stats/trainers?status=active&month=YYYY-MM => { count }
   * 6) GET /stats/revenue?month=YYYY-MM => { amount }                  // KPI Ingresos
   * 7) GET /stats/attendance?month=YYYY-MM => { pct }                  // KPI Asistencia
   * 8) GET /stats/plans?month=YYYY-MM => { mensual, bimestral, trimestral, semestral, anual } // Donut planes
   */

  // useEffect para carga real (descomentar cuando esté el back)
  // useEffect(() => {
  //   const controller = new AbortController()
  //   async function loadAll() {
  //     try {
  //       setLoading(true)
  //       const now = new Date()
  //       const y = now.getFullYear()
  //       const m = String(now.getMonth() + 1).padStart(2, '0')
  //       const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  //
  //       const kpiRes = await fetch(`/stats/enrollments?from=${y}-${m}-01&to=${y}-${m}-${lastDay}`, { signal: controller.signal, credentials: 'include' })
  //       const kpiJson = await kpiRes.json()
  //       setKpiMonth(kpiJson.count)
  //
  //       const trRes = await fetch(`/stats/trainers?status=active&month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const trJson = await trRes.json()
  //       setTrainerActive(trJson.count)
  //
  //       const revRes = await fetch(`/stats/revenue?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const revJson = await revRes.json()
  //       setRevenueMonth(revJson.amount)
  //
  //       const attRes = await fetch(`/stats/attendance?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const attJson = await attRes.json()
  //       setAttendancePct(attJson.pct)
  //
  //       const tRes = await fetch(`/stats/transport?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const tJson = await tRes.json()
  //       setTransportMonth(tJson)
  //
  //       const pRes = await fetch(`/stats/plans?month=${y}-${m}`, { signal: controller.signal, credentials: 'include' })
  //       const pJson = await pRes.json()
  //       setPlansMonth(pJson)
  //
  //       const sRes = await fetch(`/stats/enrollments/series?months=6`, { signal: controller.signal, credentials: 'include' })
  //       const sJson = await sRes.json()
  //       setSerie6(sJson)
  //
  //       const rRes = await fetch(`/reports/enrollments?period=monthly&year=${y}`, { signal: controller.signal, credentials: 'include' })
  //       const rJson = await rRes.json()
  //       setReportRows(rJson)
  //     } catch (e) {
  //       console.error(e)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   loadAll()
  //   return () => controller.abort()
  // }, [])

  const handleChangePeriod = (p) => {
    setReportPeriod(p)
    setReportRows(mockReports[p])
  }

  return (
    <>
      {/* FILA 1: KPIs */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={3}>
          <KpiCard
            title={`Matriculados (${monthNames[mockMonthIndex]} ${mockYear})`}
            value={kpiMonth}
            subtitle="Perros matriculados este mes"
            icon={cilDog}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Entrenadores activos"
            value={trainerActive}
            subtitle="Entrenadores con estado activo"
            icon={cilUser}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title={`Ingresos (${monthNames[mockMonthIndex]} ${mockYear})`}
            value={`$ ${fmt(revenueMonth)}`}
            subtitle="COP – pagos confirmados"
            icon={cilMoney}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Asistencia promedio"
            value={`${attendancePct}%`}
            subtitle="Promedio del mes"
            icon={cilChart}
          />
        </CCol>
      </CRow>

      {/* FILA 2: Gráficos principales */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={6}>
          <DoughnutTransport data={transportMonth} />
        </CCol>
        <CCol xs={12} md={6}>
          <DoughnutPlans data={plansMonth} />
        </CCol>
      </CRow>

      {/* FILA 3: Serie 6 meses */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <LineLast6Months serie={serie6} />
        </CCol>
      </CRow>

      {/* FILA 4: Reportes descriptivos */}
      <CCard className="mb-3 shadow-sm">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Reportes estadísticos descriptivos</strong>
              <div className="small text-body-secondary">Mensual, trimestral, semestral y anual</div>
            </div>
            <div>
              <CButtonGroup role="group" aria-label="report period">
                {[
                  { k: 'monthly', label: 'Mensual' },
                  { k: 'quarterly', label: 'Trimestral' },
                  { k: 'semiannual', label: 'Semestral' },
                  { k: 'annual', label: 'Anual' },
                ].map((opt) => (
                  <CButton
                    key={opt.k}
                    color={reportPeriod === opt.k ? 'primary' : 'outline-primary'}
                    active={reportPeriod === opt.k}
                    className="text-nowrap"
                    onClick={() => handleChangePeriod(opt.k)}
                  >
                    {opt.label}
                  </CButton>
                ))}
              </CButtonGroup>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <ReportsTable period={reportPeriod} rows={reportRows} />
        </CCardBody>
        <CCardFooter className="d-flex justify-content-end gap-2">
          <CButton color="secondary" variant="outline">
            <CIcon icon={cilCloudDownload} className="me-2" /> Exportar CSV
          </CButton>
          <CButton color="secondary" variant="outline">
            <CIcon icon={cilCloudDownload} className="me-2" /> Exportar PDF
          </CButton>
        </CCardFooter>
      </CCard>

      {/* FILA 5: Últimas matrículas */}
      <CRow>
        <CCol xs={12}>
          <LatestTable items={mockLatest} />
        </CCol>
      </CRow>

      {loading && (
        <div className="text-center my-3 small text-body-secondary">Cargando estadísticas…</div>
      )}
    </>
  )
}

export default DashboardAdminDirector
