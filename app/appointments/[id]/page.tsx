'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
  Loader2,
  Video,
  MessageSquare
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Appointment, Patient } from '@/types'
import Link from 'next/link'
import { appointmentAPI } from '@/services/appointmentAPI'

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    notes: '',
    status: ''
  })

  // Fetch appointment data
  const fetchAppointment = async () => {
    try {
      setLoading(true)
      const response = await appointmentAPI.getAppointmentById(appointmentId)
      
      if (response.success) {
        setAppointment(response.data)
        setEditForm({
          notes: response.data.notes || '',
          status: response.data.status
        })
      } else {
        setError(response.message || 'Failed to fetch appointment details')
      }
    } catch (err: any) {
      console.error('Error fetching appointment:', err)
      setError(err.message || 'Failed to fetch appointment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId])

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(newStatus)
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus, editForm.notes)
      await fetchAppointment() // Refresh data
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError('Failed to update appointment status')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    setActionLoading('cancel')
    try {
      await appointmentAPI.cancelAppointment(appointmentId, 'Cancelled by doctor')
      await fetchAppointment() // Refresh data
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setError('Failed to cancel appointment')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle save notes
  const handleSaveNotes = async () => {
    setActionLoading('save')
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, editForm.status, editForm.notes)
      setIsEditing(false)
      await fetchAppointment() // Refresh data
    } catch (error) {
      console.error('Error saving notes:', error)
      setError('Failed to save notes')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'confirmed':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
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

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading appointment details...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error || !appointment) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load appointment</h3>
              <p className="text-gray-600 mb-4">{error || 'Appointment not found'}</p>
              <div className="space-x-2">
                <Button onClick={fetchAppointment}>
                  Try Again
                </Button>
                <Link href="/appointments">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Appointments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const patient = typeof appointment.patient === 'object' ? appointment.patient : null

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/appointments">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Appointments
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                <p className="text-gray-600">
                  {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'} - {formatDate(appointment.appointmentDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                <span className="ml-2 capitalize">{appointment.status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {getInitials(patient.firstName, patient.lastName)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">Patient ID: {patient._id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        {patient.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{patient.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Link href={`/patients/${patient._id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Patient Profile
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Patient information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('confirmed')}
                        disabled={actionLoading === 'confirmed'}
                      >
                        {actionLoading === 'confirmed' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Confirm Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleCancelAppointment}
                        disabled={actionLoading === 'cancel'}
                      >
                        {actionLoading === 'cancel' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Appointment
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <>
                      <Button 
                        className="w-full"
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={actionLoading === 'completed'}
                      >
                        {actionLoading === 'completed' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Mark as Completed
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleCancelAppointment}
                        disabled={actionLoading === 'cancel'}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    </>
                  )}

                  {appointment.status === 'completed' && (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Create Prescription
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Update Medical Record
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Time</Label>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{appointment.timeSlot}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <div className="flex items-center mt-1">
                        {appointment.type === 'video-call' ? (
                          <Video className="w-4 h-4 mr-2 text-gray-400" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span className="font-medium capitalize">
                          {appointment.type || 'In-person'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(appointment.status)}
                        <span className="font-medium ml-2 capitalize">{appointment.status}</span>
                      </div>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Reason for Visit</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{appointment.reason}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Appointment Notes
                    </CardTitle>
                    {!isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Notes
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add your notes about this appointment..."
                          rows={4}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSaveNotes}
                          disabled={actionLoading === 'save'}
                        >
                          {actionLoading === 'save' ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Notes
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setEditForm({
                              notes: appointment.notes || '',
                              status: appointment.status
                            })
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {appointment.notes ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No notes added yet</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Add Notes
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video Call Information (if applicable) */}
              {appointment.type === 'video-call' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Video Call Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointment.videoCallLink ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Platform</Label>
                          <p className="font-medium">{appointment.videoCallPlatform || 'Video Call'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Meeting Link</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input 
                              value={appointment.videoCallLink} 
                              readOnly 
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => window.open(appointment.videoCallLink, '_blank')}
                            >
                              Join Call
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Video call link not yet available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto text-red-800 hover:bg-red-100"
                    onClick={() => setError(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
