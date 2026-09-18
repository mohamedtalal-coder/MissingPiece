import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMessagesPage } from '../AdminMessagesPage';
import { staticApi } from '../staticApi';
import { MemoryRouter } from 'react-router-dom';

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

// Mock API
vi.mock('../staticApi', () => ({
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
    render(
      <MemoryRouter>
        <AdminMessagesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Customer Messages & Missing Piece Claims')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('updates message status to read when clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminMessagesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // msg-1 is unread, it has "New" badge
    const newBadge = screen.getByText('New');
    expect(newBadge).toBeInTheDocument();

    // click the message box
    await user.click(newBadge);

    expect(staticApi.updateMessageStatus).toHaveBeenCalledWith('msg-1', 'read');
  });

  it('updates message status to resolved when resolve button clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminMessagesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Mark as Resolved').length).toBeGreaterThan(0);
    });

    const resolveButtons = screen.getAllByText('Mark as Resolved');
    await user.click(resolveButtons[0]);

    expect(staticApi.updateMessageStatus).toHaveBeenCalledWith('msg-1', 'resolved');
  });
});
