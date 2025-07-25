"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'users'>('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<{
    show: boolean;
    userId: number | null;
    newRole: 'user' | 'admin' | null;
    password: string;
  }>({
    show: false,
    userId: null,
    newRole: null,
    password: ''
  });
  const [processingApplication, setProcessingApplication] = useState<number | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Enrollment | null>(null);

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

  const handleRoleUpdate = async (userId: number, newRole: 'user' | 'admin') => {
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

  const performRoleUpdate = async (userId: number, newRole: 'user' | 'admin', adminPassword?: string) => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600">Cruces Gymnastics Center</Link>
              <span className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-full">Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.first_name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage enrollments, users, and center operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'enrollments', label: 'Enrollments' },
              { key: 'users', label: 'Users' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-2 border-b-2 font-medium ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Enrollments</h3>
              <p className="text-3xl font-bold text-red-600">{enrollments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-red-600">{users.filter(u => u.is_active).length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Applications</h3>
              <p className="text-3xl font-bold text-red-600">{enrollments.filter(e => e.status === 'pending').length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Users</h3>
              <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Enrollment Applications</h2>
              
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
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingApplication === enrollment.id ? 'Processing...' : 'Reject'}
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
                          userData.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
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
                          {/* Role Toggle Button */}
                          <button
                            onClick={() => handleRoleUpdate(
                              userData.id, 
                              userData.role === 'admin' ? 'user' : 'admin'
                            )}
                            disabled={updateLoading === userData.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateLoading === userData.id ? 'Updating...' : (
                              userData.role === 'admin' ? 'Demote to User' : 'Promote to Admin'
                            )}
                          </button>
                          
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
    </div>
  );
} 