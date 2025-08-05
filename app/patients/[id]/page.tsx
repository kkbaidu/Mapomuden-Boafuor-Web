'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Activity,
  FileText,
  Pill,
  Heart,
  AlertTriangle,
  Edit,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Patient, Appointment, Prescription, MedicalRecord } from '@/types'
import Link from 'next/link'
import { patientAPI } from '@/services/patientAPI'
import { appointmentAPI } from '@/services/appointmentAPI'
import { prescriptionAPI } from '@/services/prescriptionAPI'
import { medicalRecordAPI } from '@/services/medicalRecordAPI'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)

  // Fetch patient data
  const fetchPatientData = async () => {
    try {
      setLoading(true)
      const response = await patientAPI.getPatientById(patientId)
      
      if (response.success) {
        setPatient(response.data)
      } else {
        setError(response.message || 'Failed to fetch patient data')
      }
    } catch (err: any) {
      console.error('Error fetching patient:', err)
      setError(err.message || 'Failed to fetch patient data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent appointments
  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true)
      const response = await appointmentAPI.getPatientAppointments(patientId)
      
      if (response.success) {
        // Get the 5 most recent appointments
        const sortedAppointments = (response.data || [])
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
          .slice(0, 5)
        setRecentAppointments(sortedAppointments)
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setAppointmentsLoading(false)
    }
  }

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true)
      const response = await prescriptionAPI.getPatientPrescriptions(patientId)
      
      if (response.success) {
        setPrescriptions(response.data || [])
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
    } finally {
      setPrescriptionsLoading(false)
    }
  }

  // Fetch medical records
  const fetchMedicalRecords = async () => {
    try {
      setRecordsLoading(true)
      const response = await medicalRecordAPI.getPatientMedicalRecord(patientId)
      
      if (response.success) {
        // The API returns a single medical record, not an array
        setMedicalRecords(response.data ? [response.data] : [])
      }
    } catch (err) {
      console.error('Error fetching medical records:', err)
    } finally {
      setRecordsLoading(false)
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
      fetchAppointments()
      fetchPrescriptions()
      fetchMedicalRecords()
    }
  }, [patientId])

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading patient details...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error || !patient) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load patient</h3>
              <p className="text-gray-600 mb-4">{error || 'Patient not found'}</p>
              <div className="space-x-2">
                <Button onClick={fetchPatientData}>
                  Try Again
                </Button>
                <Link href="/patients">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Patients
                  </Button>
                </Link>
              </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/patients">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Patients
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-semibold">
                    {getInitials(patient.firstName, patient.lastName)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-gray-600">Patient ID: {patient._id}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Patient
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-500">Phone</p>
                      <div className="flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Email</p>
                      <div className="flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    </div>
                    {patient.dateOfBirth && (
                      <div>
                        <p className="font-medium text-gray-500">Date of Birth</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatDate(patient.dateOfBirth)}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-500">Gender</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        patient.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender || 'Not specified'}
                      </span>
                    </div>
                    {patient.bloodGroup && (
                      <div>
                        <p className="font-medium text-gray-500">Blood Group</p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 mt-1">
                          {patient.bloodGroup}
                        </span>
                      </div>
                    )}
                    {patient.location && (
                      <div>
                        <p className="font-medium text-gray-500">Location</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{patient.location}</span>
                        </div>
                      </div>
                    )}
                    {patient.emergencyContact && (
                      <div className="col-span-2">
                        <p className="font-medium text-gray-500">Emergency Contact</p>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{patient.emergencyContact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-500 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-500 mb-2">Medical History</p>
                      <div className="space-y-1">
                        {patient.medicalHistory.map((condition, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                            {condition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Recent Appointments
                    </CardTitle>
                    <Link href={`/appointments?patient=${patientId}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : recentAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {recentAppointments.map((appointment) => (
                        <div key={appointment._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(appointment.appointmentDate)} at {appointment.timeSlot}
                              </p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                              {appointment.notes && (
                                <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                              )}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No recent appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Pill className="w-5 h-5 mr-2" />
                      Active Prescriptions
                    </CardTitle>
                    <Link href={`/prescriptions?patient=${patientId}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {prescriptionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {prescriptions.filter(p => p.status === 'active').map((prescription) => (
                        <div key={prescription._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{prescription.diagnosis}</p>
                              <div className="mt-2 space-y-1">
                                {prescription.medications.map((med, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{med.name}</span> - {med.dosage}
                                    <span className="text-gray-500 ml-2">({med.frequency})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {prescription.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No active prescriptions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medical Records */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Recent Medical Records
                    </CardTitle>
                    <Link href={`/medical-records?patient=${patientId}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recordsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : medicalRecords.length > 0 ? (
                    <div className="space-y-3">
                      {medicalRecords.slice(0, 3).map((record) => (
                        <div key={record._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {record.medicalConditions?.length > 0 
                                  ? record.medicalConditions[0].condition 
                                  : 'Medical Record'
                                }
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {record.medicalConditions?.length > 0 
                                  ? `Status: ${record.medicalConditions[0].status}` 
                                  : 'General medical information'
                                }
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(record.createdAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No medical records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
