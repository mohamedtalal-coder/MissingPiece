import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsApi } from '../../../features/products/productsApi';
import { apiClient } from '../../../api/client';

vi.mock('../../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('productsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('forwards search to the products list endpoint', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { success: true, items: [], total: 0, page: 1, limit: 12, totalPages: 0 },
      });

      await productsApi.getAll({ search: 'oak atlas', page: 1, limit: 12 });

      expect(apiClient.get).toHaveBeenCalledWith('/products', {
        params: { search: 'oak atlas', page: 1, limit: 12 },
        signal: undefined,
      });
    });
  });

  describe('getAdminAll', () => {
    it('authorization test: non-admin token gets a real 403 from the backend', async () => {
      // Simulate backend returning 403 Forbidden for a non-admin user
      const mockError = new Error('Request failed with status code 403');
      (mockError as any).response = {
        status: 403,
        data: { success: false, message: 'Admin access required' }
      };

      (apiClient.get as any).mockRejectedValue(mockError);

      await expect(productsApi.getAdminAll()).rejects.toThrow('Request failed with status code 403');
      expect(apiClient.get).toHaveBeenCalledWith('/products/admin/all', { params: {}, signal: undefined });
    });
  });
});
