// ----------------------------------------------
// src/views/dashboard/DashboardAdminDirector.js
// ----------------------------------------------
import React, { useEffect, useRef, useState } from 'react'
import { dashboardService } from 'src/services/dashboardService'
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

// ----------------------------------------------
// Utils
// ----------------------------------------------
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)

// ----------------------------------------------
// Components
// ----------------------------------------------
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

// ----------------------------------------------
// Doughnut Chart - Transporte
// ----------------------------------------------
const DoughnutTransport = ({ data }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const total = (data.total ?? 0) + (data.parcial ?? 0) + (data.sin ?? 0)

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
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  const now = new Date()
  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilChart} />
        <span>Transporte – {monthNames[now.getMonth()]} {now.getFullYear()}</span>
      </CCardHeader>

      <CCardBody className="d-flex flex-column p-3" style={{ height: 320 }}>
        <div className="flex-grow-1 position-relative">
          <canvas ref={canvasRef} />
        </div>
      </CCardBody>

      <CCardFooter className="text-center small text-body-secondary text-wrap">
        Total perros con algún transporte este mes: <strong>{fmt(data.total + data.parcial)}</strong> / {fmt(total)}
      </CCardFooter>
    </CCard>
  )
}

// ----------------------------------------------
// Doughnut Chart - Planes
// ----------------------------------------------
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
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  const now = new Date()
  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilChartPie} />
        <span>Distribución de planes – {monthNames[now.getMonth()]} {now.getFullYear()}</span>
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

// ----------------------------------------------
// Line Chart - Últimos 6 meses
// ----------------------------------------------
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
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
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

// ----------------------------------------------
// Últimas matrículas
// ----------------------------------------------
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

// ----------------------------------------------
// Componente principal
// ----------------------------------------------
const DashboardAdminDirector = () => {
  const [loading, setLoading] = useState(false)
  const [kpiMonth, setKpiMonth] = useState(0)
  const [trainerActive, setTrainerActive] = useState(0)
  const [revenueMonth, setRevenueMonth] = useState(0)
  const [attendancePct, setAttendancePct] = useState(0)
  const [transportMonth, setTransportMonth] = useState({})
  const [plansMonth, setPlansMonth] = useState({})
  const [serie6, setSerie6] = useState([])
  const [latest, setLatest] = useState([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access')
        const data = await dashboardService.getAdminDashboard(token)
        setKpiMonth(data.kpiMatriculadosMes)
        setTrainerActive(data.kpiEntrenadoresActivos)
        setRevenueMonth(data.kpiIngresosMes)
        setAttendancePct(data.kpiAsistenciaPct)
        setTransportMonth(data.transporteMes)
        setPlansMonth(data.planesMes)
        setSerie6(data.serie6)
        setLatest(data.ultimasMatriculas)
      } catch (err) {
        console.error('Error al cargar dashboard admin:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  return (
    <>
      {/* KPIs */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={3}><KpiCard title="Matriculados (Mes)" value={kpiMonth} subtitle="Perros matriculados este mes" icon={cilDog} /></CCol>
        <CCol xs={12} md={3}><KpiCard title="Entrenadores activos" value={trainerActive} subtitle="Entrenadores activos" icon={cilUser} /></CCol>
        <CCol xs={12} md={3}><KpiCard title="Ingresos (COP)" value={`$ ${fmt(revenueMonth)}`} subtitle="Pagos confirmados" icon={cilMoney} /></CCol>
        <CCol xs={12} md={3}><KpiCard title="Asistencia promedio" value={`${attendancePct}%`} subtitle="Promedio mensual" icon={cilChart} /></CCol>
      </CRow>

      {/* Gráficos */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={6}><DoughnutTransport data={transportMonth} /></CCol>
        <CCol xs={12} md={6}><DoughnutPlans data={plansMonth} /></CCol>
      </CRow>

      {/* Serie 6 meses */}
      <CRow className="mb-4">
        <CCol xs={12}><LineLast6Months serie={serie6} /></CCol>
      </CRow>

      {/* Últimas matrículas */}
      <CRow>
        <CCol xs={12}><LatestTable items={latest} /></CCol>
      </CRow>

      {loading && <div className="text-center my-3 small text-body-secondary">Cargando estadísticas…</div>}
    </>
  )
}

export default DashboardAdminDirector
