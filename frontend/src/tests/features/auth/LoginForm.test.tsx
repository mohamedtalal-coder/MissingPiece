import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../../../features/auth/LoginForm';
import { authApi } from '../../../features/auth/authApi';

vi.mock('../../../features/auth/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

vi.mock('../../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

vi.mock('../../../shared/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      auth: {
        email: 'Email Address',
        password: 'Password',
        signIn: 'Sign In',
        requiredFields: 'Please fill in all required fields.',
        invalidEmail: 'Please enter a valid email address.',
        passwordLength: 'Password must be at least 8 characters.',
        invalidCredentials: 'Invalid email or password.',
        noAccount: "Don't have an account?",
        registerHere: 'Register here',
      },
    },
    language: 'en',
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/required fields/i);
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('rejects invalid email', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('calls authApi.login with sanitized credentials', async () => {
    (authApi.login as any).mockResolvedValue({
      token: 'tok',
      user: { id: '1', name: 'A', email: 'a@example.com', role: 'user' },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: '  A@Example.com  ' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'a@example.com',
        password: 'Password123!',
      });
    });
  });
});
