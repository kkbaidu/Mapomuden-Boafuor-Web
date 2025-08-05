'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PrescriptionDialog from '@/components/ui/PrescriptionDialog'
import { 
  Search,
  Filter,
  Pill,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Check
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { Prescription, Patient } from '@/types'
import Link from 'next/link'
import { prescriptionAPI } from '@/services/prescriptionAPI'
import { patientAPI } from '@/services/patientAPI'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch prescriptions data
  const fetchPrescriptions = async (pageNum = 1, status?: string) => {
    try {
      setLoading(pageNum === 1)
      
      const response = await prescriptionAPI.getPrescriptions(pageNum, 10, status === 'all' ? undefined : status)
      
      if (response.success) {
        const newPrescriptions = response.data || []
        setPrescriptions(pageNum === 1 ? newPrescriptions : [...prescriptions, ...newPrescriptions])
        setFilteredPrescriptions(pageNum === 1 ? newPrescriptions : [...prescriptions, ...newPrescriptions])
        setTotalPages(response.pages || 1)
      } else {
        setError(response.message || 'Failed to fetch prescriptions')
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err)
      setError(err.message || 'Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Fetch patients for the prescription dialog
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
    fetchPrescriptions(1, statusFilter)
    fetchPatients()
  }, [statusFilter])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = prescriptions.filter(prescription => {
        const patient = typeof prescription.patient === 'object' ? prescription.patient : null
        return (patient && 
          (patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) ||
        prescription.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.medications?.some(med => 
          med.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredPrescriptions(filtered)
    } else {
      setFilteredPrescriptions(prescriptions)
    }
  }, [searchQuery, prescriptions])

  // Handle mark as filled
  const handleMarkFilled = async (prescriptionId: string) => {
    setActionLoading(prescriptionId)
    try {
      await prescriptionAPI.markPrescriptionFilled(prescriptionId)
      // Refresh prescriptions
      fetchPrescriptions(1, statusFilter)
    } catch (error) {
      console.error('Error marking prescription as filled:', error)
      setError('Failed to mark prescription as filled')
    } finally {
      setActionLoading(null)
    }
  }

  const loadMorePrescriptions = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPrescriptions(nextPage, statusFilter)
    }
  }

  const getStatusIcon = (prescription: Prescription) => {
    if (prescription.status === 'completed' || prescription.filled) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    
    const expiryDate = new Date(prescription.createdAt)
    expiryDate.setDate(expiryDate.getDate() + 30) // Add 30 days
    const isExpired = new Date() > expiryDate
    
    if (isExpired) {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
    
    return <Clock className="w-4 h-4 text-yellow-600" />
  }

  const getStatusColor = (prescription: Prescription) => {
    if (prescription.status === 'completed' || prescription.filled) {
      return 'bg-green-100 text-green-800'
    }
    
    const expiryDate = new Date(prescription.createdAt)
    expiryDate.setDate(expiryDate.getDate() + 30) // Add 30 days
    const isExpired = new Date() > expiryDate
    
    if (isExpired) {
      return 'bg-red-100 text-red-800'
    }
    
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (prescription: Prescription) => {
    if (prescription.status === 'completed' || prescription.filled) {
      return 'Filled'
    }
    
    const expiryDate = new Date(prescription.createdAt)
    expiryDate.setDate(expiryDate.getDate() + 30) // Add 30 days
    const isExpired = new Date() > expiryDate
    
    if (isExpired) {
      return 'Expired'
    }
    
    return 'Active'
  }

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
    const patient = typeof prescription.patient === 'object' ? prescription.patient : null
    const doctor = typeof prescription.doctor === 'object' ? prescription.doctor : null
    
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
            
            {/* Prescription Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {patient ? 
                    `${patient.firstName} ${patient.lastName}` :
                    'Unknown Patient'
                  }
                </h3>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription)}`}>
                  {getStatusIcon(prescription)}
                  <span className="ml-1">{getStatusText(prescription)}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(prescription.createdAt)}
                </div>
                <div className="flex items-center">
                  <Pill className="w-4 h-4 mr-2" />
                  {prescription.medications?.length || 0} medications
                </div>
                {doctor && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Dr. {doctor.firstName} {doctor.lastName}
                  </div>
                )}
              </div>
              
              <div className="flex items-start mb-3">
                <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                <span className="text-sm text-gray-700">{prescription.diagnosis}</span>
              </div>
              
              {prescription.medications && prescription.medications.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medications:</h4>
                  <div className="space-y-1">
                    {prescription.medications.slice(0, 3).map((medication, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{medication.name}</span> - {medication.dosage}
                        {medication.frequency && ` (${medication.frequency})`}
                      </div>
                    ))}
                    {prescription.medications.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{prescription.medications.length - 3} more medications
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {prescription.notes && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded mt-3">
                  <strong>Notes:</strong> {prescription.notes}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col space-y-2 ml-4">
            <Link href={`/prescriptions/${prescription._id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </Link>
            
            {!prescription.filled && getStatusText(prescription) === 'Active' && (
              <Button 
                size="sm"
                onClick={() => handleMarkFilled(prescription._id)}
                disabled={actionLoading === prescription._id}
              >
                {actionLoading === prescription._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Mark Filled
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )}

  if (loading && prescriptions.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading prescriptions...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error && prescriptions.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load prescriptions</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchPrescriptions()}>
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
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600 mt-1">Manage patient prescriptions and medications</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <PrescriptionDialog 
                onPrescriptionCreated={() => fetchPrescriptions(1, statusFilter)}
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
                      placeholder="Search prescriptions by patient, diagnosis, or medication..."
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
                    <option value="active">Active</option>
                    <option value="filled">Filled</option>
                    <option value="expired">Expired</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions List */}
          <div className="space-y-4">
            {filteredPrescriptions.length > 0 ? (
              <>
                {filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard key={prescription._id} prescription={prescription} />
                ))}
                
                {/* Load More Button */}
                {page < totalPages && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMorePrescriptions}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Prescriptions'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'You have no prescriptions yet.'}
                  </p>
                  {!searchQuery && (
                    <PrescriptionDialog 
                      onPrescriptionCreated={() => fetchPrescriptions(1, statusFilter)}
                      patients={patients}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          {filteredPrescriptions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredPrescriptions.length} prescriptions {totalPages > 1 && `(Page ${page} of ${totalPages})`}
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
