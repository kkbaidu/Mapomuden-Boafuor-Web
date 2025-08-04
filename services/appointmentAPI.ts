import api from '@/lib/api'
import { Appointment, ApiResponse, PaginatedResponse } from '@/types'

export const appointmentAPI = {
  // Get appointments for the authenticated doctor
  getAppointments: async (page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Appointment>> => {
    let url = `/appointments?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await api.get(url)
    return response.data
  },

  // Get appointment by ID
  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  // Update appointment status
  updateAppointmentStatus: async (id: string, status: string, notes?: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.patch(`/appointments/${id}/status`, { status, notes })
    return response.data
  },

  // Get today's appointments
  getTodayAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments/today')
    return response.data
  },

  // Get appointment statistics
  getAppointmentStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/appointments/stats')
    return response.data
  },
}
