import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfilePage from '../../../features/account/ProfilePage';
import { accountApi } from '../../../features/account/accountApi';
import { LanguageProvider } from '../../../shared/context/LanguageContext';
import { ToastProvider } from '../../../shared/context/ToastContext';
import { AuthProvider } from '../../../features/auth/AuthContext';

vi.mock('../../../features/account/accountApi', () => ({
  accountApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe('Account Profile Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/profile']}>
              <Routes>
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    );
  };

  it('allows CRUD of addresses and respects 10-item cap', async () => {
    const mockAddresses = Array.from({ length: 9 }).map((_, i) => ({
      street: `Street ${i}`,
      city: 'City',
      state: 'State',
      zipCode: '00000',
      country: 'Country'
    }));

    (accountApi.getProfile as any).mockResolvedValueOnce({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      addresses: mockAddresses
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Dispatch Destinations')).toBeInTheDocument();
    });

    // Check we have 9 addresses and the warning message since we're approaching the limit
    expect(screen.getByText('9 of 10')).toBeInTheDocument();
    expect(screen.getByText('You are approaching the maximum limit of 10 saved addresses.')).toBeInTheDocument();

    // Add the 10th address
    const addBtn = screen.getByText('Add New Destination');
    fireEvent.click(addBtn);

    // Modal appears
    await waitFor(() => {
      expect(screen.getByText(/Street Address/i)).toBeInTheDocument(); // Modal label
    });

    const streetInput = screen.getByLabelText(/Street Address/i);
    const cityInput = screen.getByLabelText(/City/i);
    const stateInput = screen.getByLabelText(/State\/Province/i);
    const zipInput = screen.getByLabelText(/Zip\/Postal Code/i);
    const countryInput = screen.getByLabelText(/Country/i);

    fireEvent.change(streetInput, { target: { value: 'New Street' } });
    fireEvent.change(cityInput, { target: { value: 'New City' } });
    fireEvent.change(stateInput, { target: { value: 'New State' } });
    fireEvent.change(zipInput, { target: { value: 'New Zip' } });
    fireEvent.change(countryInput, { target: { value: 'New Country' } });

    // Mock save response
    (accountApi.updateProfile as any).mockResolvedValueOnce({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      addresses: [...mockAddresses, { street: 'New Street', city: 'New City', state: 'New State', zipCode: 'New Zip', country: 'New Country' }]
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('10 of 10')).toBeInTheDocument();
      expect(screen.queryByText('Add New Destination')).not.toBeInTheDocument(); // Button should be gone
    });

    // We can still remove an address
    const removeBtns = screen.getAllByText('Remove');
    expect(removeBtns).toHaveLength(10);

    // Remove the first address
    (accountApi.updateProfile as any).mockResolvedValueOnce({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      addresses: Array.from({ length: 9 }).map((_, i) => ({
        street: `Street ${i}`,
        city: 'City',
        state: 'State',
        zipCode: '00000',
        country: 'Country'
      })) // Simulating 9 left
    });

    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('9 of 10')).toBeInTheDocument();
      expect(screen.getByText('Add New Destination')).toBeInTheDocument(); // Button is back
    });
  });
});
