// ----------------------------------------------
// src/views/dashboard/Dashboard_Client.js
// ----------------------------------------------
import React, { useEffect, useRef, useState } from 'react'
import { dashboardService } from 'src/services/dashboardService'
import { useAuthUser } from 'src/context/AuthUserContext'
import {
  CAvatar,
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

// ----------------------------------------------
// Utilidades
// ----------------------------------------------
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)

const daysBetween = (a, b) => {
  if (!a || !b) return 0
  return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24))
}

const avg = (arr) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0)

const learningKeys = ['animo', 'obediencia', 'sociabilidad', 'conciencia', 'actividad']
const healthKeys = ['conciencia', 'mucosas', 'pelajePiel', 'peso', 'abdomen']

const averageLearning = (dogs) => {
  const values = dogs.map((d) => avg(Object.values(d.learning || {})))
  return Math.round(avg(values))
}

const aggregateByKeys = (dogs, keys, selector) => {
  const res = {}
  keys.forEach((k) => {
    const vals = dogs.map((d) => selector(d)?.[k] || 0)
    res[k] = Math.round(avg(vals))
  })
  return res
}

// ----------------------------------------------
// Componentes reusables
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
        <div className="display-6 fw-bold lh-1">{typeof value === 'number' ? fmt(value) : value}</div>
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
        datasets: [{ label: title, data }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { beginAtZero: true, suggestedMax: 100 } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [labels, data, title])

  return (
    <CCard className="h-100 shadow-sm">
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={icon} />
        <span>{title}</span>
      </CCardHeader>
      <CCardBody style={{ height: 340 }}>
        <canvas ref={canvasRef} />
      </CCardBody>
    </CCard>
  )
}

// ----------------------------------------------
// Bar chart ahora para ASISTENCIAS por canino
// ----------------------------------------------
const BarAttendances = ({ dogs }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: dogs.map((d) => d.name),
        datasets: [{ label: 'Asistencias en el mes', data: dogs.map((d) => d.absencesThisMonth || 0) }],
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
        <span>Asistencias por canino</span>
      </CCardHeader>
      <CCardBody style={{ height: 320 }}>
        <canvas ref={canvasRef} />
      </CCardBody>
      <CCardFooter className="text-center small text-body-secondary">
        Total de asistencias del mes:{' '}
        <strong>{fmt(dogs.reduce((s, d) => s + (d.absencesThisMonth || 0), 0))}</strong>
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
            <CTableHeaderCell className="bg-body-tertiary text-center">
              <CIcon icon={cilDog} />
            </CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Nombre</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Plan</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Días restantes</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Asistencias mes</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Aprendizaje</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary text-end">Salud</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.map((it, i) => {
            const daysLeft = it.expiresAt ? Math.max(0, daysBetween(new Date(), it.expiresAt)) : '-'
            const learnAvg = Math.round(avg(Object.values(it.learning || {})))
            const healthAvg = Math.round(avg(Object.values(it.health || {})))
            return (
              <CTableRow key={i}>
                <CTableDataCell className="text-center">
                  <CAvatar size="md" src={it.avatar} />
                </CTableDataCell>
                <CTableDataCell className="fw-semibold">{it.name}</CTableDataCell>
                <CTableDataCell>{it.plan}</CTableDataCell>
                <CTableDataCell className="text-end">
                  {daysLeft !== '-' ? (
                    <CBadge color={daysLeft <= 7 ? 'danger' : daysLeft <= 15 ? 'warning' : 'success'}>
                      {daysLeft}
                    </CBadge>
                  ) : (
                    '-'
                  )}
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

// ----------------------------------------------
// Componente principal
// ----------------------------------------------
const Dashboard_Client = () => {
  const [loading, setLoading] = useState(false)
  const [dogs, setDogs] = useState([])
  const { user } = useAuthUser()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access')
        const data = await dashboardService.getClientDashboard(token)
        // esperamos que backend devuelva lista de caninos con:
        // { id, name, plan, expiresAt, absencesThisMonth, learning, health, avatar }
        setDogs(data)
      } catch (err) {
        console.error('Error al cargar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const kpiDogs = dogs.length
  const kpiNextExpiryDays = dogs.length
    ? Math.min(...dogs.map((d) => (d.expiresAt ? daysBetween(new Date(), d.expiresAt) : Infinity)))
    : 0

  // KPI: total de ASISTENCIAS del mes (suma de todas las asistencias de todos sus perros)
  const kpiAttendances = dogs.reduce((s, d) => s + (d.absencesThisMonth || 0), 0)

  const kpiLearningAvg = averageLearning(dogs)

  const learningAgg = aggregateByKeys(dogs, learningKeys, (d) => d.learning)
  const healthAgg = aggregateByKeys(dogs, healthKeys, (d) => d.health)

  return (
    <>
      {/* FILA 1: KPIs */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={3}>
          <KpiCard title="Tus caninos" value={kpiDogs} subtitle="Caninos activos" icon={cilDog} />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard title="Próximo vencimiento" value={`${kpiNextExpiryDays} días`} icon={cilCalendar} />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Asistencias del mes"
            value={kpiAttendances}
            subtitle="Total de asistencias registradas"
            icon={cilUser}
          />
        </CCol>
        <CCol xs={12} md={3}>
          <KpiCard
            title="Aprendizaje (prom.)"
            value={`${kpiLearningAvg}`}
            subtitle="Promedio mensual"
            icon={cilChart}
          />
        </CCol>
      </CRow>

      {/* FILA 2: Gráficos */}
      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol xs={12} md={6}>
          <RadarChart title="Aprendizaje" labels={learningKeys} data={learningKeys.map((k) => learningAgg[k])} />
        </CCol>
        <CCol xs={12} md={6}>
          <RadarChart title="Salud" labels={healthKeys} data={healthKeys.map((k) => healthAgg[k])} icon={cilChartPie} />
        </CCol>
      </CRow>

      {/* FILA 3: Asistencias por canino */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <BarAttendances dogs={dogs} />
        </CCol>
      </CRow>

      {/* FILA 4: Tabla */}
      <CRow>
        <CCol xs={12}>
          <DogsTable items={dogs} />
        </CCol>
      </CRow>

      {loading && <div className="text-center my-3 small text-body-secondary">Cargando tus datos…</div>}
    </>
  )
}

export default Dashboard_Client
