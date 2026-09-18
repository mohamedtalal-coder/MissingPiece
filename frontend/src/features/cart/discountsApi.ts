import { apiClient } from '../../api/client';

export interface DiscountValidateResult {
  discountAmount: number;
  applied: boolean;
}

export const discountsApi = {
  validateCode: async (
    code: string,
    items: { product: string; quantity: number }[]
  ): Promise<DiscountValidateResult> => {
    const response = await apiClient.post<{ success: boolean } & DiscountValidateResult>(
      '/discounts/validate',
      { code: code.trim().toUpperCase().slice(0, 20), items }
    );
    return {
      discountAmount: response.data.discountAmount ?? 0,
      applied: Boolean(response.data.applied),
    };
  },
};
