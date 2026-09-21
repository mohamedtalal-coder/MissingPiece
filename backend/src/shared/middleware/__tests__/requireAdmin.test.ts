import { requireAdmin } from '../requireAdmin.js';
import type { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import type { AppError } from '../errorHandler.js';

describe('requireAdmin middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn() as unknown as Response['json'],
    };
    nextFunction = jest.fn() as unknown as NextFunction;
  });

  it('should call next if userRole is admin', () => {
    mockRequest.userRole = 'admin';

    requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should pass a 403 AppError to next if userRole is buyer', () => {
    mockRequest.userRole = 'buyer';

    requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    const err = (nextFunction as jest.Mock).mock.calls[0]![0] as AppError;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Admin access required');
    expect(err.statusCode).toBe(403);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should pass a 403 AppError to next if userRole is missing', () => {
    requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    const err = (nextFunction as jest.Mock).mock.calls[0]![0] as AppError;
    expect(err.message).toBe('Admin access required');
    expect(err.statusCode).toBe(403);
  });
});
