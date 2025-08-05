'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { prescriptionAPI } from '@/services/prescriptionAPI'
import { Patient, Medication } from '@/types'

interface PrescriptionDialogProps {
  onPrescriptionCreated: () => void
  patients: Patient[]
  appointmentId?: string
  patientId?: string
}

export default function PrescriptionDialog({ 
  onPrescriptionCreated, 
  patients, 
  appointmentId, 
  patientId 
}: PrescriptionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    appointmentId: appointmentId || '',
    diagnosis: '',
    notes: '',
    pharmacy: '',
    expiryDate: ''
  })
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updatedMedications)
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientId || !formData.diagnosis || medications.some(med => !med.name || !med.dosage)) {
      return
    }

    setLoading(true)
    try {
      const expiryDate = formData.expiryDate ? 
        new Date(formData.expiryDate).toISOString() : 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days default

      await prescriptionAPI.createPrescription({
        patientId: formData.patientId,
        appointmentId: formData.appointmentId || undefined,
        medications: medications.filter(med => med.name && med.dosage),
        diagnosis: formData.diagnosis,
        notes: formData.notes || undefined,
        expiryDate,
        pharmacy: formData.pharmacy || undefined
      })

      // Reset form and close dialog
      setFormData({
        patientId: patientId || '',
        appointmentId: appointmentId || '',
        diagnosis: '',
        notes: '',
        pharmacy: '',
        expiryDate: ''
      })
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
      setOpen(false)
      onPrescriptionCreated()
    } catch (error) {
      console.error('Error creating prescription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!patientId && (
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
          )}

          <div>
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('diagnosis', e.target.value)}
              placeholder="Enter the diagnosis..."
              required
            />
          </div>

          <div>
            <Label>Medications *</Label>
            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Medication Name *</Label>
                      <Input
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                        required
                      />
                    </div>
                    <div>
                      <Label>Dosage *</Label>
                      <Input
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Select 
                        value={medication.frequency} 
                        onValueChange={(value: string) => handleMedicationChange(index, 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">Twice daily</SelectItem>
                          <SelectItem value="thrice-daily">Thrice daily</SelectItem>
                          <SelectItem value="four-times-daily">Four times daily</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Instructions</Label>
                    <Textarea
                      value={medication.instructions || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="Special instructions for this medication..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={addMedication}
              className="mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Medication
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pharmacy">Pharmacy</Label>
              <Input
                id="pharmacy"
                value={formData.pharmacy}
                onChange={(e) => handleInputChange('pharmacy', e.target.value)}
                placeholder="Preferred pharmacy"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or instructions..."
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
                'Create Prescription'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
