'use client'

import { useState } from 'react'
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
  Plus
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Patient, Appointment, Prescription } from '@/types'
import Link from 'next/link'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  
  const [patient] = useState<Patient | null>({
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    bloodGroup: 'O+',
    location: 'New York, NY',
    emergencyContact: '+1 (555) 987-6543',
    allergies: ['Penicillin', 'Peanuts'],
    medicalHistory: ['Hypertension', 'Diabetes Type 2'],
    appointmentCount: 12,
    lastVisit: '2024-01-20T10:00:00Z',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  })
  
  const [recentAppointments] = useState<Appointment[]>([
    {
      _id: '1',
      patient: patientId,
      doctor: 'doc1',
      appointmentDate: '2024-01-20',
      timeSlot: '10:00 AM',
      status: 'completed',
      reason: 'Routine checkup',
      notes: 'Patient is doing well, blood pressure stable.',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      _id: '2',
      patient: patientId,
      doctor: 'doc1',
      appointmentDate: '2024-01-25',
      timeSlot: '2:00 PM',
      status: 'confirmed',
      reason: 'Follow-up consultation',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ])
  
  const [prescriptions] = useState<Prescription[]>([
    {
      _id: '1',
      patient: patientId,
      doctor: 'doc1',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      diagnosis: 'Diabetes Type 2',
      status: 'active',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    }
  ])

  if (!patient) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6">
            <div className="text-center">
              <p className="text-gray-600">Patient not found</p>
              <Link href="/patients">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Patients
                </Button>
              </Link>
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
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600">Patient ID: {patient._id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>

          {/* Patient Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(patient.firstName, patient.lastName)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{patient.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">Born: {formatDate(patient.dateOfBirth || '')}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{patient.gender}</p>
                      <p className="text-sm text-gray-600">Gender</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{patient.bloodGroup}</p>
                      <p className="text-sm text-gray-600">Blood Group</p>
                    </div>
                  </div>
                </div>
                
                {patient.emergencyContact && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-1">Emergency Contact</p>
                    <p className="text-sm text-gray-600">{patient.emergencyContact}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
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
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medical History</p>
                    <div className="space-y-2">
                      {patient.medicalHistory.map((condition, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 bg-gray-50 rounded-lg"
                        >
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{patient.appointmentCount || 0}</p>
                      <p className="text-sm text-gray-600">Total Visits</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(patient.lastVisit || patient.updatedAt)}
                      </p>
                      <p className="text-sm text-gray-600">Last Visit</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Pill className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Medical Record
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  View Vital Signs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Recent Appointments
                  </span>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {formatDate(appointment.appointmentDate)} at {appointment.timeSlot}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.reason}</p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                  
                  {recentAppointments.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No appointments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Pill className="w-5 h-5 mr-2" />
                    Active Prescriptions
                  </span>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{prescription.diagnosis}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{medication.name} - {medication.dosage}</p>
                            <p className="text-gray-600">{medication.frequency} for {medication.duration}</p>
                            {medication.instructions && (
                              <p className="text-xs text-gray-500">{medication.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Prescribed on {formatDate(prescription.createdAt)}
                      </p>
                    </div>
                  ))}
                  
                  {prescriptions.length === 0 && (
                    <div className="text-center py-8">
                      <Pill className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No active prescriptions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
