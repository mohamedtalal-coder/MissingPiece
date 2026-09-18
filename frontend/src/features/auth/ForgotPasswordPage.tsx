import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { authApi } from './authApi';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });

      setSuccess(response.message);
      setStep(2);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.resetPassword({
        email,
        otp,
        newPassword,
      });

      setSuccess(response.message + ' Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Invalid or expired reset code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b0914',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#130e21',
        border: '1px solid rgba(126, 34, 206, 0.6)',
        padding: '32px',
        borderRadius: '24px',
        boxShadow: '0 0 50px rgba(126, 34, 206, 0.4)',
        color: '#ffffff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#18112c',
            border: '1px solid #a855f7',
            borderRadius: '16px',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
          }}>
            <KeyRound style={{ width: '24px', height: '24px', color: '#c084fc' }} />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '6px',
            fontFamily: 'serif'
          }}>
            Reset Password
          </h1>

          <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
            {step === 1
              ? 'Enter your email to recover your account'
              : 'Enter the code sent to your email and your new password'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '12px',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '12px',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={handleCheckEmail}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#e9d5ff' }}>Email Address</label>

              <div style={{ position: 'relative' }}>
                <Mail style={{
                  width: '16px',
                  height: '16px',
                  color: '#c084fc',
                  position: 'absolute',
                  left: '12px',
                  top: '12px'
                }} />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="salma@example.com"
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0914',
                    border: '1px solid rgba(126, 34, 206, 0.4)',
                    borderRadius: '12px',
                    padding: '10px 10px 10px 38px',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #7e22ce, #a855f7)',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#e9d5ff' }}>Verification Code</label>

              <div style={{ position: 'relative' }}>
                <KeyRound style={{
                  width: '16px',
                  height: '16px',
                  color: '#c084fc',
                  position: 'absolute',
                  left: '12px',
                  top: '12px'
                }} />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0914',
                    border: '1px solid rgba(126, 34, 206, 0.4)',
                    borderRadius: '12px',
                    padding: '10px 10px 10px 38px',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#e9d5ff' }}>New Password</label>

              <div style={{ position: 'relative' }}>
                <Lock style={{
                  width: '16px',
                  height: '16px',
                  color: '#c084fc',
                  position: 'absolute',
                  left: '12px',
                  top: '12px'
                }} />

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0914',
                    border: '1px solid rgba(126, 34, 206, 0.4)',
                    borderRadius: '12px',
                    padding: '10px 10px 10px 38px',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #7e22ce, #a855f7)',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          Remember your password?{' '}
          <Link
            to="/login"
            style={{
              color: '#c084fc',
              textDecoration: 'underline'
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

