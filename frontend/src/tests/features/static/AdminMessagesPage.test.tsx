import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMessagesPage } from '../../../features/static/AdminMessagesPage';
import { staticApi } from '../../../features/static/staticApi';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../../shared/context/ToastContext';

// Mock language context
vi.mock('../../../shared/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      adminMessages: {
        title: 'Admin Messages',
        subtitle: 'Review',
        noMessages: 'No Messages',
        noMessagesDescription: 'Empty'
      }
    }
  })
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AdminMessagesPage />
      </ToastProvider>
    </MemoryRouter>
  );
}

// Mock API
vi.mock('../../../features/static/staticApi', () => ({
  staticApi: {
    getContactMessages: vi.fn(),
    updateMessageStatus: vi.fn(),
  }
}));

describe('AdminMessagesPage', () => {
  const mockMessages = [
    {
      _id: 'msg-1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Issue',
      message: 'Help me',
      status: 'unread',
      createdAt: '2023-10-01T10:00:00Z'
    },
    {
      _id: 'msg-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Thanks',
      message: 'Great service',
      status: 'read',
      createdAt: '2023-10-02T10:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (staticApi.getContactMessages as any).mockResolvedValue({
      items: mockMessages,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    (staticApi.updateMessageStatus as any).mockResolvedValue({ success: true });
  });

  it('renders messages and filters correctly', async () => {
    renderPage();

    expect(screen.getByText('Customer Messages & Missing Piece Claims')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('updates message status to read when clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Mark Read' }));

    expect(staticApi.updateMessageStatus).toHaveBeenCalledWith('msg-1', 'read');
  });

  it('updates message status to resolved when resolve button clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Archive & Resolve').length).toBeGreaterThan(0);
    });

    const resolveButtons = screen.getAllByText('Archive & Resolve');
    await user.click(resolveButtons[0]);

    expect(staticApi.updateMessageStatus).toHaveBeenCalledWith('msg-1', 'resolved');
  });
});
