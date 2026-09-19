import { updateOrderStatus, ALLOWED_TRANSITIONS } from '../order.service.js';
import { Order } from '../order.model.js';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

jest.mock('../../../shared/utils/withTransaction.js', () => ({
  withTransaction: jest.fn((cb: any) => cb({} as any)),
}));

describe('Order State Machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mongoose, 'startSession').mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    } as unknown as mongoose.ClientSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow valid transition from pending to paid', async () => {
    const mockOrder: any = {
      _id: new mongoose.Types.ObjectId(),
      status: 'pending',
      items: [],
      save: jest.fn(() => Promise.resolve(true)) as any,
    };
    jest.spyOn(Order, 'findById').mockReturnValue({
      session: (() => Promise.resolve(mockOrder)) as any,
    } as any);

    await updateOrderStatus(mockOrder._id.toString(), 'paid');

    expect(mockOrder.status).toBe('paid');
    expect(mockOrder.save).toHaveBeenCalled();
  });

  it('should reject invalid transition from shipped to pending', async () => {
    const mockOrder: any = {
      _id: new mongoose.Types.ObjectId(),
      status: 'shipped',
      items: [],
      save: jest.fn() as any,
    };
    jest.spyOn(Order, 'findById').mockReturnValue({
      session: (() => Promise.resolve(mockOrder)) as any,
    } as any);

    await expect(updateOrderStatus(mockOrder._id.toString(), 'pending')).rejects.toThrow(
      'Invalid status transition from shipped to pending'
    );

    expect(mockOrder.status).toBe('shipped');
    expect(mockOrder.save).not.toHaveBeenCalled();
  });

  it('should reject invalid transition from cancelled to paid', async () => {
    const mockOrder: any = {
      _id: new mongoose.Types.ObjectId(),
      status: 'cancelled',
      items: [],
      save: jest.fn() as any,
    };
    jest.spyOn(Order, 'findById').mockReturnValue({
      session: (() => Promise.resolve(mockOrder)) as any,
    } as any);

    await expect(updateOrderStatus(mockOrder._id.toString(), 'paid')).rejects.toThrow(
      'Invalid status transition from cancelled to paid'
    );
  });

  it('should allow refund from paid and reject double refund', async () => {
    expect(ALLOWED_TRANSITIONS.paid).toContain('refunded');
    expect(ALLOWED_TRANSITIONS.refunded).toEqual([]);
    expect(ALLOWED_TRANSITIONS.shipped).not.toContain('cancelled');
  });
});
