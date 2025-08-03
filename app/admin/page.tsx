'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileNavigation from '../components/MobileNavigation';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin' | 'coach';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Staff {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    specializations: string;
    certifications: string;
    hire_date: string;
    hourly_rate: number;
    bio: string;
    photo_url: string;
}

interface Enrollment {
  id: number;
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth?: string;
  student_gender?: string;
  previous_experience?: string;
  program_type: string;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_email: string;
  parent_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_alt_phone?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  physician_name?: string;
  physician_phone?: string;
  submission_date: string;
  status: string;
}

interface Class {
  id: number;
  name: string;
  program_type: string;
  instructor_id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  capacity: number;
  age_min?: number;
  age_max?: number;
  skill_level?: string;
  monthly_price?: number;
  active: boolean;
  enrolled_students: EnrolledStudent[];
  enrollment_count: number;
}

interface EnrolledStudent {
  id: number;
  student_name: string;
  student_first_name: string;
  student_last_name: string;
  parent_email: string;
  enrollment_date: string;
}

interface Payment {
  id: number;
  student_id?: number;
  enrollment_id?: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_status: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  currency: string;
  description?: string;
  due_date?: string;
  paid_date?: string;
  refunded_date?: string;
  refund_amount?: number;
  processing_fee?: number;
  parent_email?: string;
  billing_address?: string;
  failure_reason?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  student_first_name?: string;
  student_last_name?: string;
  parent_first_name?: string;
  parent_last_name?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'users' | 'staff' | 'classes' | 'payments'>('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<{
    show: boolean;
    userId: number | null;
    newRole: 'user' | 'admin' | 'coach' | null;
    password: string;
  }>({
    show: false,
    userId: null,
    newRole: null,
    password: ''
  });
  const [processingApplication, setProcessingApplication] = useState<number | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Enrollment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [newCoach, setNewCoach] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'coach',
    bio: '',
    specializations: [],
    certifications: [],
    hireDate: '',
    hourlyRate: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success && result.user.role === 'admin') {
        setUser(result.user);
        loadData();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load enrollments
      const enrollResponse = await fetch('/api/enroll');
      if (enrollResponse.ok) {
        const enrollData = await enrollResponse.json();
        setEnrollments(enrollData.enrollments || []);
      }

      // Load users - we'll need to create this API endpoint
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load staff
      const staffResponse = await fetch('/api/admin/staff');
        if (staffResponse.ok) {
            const staffData = await staffResponse.json();
            setStaff(staffData.staff || []);
        }

      // Load classes with enrolled students
      const classesResponse = await fetch('/api/admin/classes');
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setClasses(classesData.classes || []);
      }

      // Load payments
      const paymentsResponse = await fetch('/api/admin/payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
        setPaymentSummary(paymentsData.summary || null);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRoleUpdate = async (userId: number, newRole: 'user' | 'admin' | 'coach') => {
    // If promoting to admin, require password confirmation
    if (newRole === 'admin') {
      setPasswordConfirmation({
        show: true,
        userId,
        newRole,
        password: ''
      });
      return;
    }

    // For demoting from admin to user, just confirm
    if (!confirm('Are you sure you want to demote this admin to user?')) {
      return;
    }

    await performRoleUpdate(userId, newRole);
  };

  const performRoleUpdate = async (userId: number, newRole: 'user' | 'admin' | 'coach', adminPassword?: string) => {
    setUpdateLoading(userId);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'updateRole',
          role: newRole,
          adminPassword // Include admin password for verification
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        setUpdateMessage(`User role updated to ${newRole} successfully!`);
        setTimeout(() => setUpdateMessage(''), 3000);
        
        // Close password confirmation dialog
        setPasswordConfirmation({
          show: false,
          userId: null,
          newRole: null,
          password: ''
        });
      } else {
        setUpdateMessage(result.error || 'Failed to update user role');
      }
    } catch (error) {
      setUpdateMessage('An error occurred while updating user role');
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage('');

    try {
      const response = await fetch('/api/admin/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCoach),
      });

      const result = await response.json();

      if (result.success) {
        setUpdateMessage('Coach added successfully!');
        setNewCoach({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'coach',
            bio: '',
            specializations: [],
            certifications: [],
            hireDate: '',
            hourlyRate: 0,
        });
        loadData();
      } else {
        setUpdateMessage(result.error || 'Failed to add coach');
      }
    } catch (error) {
        setUpdateMessage('An error occurred while adding the coach');
    }
    };

  const handlePasswordConfirmSubmit = async () => {
    if (!passwordConfirmation.password.trim()) {
      setUpdateMessage('Please enter your admin password');
      return;
    }

    await performRoleUpdate(
      passwordConfirmation.userId!,
      passwordConfirmation.newRole!,
      passwordConfirmation.password
    );
  };

  const handlePasswordConfirmCancel = () => {
    setPasswordConfirmation({
      show: false,
      userId: null,
      newRole: null,
      password: ''
    });
    setUpdateMessage('');
  };

  const handleApplicationAction = async (enrollmentId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) {
      return;
    }

    setProcessingApplication(enrollmentId);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          action,
          status: action === 'approve' ? 'approved' : 'rejected'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setEnrollments(enrollments.map(e => 
          e.id === enrollmentId ? { ...e, status: action === 'approve' ? 'approved' : 'rejected' } : e
        ));
        setUpdateMessage(`Application ${action}d successfully!`);
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(result.error || `Failed to ${action} application`);
      }
    } catch (error) {
      setUpdateMessage(`An error occurred while ${action}ing application`);
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleViewApplication = (enrollment: Enrollment) => {
    setViewingApplication(enrollment);
  };

  const handleCloseApplicationView = () => {
    setViewingApplication(null);
  };

  const handleUserStatusToggle = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setUpdateLoading(userId);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: currentStatus ? 'deactivate' : 'activate'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        ));
        setUpdateMessage(`User ${action}d successfully!`);
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(result.error || `Failed to ${action} user`);
      }
    } catch (error) {
      setUpdateMessage(`An error occurred while ${action}ing user`);
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enrollmentId }),
      });
      const result = await response.json();
      if (result.success) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
        setShowDeleteConfirm(null);
      } else {
        alert(`Error: ${result.error}`);
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      alert('An unexpected error occurred.');
      setShowDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (showDeleteConfirm !== null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Confirm Deletion
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this enrollment? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteEnrollment(showDeleteConfirm)}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={handleLogout} />

      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 desktop-nav hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CGC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Cruces Gymnastics Center
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                Contact
              </Link>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Admin
              </span>
            </div>

            {/* User & Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.first_name}!</span>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Manage enrollments, users, staff, and center operations with comprehensive administrative tools.
            </p>
          </div>
        </div>
      </section>

      {/* Admin Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Navigation Tabs */}
          <div className="mb-12">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'enrollments', label: 'Enrollments' },
                { key: 'users', label: 'Users' },
                { key: 'staff', label: 'Staff' },
                { key: 'classes', label: 'Classes' },
                { key: 'payments', label: 'Payments' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-3 border-b-2 font-semibold text-sm lg:text-base transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-red-600 border-red-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Total Enrollments</h3>
              <p className="text-5xl font-bold text-red-600">{enrollments.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Active Users</h3>
              <p className="text-5xl font-bold text-blue-600">{users.filter(u => u.is_active).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Pending Applications</h3>
              <p className="text-5xl font-bold text-yellow-600">{enrollments.filter(e => e.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Admin Users</h3>
              <p className="text-5xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Enrollment Applications</h2>
              
              {/* Update Message */}
              {updateMessage && (
                <div 
                  className={`mt-6 p-4 rounded-lg ${
                    updateMessage.includes('successfully') 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {updateMessage.includes('successfully') ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{updateMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.student_first_name} {enrollment.student_last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.parent_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {enrollment.program_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(enrollment.submission_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewApplication(enrollment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          
                          {enrollment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(enrollment.id, 'approve')}
                                disabled={processingApplication === enrollment.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingApplication === enrollment.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleApplicationAction(enrollment.id, 'reject')}
                                disabled={processingApplication === enrollment.id}
                                className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors text-sm"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(enrollment.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm ml-2"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          
                          {enrollment.status !== 'pending' && (
                            <span className="text-gray-400 text-xs">
                              {enrollment.status === 'approved' ? 'Already approved' : 'Already rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              
              {/* Update Message */}
              {updateMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  updateMessage.includes('successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {updateMessage}
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData) => (
                    <tr key={userData.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userData.first_name} {userData.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          userData.role === 'coach' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userData.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Role Action Buttons */}
                          {userData.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleUpdate(userData.id, 'user')}
                              disabled={updateLoading === userData.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updateLoading === userData.id ? 'Updating...' : 'Demote to User'}
                            </button>
                          ) : userData.role === 'coach' ? (
                            <>
                              <button
                                onClick={() => handleRoleUpdate(userData.id, 'admin')}
                                disabled={updateLoading === userData.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updateLoading === userData.id ? 'Updating...' : 'Promote to Admin'}
                              </button>
                              <button
                                onClick={() => handleRoleUpdate(userData.id, 'user')}
                                disabled={updateLoading === userData.id}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updateLoading === userData.id ? 'Updating...' : 'Demote to User'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRoleUpdate(userData.id, 'admin')}
                              disabled={updateLoading === userData.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updateLoading === userData.id ? 'Updating...' : 'Promote to Admin'}
                            </button>
                          )}
                          
                          {/* Status Toggle Button */}
                          <button
                            onClick={() => handleUserStatusToggle(userData.id, userData.is_active)}
                            disabled={updateLoading === userData.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateLoading === userData.id ? 'Updating...' : (
                              userData.is_active ? 'Deactivate' : 'Activate'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {staff.map((staffMember) => (
                                            <tr key={staffMember.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {staffMember.first_name} {staffMember.last_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {staffMember.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {staffMember.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(staffMember.hire_date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Coach</h3>
                            <form onSubmit={handleAddCoach}>
                                <div className="space-y-4">
                                    <input type="text" placeholder="First Name" value={newCoach.firstName} onChange={(e) => setNewCoach({ ...newCoach, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                                    <input type="text" placeholder="Last Name" value={newCoach.lastName} onChange={(e) => setNewCoach({ ...newCoach, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                                    <input type="email" placeholder="Email" value={newCoach.email} onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                                    <input type="password" placeholder="Password" value={newCoach.password} onChange={(e) => setNewCoach({ ...newCoach, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                                    <input type="text" placeholder="Phone" value={newCoach.phone} onChange={(e) => setNewCoach({ ...newCoach, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="date" placeholder="Hire Date" value={newCoach.hireDate} onChange={(e) => setNewCoach({ ...newCoach, hireDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">Hourly Rate:</label>
                                        <input type="number" id="hourlyRate" placeholder="Hourly Rate" value={newCoach.hourlyRate} onChange={(e) => setNewCoach({ ...newCoach, hourlyRate: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <textarea placeholder="Bio" value={newCoach.bio} onChange={(e) => setNewCoach({ ...newCoach, bio: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">Add Coach</button>
                                </div>
                            </form>
                            {updateMessage && <p className="mt-4 text-sm text-gray-600">{updateMessage}</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Class Management</h2>
                <p className="text-sm text-gray-600 mt-1">View all classes and their enrolled students</p>
              </div>
              
              <div className="p-6">
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                    <p className="text-gray-500">Add some classes to get started with class management.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {classes.map((classItem) => (
                      <div key={classItem.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="capitalize">{classItem.day_of_week}</span>
                              <span>{classItem.start_time} - {classItem.end_time}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {classItem.program_type}
                              </span>
                              {classItem.skill_level && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {classItem.skill_level}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{classItem.enrollment_count}</span> / {classItem.capacity} students
                            </div>
                            {classItem.monthly_price && (
                              <div className="text-lg font-semibold text-gray-900">
                                ${classItem.monthly_price}/month
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {classItem.age_min || classItem.age_max ? (
                          <div className="text-sm text-gray-600 mb-4">
                            Age Range: {classItem.age_min ? `${classItem.age_min}+` : 'Any'} 
                            {classItem.age_max ? ` - ${classItem.age_max}` : ''}
                          </div>
                        ) : null}

                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">
                            Enrolled Students ({classItem.enrollment_count})
                          </h4>
                          
                          {classItem.enrolled_students.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500">No students enrolled yet</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Student Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Parent Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Enrollment Date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {classItem.enrolled_students.map((student) => (
                                    <tr key={student.id}>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                          {student.student_name}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {student.parent_email}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {new Date(student.enrollment_date).toLocaleDateString()}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Confirmation Modal */}
      {passwordConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Admin Promotion
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to promote a user to admin. Please enter your admin password to confirm this action.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Admin Password
                </label>
                <input
                  type="password"
                  value={passwordConfirmation.password}
                  onChange={(e) => setPasswordConfirmation(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handlePasswordConfirmSubmit}
                  disabled={updateLoading !== null}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading !== null ? 'Confirming...' : 'Confirm Promotion'}
                </button>
                <button
                  onClick={handlePasswordConfirmCancel}
                  disabled={updateLoading !== null}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-8">
          {/* Payment Summary Cards */}
          {paymentSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">${paymentSummary.totalRevenue?.toFixed(2) || '0.00'}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{paymentSummary.completed || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{paymentSummary.pending || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                      <dd className="text-lg font-medium text-gray-900">{paymentSummary.failed || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Management</h2>
              <p className="text-sm text-gray-600 mt-1">View and manage all payments</p>
            </div>
            
            <div className="overflow-x-auto">
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
                  <p className="text-gray-500">Payments will appear here once students start making payments.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.student_first_name && payment.student_last_name 
                                ? `${payment.student_first_name} ${payment.student_last_name}`
                                : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">{payment.parent_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${parseFloat(payment.amount.toString()).toFixed(2)}</div>
                          {payment.currency && payment.currency !== 'usd' && (
                            <div className="text-sm text-gray-500 uppercase">{payment.currency}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {payment.payment_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">{payment.payment_method}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.payment_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            payment.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            payment.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                          {payment.paid_date && (
                            <div className="text-xs text-green-600">Paid: {new Date(payment.paid_date).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {payment.receipt_url && (
                              <a 
                                href={payment.receipt_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Receipt
                              </a>
                            )}
                            {payment.payment_status === 'pending' && (
                              <button className="text-green-600 hover:text-green-900">
                                Mark Paid
                              </button>
                            )}
                            {payment.payment_status === 'completed' && (
                              <button className="text-purple-600 hover:text-purple-900">
                                Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application View Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Application Details
              </h3>
              <button
                onClick={handleCloseApplicationView}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{viewingApplication.student_first_name} {viewingApplication.student_last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{viewingApplication.student_date_of_birth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{viewingApplication.student_gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Program</label>
                    <p className="text-gray-900">{viewingApplication.program_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Previous Experience</label>
                    <p className="text-gray-900">{viewingApplication.previous_experience || 'None specified'}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{viewingApplication.parent_first_name} {viewingApplication.parent_last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{viewingApplication.parent_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{viewingApplication.parent_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{viewingApplication.address}</p>
                    <p className="text-gray-900">{viewingApplication.city}, {viewingApplication.state} {viewingApplication.zip_code}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{viewingApplication.emergency_contact_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relationship</label>
                    <p className="text-gray-900">{viewingApplication.emergency_contact_relationship}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{viewingApplication.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Allergies</label>
                    <p className="text-gray-900">{viewingApplication.allergies || 'None specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                    <p className="text-gray-900">{viewingApplication.medical_conditions || 'None specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Medications</label>
                    <p className="text-gray-900">{viewingApplication.medications || 'None specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Submitted: {new Date(viewingApplication.submission_date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${
                  viewingApplication.status === 'approved' ? 'text-green-600' :
                  viewingApplication.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                }`}>{viewingApplication.status}</span></p>
              </div>
              
              {viewingApplication.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApplicationAction(viewingApplication.id, 'approve');
                      handleCloseApplicationView();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleApplicationAction(viewingApplication.id, 'reject');
                      handleCloseApplicationView();
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">CGC</span>
                </div>
                <span className="text-xl font-bold">Cruces Gymnastics Center</span>
              </div>
              <p className="text-gray-300 mb-4">
                2025 Premier gymnastics training in Las Cruces, New Mexico. Building confidence,
                character, and champions since 2025.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/enroll" className="text-gray-300 hover:text-white transition-colors">Enroll Now</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>📍 123 Gymnastics Way<br />Las Cruces, NM 88001</p>
                <p>📞 (575) XXX-XXXX</p>
                <p>✉️ info@crucesgymnastics.com</p>
                <div className="mt-4">
                  <h4 className="font-semibold text-white mb-2">Hours</h4>
                  <p className="text-sm">Mon-Fri: 3:00 PM - 8:00 PM</p>
                  <p className="text-sm">Saturday: 9:00 AM - 5:00 PM</p>
                  <p className="text-sm">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 