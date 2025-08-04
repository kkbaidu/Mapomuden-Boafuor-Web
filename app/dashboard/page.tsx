'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Activity,
  Star,
  FileText,
  Phone,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  totalPatients: number
  weeklyEarnings: number
  monthlyAppointments: number
  rating: number
  totalReviews: number
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'review' | 'patient'
  title: string
  subtitle: string
  time: string
  status?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats] = useState<DashboardStats>({
    todayAppointments: 8,
    pendingAppointments: 3,
    totalPatients: 247,
    weeklyEarnings: 2850,
    monthlyAppointments: 42,
    rating: 4.8,
    totalReviews: 156,
  })
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'New appointment booked',
      subtitle: 'John Doe - Routine checkup',
      time: '10 minutes ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'review',
      title: 'New review received',
      subtitle: '5-star rating from Sarah Johnson',
      time: '2 hours ago'
    },
    {
      id: '3',
      type: 'patient',
      title: 'Patient record updated',
      subtitle: 'Michael Smith - Medical history',
      time: '4 hours ago'
    }
  ])

  const StatCard = ({ title, value, icon: Icon, color, trend, onPress }: {
    title: string
    value: string | number
    icon: React.ElementType
    color: string
    trend?: string
    onPress?: () => void
  }) => (
    <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={onPress}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-${color}-50`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">{trend}</p>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const QuickActionCard = ({ title, subtitle, icon: Icon, color, href }: {
    title: string
    subtitle: string
    icon: React.ElementType
    color: string
    href: string
  }) => (
    <Link href={href}>
      <Card className="hover:shadow-medium transition-all hover:scale-105 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 mb-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
          <div className="flex items-center text-primary-600 text-sm font-medium">
            <span>Get started</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-primary-600" />}
          {activity.type === 'review' && <Star className="w-4 h-4 text-primary-600" />}
          {activity.type === 'patient' && <Users className="w-4 h-4 text-primary-600" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-sm text-gray-500 truncate">{activity.subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
      </div>
      {activity.status && (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          activity.status === 'pending' 
            ? 'bg-warning-100 text-warning-800' 
            : 'bg-success-100 text-success-800'
        }`}>
          {activity.status}
        </span>
      )}
    </div>
  )

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, Dr. {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-primary-100 mt-1">
                  Ready to help your patients today? You have {stats.todayAppointments} appointments scheduled.
                </p>
              </div>
              <div className="hidden md:block">
                <Activity className="h-16 w-16 text-primary-200" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon={Calendar}
              color="blue"
              trend="+12%"
              onPress={() => {}}
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingAppointments}
              icon={Clock}
              color="orange"
              onPress={() => {}}
            />
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={Users}
              color="green"
              trend="+8%"
              onPress={() => {}}
            />
            <StatCard
              title="Weekly Earnings"
              value={formatCurrency(stats.weeklyEarnings)}
              icon={TrendingUp}
              color="purple"
              trend="+15%"
              onPress={() => {}}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionCard
                    title="View Appointments"
                    subtitle="Manage your upcoming appointments"
                    icon={Calendar}
                    color="blue"
                    href="/appointments"
                  />
                  <QuickActionCard
                    title="Patient Records"
                    subtitle="Access patient medical records"
                    icon={FileText}
                    color="green"
                    href="/patients"
                  />
                  <QuickActionCard
                    title="Write Prescription"
                    subtitle="Create new prescriptions"
                    icon={FileText}
                    color="purple"
                    href="/prescriptions"
                  />
                  <QuickActionCard
                    title="Emergency Contacts"
                    subtitle="Quick access to emergency numbers"
                    icon={Phone}
                    color="red"
                    href="/emergency"
                  />
                </div>
              </div>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your practice statistics this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.monthlyAppointments}</p>
                      <p className="text-sm text-gray-600">Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your practice</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {recentActivity.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full" size="sm">
                      View all activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Today's Schedule Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock appointments for demo */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">09:00 AM - John Doe</p>
                      <p className="text-sm text-gray-600">Routine checkup</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Confirmed</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">11:30 AM - Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Follow-up consultation</p>
                    </div>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">02:00 PM - Michael Smith</p>
                      <p className="text-sm text-gray-600">Blood pressure check</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Upcoming</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/appointments">
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
