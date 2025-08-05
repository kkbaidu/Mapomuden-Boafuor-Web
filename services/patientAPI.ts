import api from '@/lib/api'
import { Patient, ApiResponse, PaginatedResponse, Appointment } from '@/types'

export const patientAPI = {
  // Get all patients for the authenticated doctor by extracting from appointments
  getPatients: async (page = 1, limit = 10): Promise<PaginatedResponse<Patient>> => {
    try {
      // First, get all appointments for this doctor
      const appointmentsResponse = await api.get('/appointments?limit=1000')
      const appointments: Appointment[] = appointmentsResponse.data.appointments || []

      // Extract unique patient IDs from appointments
      const patientMap = new Map<string, any>()
      const patientIdsToFetch = new Set<string>()

      appointments.forEach((apt: Appointment) => {
        let patientId: string | null = null
        let patientData: any = null

        // Handle populated patient object
        if (typeof apt.patient === 'object' && apt.patient && apt.patient._id) {
          patientId = apt.patient._id
          patientData = apt.patient
        } 
        // Handle non-populated patient ID (string)
        else if (typeof apt.patient === 'string') {
          patientId = apt.patient
          if (patientId) {
            patientIdsToFetch.add(patientId)
          }
        }

        if (patientId && patientData) {
          patientMap.set(patientId, patientData)
        }
      })

      const patientsFromPopulation = Array.from(patientMap.values())

      // Fetch additional patient details if needed
      let additionalPatients: any[] = []
      if (patientIdsToFetch.size > 0) {
        const patientsData = await Promise.allSettled(
          Array.from(patientIdsToFetch).map(async (patientId: string) => {
            try {
              const patientResponse = await api.get(`/auth/user/${patientId}`)
              return patientResponse.data.user
            } catch (error) {
              console.error(`Error fetching patient ${patientId}:`, error)
              return null
            }
          })
        )

        additionalPatients = patientsData
          .filter((result): result is PromiseFulfilledResult<any> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value)
      }

      // Combine all patients
      const allPatients = [...patientsFromPopulation, ...additionalPatients]
      
      // Add appointment statistics to each patient
      const patients = allPatients.map(patient => {
        const patientId = patient._id
        
        // Get patient appointments
        const patientAppointments = appointments.filter((apt: Appointment) => {
          const aptPatientId = typeof apt.patient === 'object' ? apt.patient._id : apt.patient
          return aptPatientId === patientId
        })
        
        const lastVisit = patientAppointments
          .filter((apt: Appointment) => apt.status === 'completed')
          .sort((a: Appointment, b: Appointment) => 
            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
          )[0]

        return {
          ...patient,
          appointmentCount: patientAppointments.length,
          lastVisit: lastVisit?.appointmentDate || null,
        }
      })

      // Apply pagination
      const offset = (page - 1) * limit
      const paginatedPatients = patients.slice(offset, offset + limit)
      const total = patients.length
      const pages = Math.ceil(total / limit)

      return {
        success: true,
        data: paginatedPatients,
        total,
        page,
        pages,
        message: 'Patients retrieved successfully'
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch patients')
    }
  },

  // Search patients (now works with the appointment-based approach)
  searchPatients: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Patient>> => {
    try {
      // Get all patients first
      const allPatientsResponse = await patientAPI.getPatients(1, 1000)
      
      if (!allPatientsResponse.success) {
        throw new Error('Failed to fetch patients for search')
      }

      // Filter patients based on search query
      const searchLower = query.toLowerCase()
      const filteredPatients = allPatientsResponse.data.filter(patient => 
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(query)
      )

      // Apply pagination to filtered results
      const offset = (page - 1) * limit
      const paginatedPatients = filteredPatients.slice(offset, offset + limit)
      const total = filteredPatients.length
      const pages = Math.ceil(total / limit)

      return {
        success: true,
        data: paginatedPatients,
        total,
        page,
        pages,
        message: 'Search results retrieved successfully'
      }
    } catch (error: any) {
      console.error('Error searching patients:', error)
      throw new Error(error.response?.data?.message || 'Failed to search patients')
    }
  },

  // Get patient by ID
  getPatientById: async (id: string): Promise<ApiResponse<Patient>> => {
    try {
      const response = await api.get(`/auth/user/${id}`)
      return {
        success: true,
        data: response.data.user,
        message: 'Patient retrieved successfully'
      }
    } catch (error: any) {
      console.error('Error fetching patient by ID:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch patient')
    }
  },
}
