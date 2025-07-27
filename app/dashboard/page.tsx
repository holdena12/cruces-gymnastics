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
      router.push('/login');
    } finally {
      setLoading(false);
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

  const handleEditProfile = () => {
    setIsEditing(true);
    setUpdateMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original user data
    if (user) {
      setEditForm({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      });
    }
    setUpdateMessage('');
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--gray-50)'}}>
      {/* Header */}
      <header className="glass sticky top-0 z-50" style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Cruces Gymnastics Center
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" 
                  className="ml-6 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-medium">Welcome, {user?.first_name}</span>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4" style={{color: 'var(--gray-900)'}}>Welcome back, {user?.first_name}!</h1>
          <p className="text-xl" style={{color: 'var(--gray-600)'}}>Manage your account and enrollment applications</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Link href="/enroll" className="card-modern p-8 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{background: 'var(--primary-600)'}}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>New Enrollment</h3>
                <p className="text-lg" style={{color: 'var(--gray-600)'}}>Apply for a new gymnastics program</p>
              </div>
            </div>
          </Link>

          <div className="card-modern p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{background: 'var(--secondary-600)'}}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>View Applications</h3>
                <p className="text-lg" style={{color: 'var(--gray-600)'}}>Check your enrollment status</p>
              </div>
            </div>
          </div>

          <div className="card-modern p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{background: 'var(--accent-600)'}}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>Account Settings</h3>
                <p className="text-lg" style={{color: 'var(--gray-600)'}}>Update your profile information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Account Information */}
          <div className="card-modern">
            <div className="px-8 py-6 border-b" style={{borderColor: 'var(--gray-200)'}}>
              <h2 className="text-3xl font-semibold" style={{color: 'var(--gray-900)'}}>Account Information</h2>
            </div>
            <div className="p-8">
              {/* Update Message */}
              {updateMessage && (
                <div 
                  className={`mb-6 p-4 rounded-xl ${
                    updateMessage.includes('successfully') 
                      ? 'border' 
                      : 'border'
                  }`}
                  style={{
                    background: updateMessage.includes('successfully') ? 'var(--accent-50)' : 'var(--primary-50)',
                    color: updateMessage.includes('successfully') ? 'var(--accent-800)' : 'var(--primary-800)',
                    borderColor: updateMessage.includes('successfully') ? 'var(--accent-200)' : 'var(--primary-200)'
                  }}
                >
                  {updateMessage}
                </div>
              )}

              <div className="space-y-6">
                {isEditing ? (
                  // Edit Mode
                  <>
                    <div>
                      <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                        style={{borderColor: 'var(--gray-300)', fontSize: '1.1rem'}}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                        style={{borderColor: 'var(--gray-300)', fontSize: '1.1rem'}}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold mb-3" style={{color: 'var(--gray-700)'}}>Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                        style={{borderColor: 'var(--gray-300)', fontSize: '1.1rem'}}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </>
                ) : (
                  // Display Mode
                  <>
                    <div>
                      <label className="block text-lg font-semibold mb-2" style={{color: 'var(--gray-700)'}}>Full Name</label>
                      <p className="text-xl" style={{color: 'var(--gray-900)'}}>{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold mb-2" style={{color: 'var(--gray-700)'}}>Email Address</label>
                      <p className="text-xl" style={{color: 'var(--gray-900)'}}>{user?.email}</p>
                    </div>
                  </>
                )}
                
                {/* Always show these fields */}
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{color: 'var(--gray-700)'}}>Account Type</label>
                  <span 
                    className={`inline-flex px-4 py-2 text-sm font-semibold rounded-xl ${
                      user?.role === 'admin' ? 'text-white' : 'text-white'
                    }`}
                    style={{
                      background: user?.role === 'admin' ? 'var(--secondary-600)' : 'var(--gray-600)'
                    }}
                  >
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{color: 'var(--gray-700)'}}>Member Since</label>
                  <p className="text-xl" style={{color: 'var(--gray-900)'}}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{color: 'var(--gray-700)'}}>Last Login</label>
                  <p className="text-xl" style={{color: 'var(--gray-900)'}}>
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--accent-600)',
                        color: 'white',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--gray-600)',
                        color: 'white',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    Update Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card-modern">
            <div className="px-8 py-6 border-b" style={{borderColor: 'var(--gray-200)'}}>
              <h2 className="text-3xl font-semibold" style={{color: 'var(--gray-900)'}}>Your Activity</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 rounded-xl" style={{background: 'var(--gray-50)'}}>
                  <p className="text-4xl font-bold mb-2" style={{color: 'var(--primary-600)'}}>0</p>
                  <p className="text-lg" style={{color: 'var(--gray-600)'}}>Active Enrollments</p>
                </div>
                <div className="text-center p-6 rounded-xl" style={{background: 'var(--gray-50)'}}>
                  <p className="text-4xl font-bold mb-2" style={{color: 'var(--secondary-600)'}}>0</p>
                  <p className="text-lg" style={{color: 'var(--gray-600)'}}>Applications Submitted</p>
                </div>
                <div className="text-center p-6 rounded-xl" style={{background: 'var(--gray-50)'}}>
                  <p className="text-4xl font-bold mb-2" style={{color: 'var(--accent-600)'}}>0</p>
                  <p className="text-lg" style={{color: 'var(--gray-600)'}}>Programs Completed</p>
                </div>
                <div className="text-center p-6 rounded-xl" style={{background: 'var(--gray-50)'}}>
                  <p className="text-4xl font-bold mb-2" style={{color: 'var(--gray-700)'}}>0</p>
                  <p className="text-lg" style={{color: 'var(--gray-600)'}}>Certificates Earned</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 rounded-xl" style={{background: 'var(--primary-50)', border: '1px solid var(--primary-200)'}}>
                <h3 className="text-2xl font-semibold mb-3" style={{color: 'var(--primary-900)'}}>Welcome to Cruces Gymnastics!</h3>
                <p className="text-lg mb-4" style={{color: 'var(--primary-700)'}}>
                  Start by submitting an enrollment application to join one of our programs.
                </p>
                <Link href="/enroll" 
                  className="inline-block px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (placeholder) */}
        <div className="mt-12 card-modern">
          <div className="px-8 py-6 border-b" style={{borderColor: 'var(--gray-200)'}}>
            <h2 className="text-3xl font-semibold" style={{color: 'var(--gray-900)'}}>Recent Activity</h2>
          </div>
          <div className="p-8">
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 mb-4" style={{color: 'var(--gray-400)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>No activity yet</h3>
              <p className="text-lg" style={{color: 'var(--gray-500)'}}>Start by enrolling in a program.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 