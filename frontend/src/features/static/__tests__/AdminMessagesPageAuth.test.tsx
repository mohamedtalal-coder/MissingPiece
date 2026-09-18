import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../../shared/components/ProtectedRoute';
import { AdminMessagesPage } from '../AdminMessagesPage';

// We mock AuthContext entirely here for testing auth logic
const mockUseAuth = vi.fn();
vi.mock('../../../features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../../shared/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: { adminMessages: { title: 'Admin Messages' } }
  })
}));

describe('AdminMessagesPage Authorization', () => {
  const renderRouter = () => {
    const router = createMemoryRouter([
      {
        path: '/admin/messages',
        element: (
          <ProtectedRoute adminOnly>
            <AdminMessagesPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/login',
        element: <div>Login Page</div>
      },
      {
        path: '/',
        element: <div>Home Page</div>
      }
    ], {
      initialEntries: ['/admin/messages']
    });

    render(<RouterProvider router={router} />);
  };

  it('redirects to login if not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false
    });

    renderRouter();

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('redirects to home if authenticated but not admin', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false
    });

    renderRouter();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('renders admin messages page if authenticated and admin', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true
    });

    // Mock API for the page to not crash
    vi.mock('../staticApi', () => ({
      staticApi: {
        getContactMessages: vi.fn().mockResolvedValue({ items: [], totalPages: 1 })
      }
    }));

    renderRouter();

    await waitFor(() => {
      // Because we mock LanguageContext, "Customer Messages & Missing Piece Claims" is rendered
      // since the title uses string literal in our refactored component.
      expect(screen.getByText('Customer Messages & Missing Piece Claims')).toBeInTheDocument();
    });
  });
});
