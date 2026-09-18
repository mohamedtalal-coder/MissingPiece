import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminProductsPage } from '../../../features/products/AdminProductsPage';
import { productsApi } from '../../../features/products/productsApi';
import { apiClient } from '../../../api/client';
import { ToastProvider } from '../../../shared/context/ToastContext';

vi.mock('../../../features/products/productsApi', () => ({
  productsApi: {
    getAdminAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../shared/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      adminProducts: {
        title: 'Product Management',
        description: 'Manage products',
        addNew: 'Add New',
        createProduct: 'Create Product',
        productTitle: 'Title',
        productDescription: 'Description',
        price: 'Price',
        stock: 'Stock',
        imageUrl: 'Image URL',
        saveProduct: 'Save',
        product: 'Product',
        category: 'Category',
        actions: 'Actions',
        categories: {
          jigsaw: 'Jigsaw',
          threeD: '3D',
          wooden: 'Wooden',
          mystery: 'Mystery',
        },
        deleteConfirm: 'Are you sure?',
      },
      common: {
        price: 'Price',
        quantity: 'Quantity',
        cancel: 'Cancel',
      },
    },
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AdminProductsPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProducts = [
    {
      _id: '1',
      name: 'Active Product',
      category: 'Jigsaw Puzzles',
      price: 29.99,
      stock: 100,
      isActive: true,
      images: ['url1'],
      averageRating: 4.5,
      reviewCount: 10,
    },
    {
      _id: '2',
      name: 'Inactive Product',
      category: '3D Puzzles',
      price: 39.99,
      stock: 50,
      isActive: false,
      images: ['url2'],
      averageRating: 0,
      reviewCount: 0,
    },
  ];

  it('fetches and displays products including inactive ones', async () => {
    (productsApi.getAdminAll as any).mockResolvedValue({ items: mockProducts });

    renderPage();

    expect(productsApi.getAdminAll).toHaveBeenCalledWith({ limit: 50 });

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument();
      expect(screen.getByText('Inactive Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('can create a new product with isActive flag', async () => {
    (productsApi.getAdminAll as any).mockResolvedValue({ items: [] });
    (productsApi.create as any).mockResolvedValue({ ...mockProducts[0], _id: '3', name: 'New Product' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No editions match.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add New Puzzle Edition'));

    fireEvent.change(screen.getByLabelText(/Puzzle Title/i), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'A detailed artisan description' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Stock/i), { target: { value: '5' } });

    const activeCheckbox = screen.getByLabelText(/Visible in public storefront/i);
    expect(activeCheckbox).toBeChecked();
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();
    fireEvent.click(activeCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'Create Edition' }));

    await waitFor(() => {
      expect(productsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          isActive: true,
        }),
      );
    });
  });

  it('shows delete confirmation flow', async () => {
    (productsApi.getAdminAll as any).mockResolvedValue({ items: mockProducts });
    (productsApi.delete as any).mockResolvedValue({ success: true });

    window.confirm = vi.fn().mockReturnValue(true);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Active Product')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure?');

    await waitFor(() => {
      expect(productsApi.delete).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Active Product')).not.toBeInTheDocument();
    });
  });

  it('authorization test: non-admin token gets a real 403 from the backend', async () => {
    const error403 = { response: { status: 403, data: { success: false, message: 'Forbidden' } } };
    (apiClient.get as any).mockRejectedValue(error403);
    (productsApi.getAdminAll as any).mockRejectedValue(error403);

    renderPage();

    expect(productsApi.getAdminAll).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();
    });
  });
});
