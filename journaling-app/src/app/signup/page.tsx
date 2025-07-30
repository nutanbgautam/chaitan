'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Account creation failed. Please try again.');
        return;
      }

      console.log('Signup successful:', data);

      // Sign in the user after successful signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError('Account created but login failed. Please try signing in.');
        console.error('Sign in error:', result.error);
      } else {
        console.log('Sign in successful, redirecting to check-in');
        router.push('/check-in');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signIn('google', { callbackUrl: '/check-in' });
    } catch (error) {
      setError('Google signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
            <Sparkles className="me-2" />
            Join Us
          </div>
          <h1 className="text-white display-5 fw-bold mb-2">Create Account</h1>
          <p className="text-white opacity-75 fs-5">Start your journaling journey</p>
        </div>

        {/* Signup Form */}
        <div className="card bg-dark bg-opacity-25 border-0">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label text-white fw-medium">
                  Full Name
                </label>
                <div className="position-relative">
                  <User className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-white fw-medium">
                  Email Address
                </label>
                <div className="position-relative">
                  <Mail className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label text-white fw-medium">
                  Password
                </label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5 pe-5"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-white opacity-75 p-0 me-3"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label text-white fw-medium">
                  Confirm Password
                </label>
                <div className="position-relative">
                  <Lock className="position-absolute top-50 start-0 translate-middle-y text-white opacity-75 ms-3" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white placeholder-white placeholder-opacity-60 ps-5 pe-5"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-white opacity-75 p-0 me-3"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger bg-danger bg-opacity-25 border border-danger border-opacity-25 text-white">
                  {error}
                </div>
              )}

              {/* Signup Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-100 py-3 fw-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ms-2" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center my-4">
              <div className="flex-fill border-top border-white border-opacity-25"></div>
              <span className="px-3 text-white opacity-75 small">or</span>
              <div className="flex-fill border-top border-white border-opacity-25"></div>
            </div>

            {/* Google Signup */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn btn-light w-100 py-3 d-flex align-items-center justify-content-center fw-semibold"
            >
              <svg className="me-3" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Sign In Link */}
            <div className="text-center mt-4">
              <p className="text-white opacity-75 mb-0">
                Already have an account?{' '}
                <Link href="/login" className="text-white fw-semibold text-decoration-none">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center mt-3">
              <p className="text-white opacity-50 small mb-0">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-white text-decoration-none">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white text-decoration-none">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 