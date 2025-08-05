'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AppointmentDialog from '@/components/ui/AppointmentDialog'
import { 
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'
import { formatDate, formatTime, getInitials } from '@/lib/utils'
import { Appointment, Patient } from '@/types'
import Link from 'next/link'
import { appointmentAPI } from '@/services/appointmentAPI'
import { patientAPI } from '@/services/patientAPI'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch appointments data
  const fetchAppointments = async (pageNum = 1, status?: string) => {
    try {
      setLoading(pageNum === 1)
      
      const response = await appointmentAPI.getAppointments(pageNum, 10, status === 'all' ? undefined : status)
      
      if (response.success) {
        const newAppointments = response.data || []
        setAppointments(pageNum === 1 ? newAppointments : [...appointments, ...newAppointments])
        setFilteredAppointments(pageNum === 1 ? newAppointments : [...appointments, ...newAppointments])
        setTotalPages(response.pages || 1)
      } else {
        setError(response.message || 'Failed to fetch appointments')
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      setError(err.message || 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  // Fetch patients for the appointment dialog
  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getPatients(1, 100) // Get first 100 patients
      if (response.success) {
        setPatients(response.data || [])
      }
    } catch (err) {
      console.error('Error fetching patients:', err)
    }
  }

  useEffect(() => {
    fetchAppointments(1, statusFilter)
    fetchPatients()
  }, [statusFilter])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = appointments.filter(appointment => {
        const patient = typeof appointment.patient === 'object' ? appointment.patient : null
        return (patient && 
          (patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) ||
        appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase())
      })
      setFilteredAppointments(filtered)
    } else {
      setFilteredAppointments(appointments)
    }
  }, [searchQuery, appointments])

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setActionLoading(appointmentId)
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus)
      // Refresh appointments
      fetchAppointments(1, statusFilter)
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError('Failed to update appointment status')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    setActionLoading(appointmentId)
    try {
      await appointmentAPI.cancelAppointment(appointmentId, reason || 'Cancelled by doctor')
      // Refresh appointments
      fetchAppointments(1, statusFilter)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setError('Failed to cancel appointment')
    } finally {
      setActionLoading(null)
    }
  }

  const loadMoreAppointments = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchAppointments(nextPage, statusFilter)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'confirmed':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const patient = typeof appointment.patient === 'object' ? appointment.patient : null
    
    return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Patient Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {patient ? 
                  getInitials(patient.firstName, patient.lastName) :
                  'P'
                }
              </span>
            </div>
            
            {/* Appointment Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {patient ? 
                    `${patient.firstName} ${patient.lastName}` :
                    'Unknown Patient'
                  }
                </h3>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">{appointment.status}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(appointment.appointmentDate)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {appointment.timeSlot}
                </div>
                {patient?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {patient.phone}
                  </div>
                )}
                {patient?.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {patient.email}
                  </div>
                )}
              </div>
              
              {appointment.reason && (
                <div className="flex items-start mb-3">
                  <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                  <span className="text-sm text-gray-700">{appointment.reason}</span>
                </div>
              )}
              
              {appointment.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Notes:</strong> {appointment.notes}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col space-y-2 ml-4">
            <Link href={`/appointments/${appointment._id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            
            {appointment.status === 'pending' && (
              <div className="flex flex-col space-y-1">
                <Button 
                  size="sm" 
                  onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                  disabled={actionLoading === appointment._id}
                >
                  {actionLoading === appointment._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment._id)}
                  disabled={actionLoading === appointment._id}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            {appointment.status === 'confirmed' && (
              <div className="flex flex-col space-y-1">
                <Button 
                  size="sm"
                  onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                  disabled={actionLoading === appointment._id}
                >
                  {actionLoading === appointment._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Complete'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment._id)}
                  disabled={actionLoading === appointment._id}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )}

  if (loading && appointments.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error && appointments.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load appointments</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchAppointments()}>
                Try Again
              </Button>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-1">Manage your patient appointments and schedule</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <AppointmentDialog 
                onAppointmentCreated={() => fetchAppointments(1, statusFilter)}
                patients={patients}
              />
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search appointments by patient name, email, or reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              <>
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
                
                {/* Load More Button */}
                {page < totalPages && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreAppointments}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Appointments'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'You have no scheduled appointments.'}
                  </p>
                  {!searchQuery && (
                    <AppointmentDialog 
                      onAppointmentCreated={() => fetchAppointments(1, statusFilter)}
                      patients={patients}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          {filteredAppointments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAppointments.length} appointments {totalPages > 1 && `(Page ${page} of ${totalPages})`}
                  </p>
                  {error && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
