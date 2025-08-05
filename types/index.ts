// User and Authentication Types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'patient' | 'doctor' | 'admin'
  isVerified: boolean
  createdAt: string
  updatedAt: string
  // Doctor-specific fields
  specialization?: string
  licenseNumber?: string
  experience?: number
  qualifications?: string[]
  consultationFee?: number
  // Patient-specific fields
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  location?: string
  emergencyContact?: string
  allergies?: string[]
  medicalHistory?: string[]
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// Patient Types
export interface Patient {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  location: string
  emergencyContact?: string
  allergies?: string[]
  medicalHistory?: string[]
  appointmentCount?: number
  lastVisit?: string
  createdAt: string
  updatedAt: string
}

// Appointment Types
export interface Appointment {
  _id: string
  patient: Patient | string
  doctor: User | string
  appointmentDate: string
  timeSlot: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

// Prescription Types
export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Prescription {
  _id: string
  patient: Patient | string
  doctor: User | string
  medications: Medication[]
  diagnosis?: string
  notes?: string
  status: 'active' | 'completed' | 'cancelled' | 'expired'
  prescriptionDate?: string
  expiryDate?: string
  pharmacy?: string
  filled: boolean
  filledDate?: string
  createdAt: string
  updatedAt: string
}

// Medical Record Types
export interface VitalSigns {
  _id?: string
  bloodPressure: string
  heartRate: number
  temperature: number
  weight: number
  height: number
  respiratoryRate?: number
  oxygenSaturation?: number
  recordedAt: string
}

export interface MedicalRecord {
  _id: string
  patient: Patient | string
  bloodGroup?: string
  allergies: Array<{
    allergen: string
    reaction: string
    severity: string
  }>
  medicalConditions: Array<{
    condition: string
    diagnosedDate: string
    status: 'active' | 'resolved' | 'chronic'
    notes?: string
  }>
  currentMedications: string[]
  pastSurgeries: Array<{
    surgery: string
    date: string
    hospital?: string
    notes?: string
  }>
  vitalSigns: VitalSigns[]
  immunizations: Array<{
    vaccine: string
    date: string
    nextDue?: string
  }>
  familyHistory: Array<{
    relation: string
    condition: string
    notes?: string
  }>
  createdAt: string
  updatedAt: string
}

// Dashboard Types
export interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  totalPatients: number
  weeklyEarnings: number
  monthlyAppointments: number
  rating: number
  totalReviews: number
}

export interface RecentActivity {
  id: string
  type: 'appointment' | 'review' | 'patient'
  title: string
  subtitle: string
  time: string
  status?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pages: number
  message: string
}
