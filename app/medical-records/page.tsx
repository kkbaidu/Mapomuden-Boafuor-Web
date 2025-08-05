'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Activity,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Edit,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  AlertTriangle
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { MedicalRecord } from '@/types'
import Link from 'next/link'
import { medicalRecordAPI } from '@/services/medicalRecordAPI'

export default function MedicalRecordsPage() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch medical records data
  const fetchMedicalRecords = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1)
      
      // Since we don't have a general endpoint for all records, we'll need to implement this differently
      // For now, we'll show a placeholder or we could get records for each patient
      setMedicalRecords([])
      setFilteredRecords([])
      setTotalPages(1)
    } catch (err: any) {
      console.error('Error fetching medical records:', err)
      setError(err.message || 'Failed to fetch medical records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medicalRecords.filter(record => {
        const patient = typeof record.patient === 'object' ? record.patient : null
        return (patient && 
          (patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) ||
        record.medicalConditions?.some(condition => 
          condition.condition?.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        record.allergies?.some(allergy => 
          allergy.allergen?.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        record.currentMedications?.some(medication => 
          medication?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(medicalRecords)
    }
  }, [searchQuery, medicalRecords])

  const loadMoreRecords = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMedicalRecords(nextPage)
    }
  }

  const MedicalRecordCard = ({ record }: { record: MedicalRecord }) => {
    const patient = typeof record.patient === 'object' ? record.patient : null
    
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
              
              {/* Record Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {patient ? 
                      `${patient.firstName} ${patient.lastName}` :
                      'Unknown Patient'
                    }
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Medical Record
                  </span>
                </div>
                
                <div className="mb-3">
                  {record.medicalConditions && record.medicalConditions.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">Condition:</span>
                      <span className="ml-1">{record.medicalConditions[0].condition}</span>
                    </div>
                  )}
                  
                  {record.allergies && record.allergies.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="font-medium">Allergies:</span>
                      <span className="ml-1">{record.allergies.map(a => a.allergen).join(', ')}</span>
                    </div>
                  )}
                  
                  {record.currentMedications && record.currentMedications.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      <span className="font-medium">Medications:</span>
                      <span className="ml-1">{record.currentMedications.slice(0, 2).join(', ')}</span>
                      {record.currentMedications.length > 2 && <span className="ml-1">and {record.currentMedications.length - 2} more</span>}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Created on {formatDate(record.createdAt)}</span>
                  </div>
                </div>
                
                {/* Vital Signs if available */}
                {record.vitalSigns && record.vitalSigns.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Latest Vital Signs:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {record.vitalSigns[0].bloodPressure && (
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1 text-red-500" />
                          <span>BP: {record.vitalSigns[0].bloodPressure}</span>
                        </div>
                      )}
                      {record.vitalSigns[0].heartRate && (
                        <div className="flex items-center">
                          <Activity className="w-3 h-3 mr-1 text-green-500" />
                          <span>HR: {record.vitalSigns[0].heartRate} bpm</span>
                        </div>
                      )}
                      {record.vitalSigns[0].temperature && (
                        <div className="flex items-center">
                          <Thermometer className="w-3 h-3 mr-1 text-orange-500" />
                          <span>Temp: {record.vitalSigns[0].temperature}°F</span>
                        </div>
                      )}
                      {record.vitalSigns[0].weight && (
                        <div className="flex items-center">
                          <Weight className="w-3 h-3 mr-1 text-blue-500" />
                          <span>Weight: {record.vitalSigns[0].weight} lbs</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col space-y-2 ml-4">
              <Link href={`/medical-records/${record._id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && medicalRecords.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading medical records...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error && medicalRecords.length === 0) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load medical records</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchMedicalRecords()}>
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
              <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
              <p className="text-gray-600 mt-1">Manage patient medical records and health history</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Medical Record
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
                    <p className="text-sm text-gray-600">Total Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50 mr-4">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(medicalRecords.map(r => {
                        const patient = typeof r.patient === 'object' ? r.patient : null
                        return patient?._id
                      }).filter(Boolean)).size}
                    </p>
                    <p className="text-sm text-gray-600">Patients with Records</p>
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
                      {medicalRecords.filter(r => {
                        const recordDate = new Date(r.createdAt)
                        const sevenDaysAgo = new Date()
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                        return recordDate >= sevenDaysAgo
                      }).length}
                    </p>
                    <p className="text-sm text-gray-600">Records This Week</p>
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
                      placeholder="Search by patient name, diagnosis, or symptoms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Date
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Records
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records List */}
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              <>
                {filteredRecords.map((record) => (
                  <MedicalRecordCard key={record._id} record={record} />
                ))}
                
                {/* Load More Button */}
                {page < totalPages && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreRecords}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Records'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Start creating medical records for your patients.'}
                  </p>
                  {!searchQuery && (
                    <div className="space-y-2">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Record
                      </Button>
                      <p className="text-sm text-gray-500">
                        Or visit a patient's profile to add their medical record
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          {filteredRecords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredRecords.length} medical records {totalPages > 1 && `(Page ${page} of ${totalPages})`}
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
