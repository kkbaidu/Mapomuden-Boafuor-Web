import api from '@/lib/api'
import { Prescription, ApiResponse, PaginatedResponse, Medication } from '@/types'

export const prescriptionAPI = {
  // Get prescriptions for the authenticated doctor/patient
  getPrescriptions: async (page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Prescription>> => {
    const offset = (page - 1) * limit
    let url = `/prescriptions?limit=${limit}&offset=${offset}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await api.get(url)
    
    // Transform the backend response to match our expected format
    const prescriptions = response.data.prescriptions || []
    const total = response.data.pagination?.total || 0
    return {
      success: true,
      data: prescriptions,
      total,
      page,
      pages: Math.ceil(total / limit),
      message: 'Prescriptions retrieved successfully'
    }
  },

  // Create new prescription
  createPrescription: async (prescriptionData: {
    patientId: string
    appointmentId?: string
    medications: Medication[]
    diagnosis: string
    notes?: string
    expiryDate?: string
    pharmacy?: string
  }): Promise<ApiResponse<Prescription>> => {
    const response = await api.post('/prescriptions', prescriptionData)
    return {
      success: true,
      data: response.data.prescription,
      message: response.data.message || 'Prescription created successfully'
    }
  },

  // Get prescription by ID
  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    const response = await api.get(`/prescriptions/${id}`)
    return {
      success: true,
      data: response.data.prescription,
      message: 'Prescription retrieved successfully'
    }
  },

  // Mark prescription as filled
  markPrescriptionFilled: async (id: string, pharmacy?: string): Promise<ApiResponse<Prescription>> => {
    const response = await api.patch(`/prescriptions/${id}/filled`, { pharmacy })
    return {
      success: true,
      data: response.data.prescription,
      message: response.data.message || 'Prescription marked as filled'
    }
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId: string): Promise<ApiResponse<Prescription[]>> => {
    const response = await api.get(`/prescriptions?patient=${patientId}`)
    return {
      success: true,
      data: response.data.prescriptions || [],
      message: 'Patient prescriptions retrieved successfully'
    }
  },
}
