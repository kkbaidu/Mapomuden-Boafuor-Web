'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Loader2 } from 'lucide-react'
import { appointmentAPI } from '@/services/appointmentAPI'
import { Patient } from '@/types'

interface AppointmentDialogProps {
  onAppointmentCreated: () => void
  patients: Patient[]
}

export default function AppointmentDialog({ onAppointmentCreated, patients }: AppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'in-person',
    reason: '',
    videoCallLink: '',
    videoCallPlatform: ''
  })

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientId || !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      return
    }

    setLoading(true)
    try {
      // Find the selected patient
      const selectedPatient = patients.find(p => p._id === formData.patientId)
      if (!selectedPatient) {
        throw new Error('Patient not found')
      }

      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)

      await appointmentAPI.createAppointment({
        doctorId: 'current-doctor-id', // This should come from auth context
        doctorUserId: 'current-doctor-user-id', // This should come from auth context
        appointmentDate: appointmentDateTime.toISOString(),
        duration: formData.duration,
        type: formData.type,
        reason: formData.reason,
        videoCallLink: formData.type === 'video-call' ? formData.videoCallLink : undefined,
        videoCallPlatform: formData.type === 'video-call' ? formData.videoCallPlatform : undefined
      })

      // Reset form and close dialog
      setFormData({
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        type: 'in-person',
        reason: '',
        videoCallLink: '',
        videoCallPlatform: ''
      })
      setOpen(false)
      onAppointmentCreated()
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <Select value={formData.patientId} onValueChange={(value: string) => handleInputChange('patientId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration.toString()} onValueChange={(value: string) => handleInputChange('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: string) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="video-call">Video Call</SelectItem>
                  <SelectItem value="phone-call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === 'video-call' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Video Platform</Label>
                <Select value={formData.videoCallPlatform} onValueChange={(value: string) => handleInputChange('videoCallPlatform', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google-meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="link">Video Call Link</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.videoCallLink}
                  onChange={(e) => handleInputChange('videoCallLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('reason', e.target.value)}
              placeholder="Describe the reason for this appointment..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Appointment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
