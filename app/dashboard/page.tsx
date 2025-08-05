'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Activity,
  Star,
  FileText,
  Phone,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { patientAPI } from '@/services/patientAPI'
import { appointmentAPI } from '@/services/appointmentAPI'
import Link from 'next/link'

interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  totalPatients: number
  weeklyEarnings: number
  monthlyAppointments: number
  rating: number
  totalReviews: number
}

interface TodayAppointment {
  _id: string
  patient: {
    firstName: string
    lastName: string
  }
  appointmentDate: string
  appointmentTime?: string
  reason: string
  status: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    weeklyEarnings: 0,
    monthlyAppointments: 0,
    rating: 0,
    totalReviews: 0
  })
  const [todaysAppointments, setTodaysAppointments] = useState<TodayAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real data from existing endpoints
      const [patientsResponse, todayAppointmentsResponse, allAppointmentsResponse] = await Promise.all([
        patientAPI.getPatients(1, 100), // Get first 100 patients to count
        appointmentAPI.getTodayAppointments(),
        appointmentAPI.getAppointments(1, 100) // Get first 100 appointments
      ])

      const patients = patientsResponse.data || []
      const todayAppts = todayAppointmentsResponse.data || []
      const allAppts = allAppointmentsResponse.data || []

      // Calculate stats from actual data
      const pendingAppts = allAppts.filter(apt => apt.status === 'pending').length
      const monthlyAppts = allAppts.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        const now = new Date()
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
      }).length

      setDashboardData({
        todayAppointments: todayAppts.length,
        pendingAppointments: pendingAppts,
        totalPatients: patients.length,
        weeklyEarnings: 2850, // Mock data for now
        monthlyAppointments: monthlyAppts,
        rating: 4.8, // Mock data for now
        totalReviews: 156 // Mock data for now
      })

      // Set today's appointments with proper format
      const formattedTodayAppts = todayAppts.map(apt => ({
        _id: apt._id,
        patient: typeof apt.patient === 'object' ? apt.patient : { firstName: 'Unknown', lastName: 'Patient' },
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.timeSlot,
        reason: apt.reason || 'General consultation',
        status: apt.status
      }))
      setTodaysAppointments(formattedTodayAppts)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'completed':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatAppointmentTime = (date: string, time?: string) => {
    if (time) return time
    const appointmentDate = new Date(date)
    return appointmentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 space-y-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchDashboardData}>Try Again</Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Dr. {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your practice today.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.todayAppointments}</p>
                    <p className="text-sm text-gray-600">Today's Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-50 mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingAppointments}</p>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50 mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPatients}</p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-50 mr-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.weeklyEarnings)}</p>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-500' :
                          appointment.status === 'pending' ? 'bg-yellow-500' :
                          appointment.status === 'completed' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatAppointmentTime(appointment.appointmentDate, appointment.appointmentTime)} - {appointment.patient.firstName} {appointment.patient.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/appointments">
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
