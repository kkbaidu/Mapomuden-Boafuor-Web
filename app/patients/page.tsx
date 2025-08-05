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
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { Patient } from '@/types'
import Link from 'next/link'
import { patientAPI } from '@/services/patientAPI'

interface PatientStats {
  totalPatients: number
  activeThisMonth: number
  totalAppointments: number
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    activeThisMonth: 0,
    totalAppointments: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch patients data
  const fetchPatients = async (pageNum = 1, query = '') => {
    try {
      setLoading(pageNum === 1)
      setSearchLoading(!!query)
      
      let response
      if (query.trim()) {
        response = await patientAPI.searchPatients(query, pageNum, 10)
      } else {
        response = await patientAPI.getPatients(pageNum, 10)
      }
      
      if (response.success) {
        const newPatients = response.data || []
        setPatients(pageNum === 1 ? newPatients : [...patients, ...newPatients])
        setFilteredPatients(pageNum === 1 ? newPatients : [...patients, ...newPatients])
        setTotalPages(response.pages || 1)
      } else {
        setError(response.message || 'Failed to fetch patients')
      }
    } catch (err: any) {
      console.error('Error fetching patients:', err)
      setError(err.message || 'Failed to fetch patients')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  // Fetch patient statistics from actual data
  const fetchStats = async () => {
    try {
      // Get all patients to calculate stats
      const response = await patientAPI.getPatients(1, 1000) // Get up to 1000 patients
      if (response.success) {
        const patients = response.data || []
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const activeThisMonth = patients.filter(patient => {
          const createdDate = new Date(patient.createdAt)
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
        }).length

        setStats({
          totalPatients: patients.length,
          activeThisMonth,
          totalAppointments: patients.reduce((sum, patient) => sum + (patient.appointmentCount || 0), 0)
        })
      }
    } catch (err) {
      console.error('Error fetching patient stats:', err)
      // Set default stats if fetching fails
      setStats({
        totalPatients: 0,
        activeThisMonth: 0,
        totalAppointments: 0
      })
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchStats()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setPage(1)
        fetchPatients(1, searchQuery)
      } else if (searchQuery === '') {
        setPage(1)
        fetchPatients(1)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

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
                {patient.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {patient.location}
                  </div>
                )}
                {patient.bloodGroup && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Blood Group: {patient.bloodGroup}
                  </div>
                )}
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

  const loadMorePatients = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPatients(nextPage, searchQuery)
    }
  }

  if (loading && patients.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading patients...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error && patients.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load patients</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchPatients()}>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.activeThisMonth}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
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
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    )}
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
              <>
                {filteredPatients.map((patient) => (
                  <PatientCard key={patient._id} patient={patient} />
                ))}
                
                {/* Load More Button */}
                {page < totalPages && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMorePatients}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Patients'
                      )}
                    </Button>
                  </div>
                )}
              </>
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

          {/* Pagination Info */}
          {filteredPatients.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredPatients.length} patients {totalPages > 1 && `(Page ${page} of ${totalPages})`}
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
