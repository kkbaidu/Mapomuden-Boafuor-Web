import api from '@/lib/api'
import { Patient, ApiResponse, PaginatedResponse } from '@/types'

export const patientAPI = {
  // Get all patients for the authenticated doctor
  getPatients: async (page = 1, limit = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get(`/doctor/patients?page=${page}&limit=${limit}`)
    return response.data
  },

  // Search patients
  searchPatients: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get(`/doctor/patients/search?q=${query}&page=${page}&limit=${limit}`)
    return response.data
  },

  // Get patient by ID
  getPatientById: async (id: string): Promise<ApiResponse<Patient>> => {
    const response = await api.get(`/auth/user/${id}`)
    return response.data
  },

  // Get patient statistics
  getPatientStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/doctor/patients/stats')
    return response.data
  },
}
