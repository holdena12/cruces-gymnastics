"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");

  // Check if the entered email appears to be an admin email
  const isAdminEmail = emailValue.toLowerCase().includes('admin') || 
                     emailValue.toLowerCase() === 'admin@crucesgymnastics.com';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember-me') === 'on';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordMessage("Please contact us at info@crucesgymnastics.com or (575) 123-4567 for password reset assistance.");
    setTimeout(() => setForgotPasswordMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="bg-gray-900 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600">Cruces Gymnastics Center</Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-red-500 font-medium">Login</Link>
              <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
                create a new account
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            {forgotPasswordMessage && (
              <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                <p className="text-sm font-medium">{forgotPasswordMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                {!isAdminEmail && (
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                )}

                {isAdminEmail && (
                  <div className="text-sm text-gray-500">
                    <span>Admin accounts require login each time for security</span>
                  </div>
                )}

                <div className="text-sm">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  } transition-colors`}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Demo Admin Account:
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Email: admin@crucesgymnastics.com<br />
                  Password: admin123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-red-500">Cruces Gymnastics Center</h2>
            <p className="text-gray-400 text-sm">Quality gymnastics training in Las Cruces.</p>
            <div className="mt-4 text-gray-400 text-xs">
              <p>&copy; 2025 Cruces Gymnastics Center. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 