# Mapomuden Boafuor - Doctor Web Portal

A professional web portal for doctors built with Next.js, TypeScript, and Tailwind CSS. This portal allows doctors to manage their practice, view patient records, handle appointments, and manage prescriptions from their desktop or laptop.

## Features

### 🏥 Dashboard
- **Overview Statistics**: Today's appointments, pending requests, total patients, weekly earnings
- **Quick Actions**: Schedule appointments, access patient records, write prescriptions
- **Recent Activity**: Latest updates from practice
- **Today's Schedule**: Appointment overview with status indicators

### 👥 Patient Management
- **Patient List**: Search and filter patients with comprehensive information
- **Patient Details**: Complete patient profiles with medical history, contact info, and vital signs
- **Patient Records**: Access to medical records, allergies, and emergency contacts
- **Quick Actions**: Schedule appointments, write prescriptions, add medical records

### 📅 Appointment Management
- **Appointment Calendar**: View and manage appointments by date
- **Status Management**: Confirm, complete, or cancel appointments
- **Patient Communication**: Notes and follow-up tracking

### 💊 Prescription Management
- **Digital Prescriptions**: Create and manage patient prescriptions
- **Medication Database**: Easy medication lookup and dosage management
- **Prescription History**: Track active and completed prescriptions

### 📋 Medical Records
- **Comprehensive Records**: Medical history, diagnoses, treatments
- **Vital Signs Tracking**: Add, edit, and monitor patient vital signs
- **Document Management**: Upload and organize medical documents

## Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with Lucide React icons
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT-based authentication
- **Build Tool**: Turbopack (for faster development)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server running (Mapomuden-Boafuor-Backend)

### Installation

1. **Navigate to the web portal directory**
   ```bash
   cd Mapomuden-Boafuor-Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Doctor Login
1. Navigate to the login page
2. Enter your doctor credentials (same as mobile app)
3. Only users with `role: 'doctor'` can access the portal
4. Upon successful login, you'll be redirected to the dashboard

### Key Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Professional UI**: Clean, medical-grade interface design
- **Fast Performance**: Built with Next.js and optimized for speed
- **Type Safety**: Full TypeScript implementation
- **Secure**: JWT-based authentication with protected routes
