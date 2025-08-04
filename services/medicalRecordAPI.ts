import api from '@/lib/api'
import { MedicalRecord, VitalSigns, ApiResponse, PaginatedResponse } from '@/types'

export const medicalRecordAPI = {
  // Get medical records for a patient
  getPatientRecords: async (patientId: string, page = 1, limit = 10): Promise<PaginatedResponse<MedicalRecord>> => {
    const response = await api.get(`/medical-records/patient/${patientId}?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get medical record by ID
  getRecordById: async (id: string): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.get(`/medical-records/${id}`)
    return response.data
  },

  // Create new medical record
  createRecord: async (recordData: any): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.post('/medical-records', recordData)
    return response.data
  },

  // Update medical record
  updateRecord: async (id: string, recordData: any): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.put(`/medical-records/${id}`, recordData)
    return response.data
  },

  // Delete medical record
  deleteRecord: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/medical-records/${id}`)
    return response.data
  },

  // Add vital signs to a record
  addVitalSigns: async (recordId: string, vitalSigns: Omit<VitalSigns, '_id'>): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.post(`/medical-records/${recordId}/vital-signs`, vitalSigns)
    return response.data
  },

  // Update vital signs
  updateVitalSigns: async (recordId: string, vitalSignsId: string, vitalSigns: Partial<VitalSigns>): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.put(`/medical-records/${recordId}/vital-signs/${vitalSignsId}`, vitalSigns)
    return response.data
  },

  // Delete vital signs
  deleteVitalSigns: async (recordId: string, vitalSignsId: string): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.delete(`/medical-records/${recordId}/vital-signs/${vitalSignsId}`)
    return response.data
  },
}
