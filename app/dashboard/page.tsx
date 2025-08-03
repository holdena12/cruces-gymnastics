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
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        // Initialize edit form with user data
        setEditForm({
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          email: result.user.email
        });
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setIsEditing(false);
        setUpdateMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setUpdateMessage('An error occurred while updating your profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
            </div>

            {/* User & Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.first_name}!</span>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
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
              Welcome Back, {user?.first_name}!
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Manage your gymnastics journey and stay connected with Cruces Gymnastics Center.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Link href="/enroll" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center transition-all duration-300 group-hover:bg-red-700">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">New Enrollment</h3>
                  <p className="text-gray-600">Apply for a new gymnastics program</p>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">View Applications</h3>
                  <p className="text-gray-600">Check your enrollment status</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h3>
                  <p className="text-gray-600">Update your profile information</p>
                </div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="p-8">
                {/* Update Message */}
                {updateMessage && (
                  <div 
                    className={`mb-6 p-4 rounded-lg ${
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

                <div className="space-y-6">
                  {isEditing ? (
                    // Edit Mode
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </>
                  ) : (
                    // Display Mode
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <p className="text-lg text-gray-900">{user?.first_name} {user?.last_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <p className="text-lg text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user?.role === 'admin' ? 'Administrator' : 'Student'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <p className="text-lg text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-8 flex space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updateLoading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={updateLoading}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Update Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Overview */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Your Activity</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600 mb-2">0</p>
                    <p className="text-sm text-gray-600">Active Enrollments</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
                    <p className="text-sm text-gray-600">Applications Submitted</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600 mb-2">0</p>
                    <p className="text-sm text-gray-600">Programs Completed</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 mb-2">0</p>
                    <p className="text-sm text-gray-600">Certificates Earned</p>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">Welcome to Cruces Gymnastics!</h3>
                  <p className="text-red-700 mb-4">
                    Start by submitting an enrollment application to join one of our programs.
                  </p>
                  <Link href="/enroll" 
                    className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <p>3200 W. Picacho Ave<br />Las Cruces, NM 88001</p>
                <p>📞 [PHONE NUMBER NEEDED]</p>
                <p>✉️ [EMAIL ADDRESS NEEDED]</p>
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