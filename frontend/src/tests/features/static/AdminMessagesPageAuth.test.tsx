import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../../shared/components/ProtectedRoute';
import { AdminMessagesPage } from '../../../features/static/AdminMessagesPage';
import { ToastProvider } from '../../../shared/context/ToastContext';

const mockUseAuth = vi.fn();

vi.mock('../../../features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../shared/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: { adminMessages: { title: 'Admin Messages' } },
  }),
}));

vi.mock('../../../features/static/staticApi', () => ({
  staticApi: {
    getContactMessages: vi.fn().mockResolvedValue({ items: [], totalPages: 1 }),
    updateMessageStatus: vi.fn(),
  },
}));

describe('AdminMessagesPage Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRouter = () => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin/messages',
          element: (
            <ToastProvider>
              <ProtectedRoute adminOnly>
                <AdminMessagesPage />
              </ProtectedRoute>
            </ToastProvider>
          ),
        },
        { path: '/login', element: <div>Login Page</div> },
        { path: '/', element: <div>Home Page</div> },
      ],
      { initialEntries: ['/admin/messages'] },
    );

    render(<RouterProvider router={router} />);
  };

  it('redirects to login if not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
    });

    renderRouter();

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('redirects to home if authenticated but not admin', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
    });

    renderRouter();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('renders admin messages page if authenticated and admin', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    renderRouter();

    await waitFor(() => {
      expect(screen.getByText('Customer Messages & Missing Piece Claims')).toBeInTheDocument();
    });
  });
});
