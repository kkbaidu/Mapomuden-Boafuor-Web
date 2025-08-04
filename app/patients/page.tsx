'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Activity,
  ChevronRight
} from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { Patient } from '@/types'
import Link from 'next/link'

export default function PatientsPage() {
  const [patients] = useState<Patient[]>([
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      gender: 'male',
      bloodGroup: 'O+',
      location: 'New York, NY',
      appointmentCount: 12,
      lastVisit: '2024-01-20T10:00:00Z',
      createdAt: '2023-06-15T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 234-5678',
      gender: 'female',
      bloodGroup: 'A+',
      location: 'Los Angeles, CA',
      appointmentCount: 8,
      lastVisit: '2024-01-18T14:30:00Z',
      createdAt: '2023-08-20T10:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z'
    },
    {
      _id: '3',
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'michael.smith@email.com',
      phone: '+1 (555) 345-6789',
      gender: 'male',
      bloodGroup: 'B+',
      location: 'Chicago, IL',
      appointmentCount: 15,
      lastVisit: '2024-01-22T09:15:00Z',
      createdAt: '2023-04-10T10:00:00Z',
      updatedAt: '2024-01-22T09:15:00Z'
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients)

  useEffect(() => {
    // Filter patients based on search query
    const filtered = patients.filter(patient => 
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
    )
    setFilteredPatients(filtered)
  }, [searchQuery, patients])

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {getInitials(patient.firstName, patient.lastName)}
              </span>
            </div>
            
            {/* Patient Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {patient.firstName} {patient.lastName}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  patient.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }`}>
                  {patient.gender || 'Not specified'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {patient.location}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Blood Group: {patient.bloodGroup || 'Unknown'}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-primary-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="font-medium">{patient.appointmentCount || 0}</span>
                    <span className="text-gray-500 ml-1">appointments</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Activity className="w-4 h-4 mr-1" />
                    <span>Last visit: {formatRelativeTime(patient.lastVisit || patient.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Link href={`/patients/${patient._id}`}>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600 mt-1">Manage your patient records and information</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button>
                <User className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 mr-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50 mr-4">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => {
                        const lastVisit = new Date(p.lastVisit || p.updatedAt)
                        const thirtyDaysAgo = new Date()
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                        return lastVisit >= thirtyDaysAgo
                      }).length}
                    </p>
                    <p className="text-sm text-gray-600">Active This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-50 mr-4">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.reduce((total, p) => total + (p.appointmentCount || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search patients by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          <div className="space-y-4">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <PatientCard key={patient._id} patient={patient} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first patient.'}
                  </p>
                  {!searchQuery && (
                    <Button>
                      <User className="w-4 h-4 mr-2" />
                      Add New Patient
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredPatients.length} of {patients.length} patients
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
