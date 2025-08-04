import api from '@/lib/api'
import { Prescription, ApiResponse, PaginatedResponse } from '@/types'

export const prescriptionAPI = {
  // Get prescriptions for the authenticated doctor
  getPrescriptions: async (page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Prescription>> => {
    let url = `/prescriptions?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await api.get(url)
    return response.data
  },

  // Get prescription by ID
  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    const response = await api.get(`/prescriptions/${id}`)
    return response.data
  },

  // Create new prescription
  createPrescription: async (prescriptionData: any): Promise<ApiResponse<Prescription>> => {
    const response = await api.post('/prescriptions', prescriptionData)
    return response.data
  },

  // Update prescription
  updatePrescription: async (id: string, prescriptionData: any): Promise<ApiResponse<Prescription>> => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData)
    return response.data
  },

  // Delete prescription
  deletePrescription: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/prescriptions/${id}`)
    return response.data
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId: string): Promise<ApiResponse<Prescription[]>> => {
    const response = await api.get(`/prescriptions/patient/${patientId}`)
    return response.data
  },
}
