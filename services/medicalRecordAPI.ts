import api from '@/lib/api'
import { MedicalRecord, VitalSigns, ApiResponse } from '@/types'

export const medicalRecordAPI = {
  // Get or create medical record for current user
  getMedicalRecord: async (): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.get('/medical-records')
    return {
      success: true,
      data: response.data.medicalRecord,
      message: 'Medical record retrieved successfully'
    }
  },

  // Get patient medical record (for doctors)
  getPatientMedicalRecord: async (patientId: string): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.get(`/medical-records/patient/${patientId}`)
    return {
      success: true,
      data: response.data.medicalRecord,
      message: 'Patient medical record retrieved successfully'
    }
  },

  // Update medical record
  updateMedicalRecord: async (recordData: {
    allergies?: string[]
    medicalConditions?: string[]
    currentMedications?: string[]
    pastSurgeries?: string[]
    immunizations?: string[]
    familyHistory?: string[]
  }): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.put('/medical-records', recordData)
    return {
      success: true,
      data: response.data.medicalRecord,
      message: response.data.message || 'Medical record updated successfully'
    }
  },

  // Add vital signs
  addVitalSigns: async (vitalSigns: {
    bloodPressure: string
    heartRate: number
    temperature: number
    weight: number
    height: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }, patientId?: string): Promise<ApiResponse<VitalSigns>> => {
    const headers: any = {}
    if (patientId) {
      headers['x-patient-id'] = patientId
    }
    
    const response = await api.post('/medical-records/vital-signs', vitalSigns, { headers })
    return {
      success: true,
      data: response.data.vitalSigns,
      message: response.data.message || 'Vital signs added successfully'
    }
  },

  // Update vital signs
  updateVitalSigns: async (vitalSignsId: string, vitalSigns: Partial<VitalSigns>, patientId?: string): Promise<ApiResponse<VitalSigns>> => {
    const headers: any = {}
    if (patientId) {
      headers['x-patient-id'] = patientId
    }
    
    const response = await api.put('/medical-records/vital-signs', { 
      vitalSignsId, 
      updatedVitalSigns: vitalSigns 
    }, { headers })
    return {
      success: true,
      data: response.data.vitalSigns,
      message: response.data.message || 'Vital signs updated successfully'
    }
  },

  // Delete vital signs
  deleteVitalSigns: async (vitalSignsId: string, patientId?: string): Promise<ApiResponse<any>> => {
    const headers: any = {}
    if (patientId) {
      headers['x-patient-id'] = patientId
    }
    
    const response = await api.delete(`/medical-records/vital-signs/${vitalSignsId}`, { headers })
    return {
      success: true,
      data: response.data.vitalSigns,
      message: response.data.message || 'Vital signs deleted successfully'
    }
  }
}
  
