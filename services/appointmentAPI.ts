import api from '@/lib/api'
import { Appointment, ApiResponse, PaginatedResponse } from '@/types'

export const appointmentAPI = {
  // Get appointments for the authenticated doctor/patient
  getAppointments: async (page = 1, limit = 10, status?: string, type?: string): Promise<PaginatedResponse<Appointment>> => {
    const offset = (page - 1) * limit
    let url = `/appointments?limit=${limit}&offset=${offset}`
    if (status) {
      url += `&status=${status}`
    }
    if (type) {
      url += `&type=${type}`
    }
    const response = await api.get(url)
    
    // Transform the backend response to match our expected format
    const appointments = response.data.appointments || []
    const total = response.data.pagination?.total || 0
    return {
      success: true,
      data: appointments,
      total,
      page,
      pages: Math.ceil(total / limit),
      message: 'Appointments retrieved successfully'
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData: {
    doctorId: string
    doctorUserId: string
    appointmentDate: string
    duration?: number
    type?: string
    reason: string
    videoCallLink?: string
    videoCallPlatform?: string
  }): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/appointments', appointmentData)
    return {
      success: true,
      data: response.data.appointment,
      message: response.data.message || 'Appointment created successfully'
    }
  },

  // Get appointment by ID
  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${id}`)
    return {
      success: true,
      data: response.data.appointment,
      message: 'Appointment retrieved successfully'
    }
  },

  // Get appointments for a specific patient
  getPatientAppointments: async (patientId: string): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get(`/appointments?patient=${patientId}`)
    return {
      success: true,
      data: response.data.appointments || [],
      message: 'Patient appointments retrieved successfully'
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (id: string, status: string, notes?: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.patch(`/appointments/${id}/status`, { status, notes })
    return {
      success: true,
      data: response.data.appointment,
      message: response.data.message || 'Appointment status updated successfully'
    }
  },

  // Cancel appointment
  cancelAppointment: async (id: string, reason?: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason })
    return {
      success: true,
      data: response.data.appointment,
      message: response.data.message || 'Appointment cancelled successfully'
    }
  },

  // Get today's appointments
  getTodayAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const today = new Date().toISOString().split('T')[0]
    const response = await api.get(`/appointments?appointmentDate=${today}`)
    return {
      success: true,
      data: response.data.appointments || [],
      message: 'Today\'s appointments retrieved successfully'
    }
  },
}
