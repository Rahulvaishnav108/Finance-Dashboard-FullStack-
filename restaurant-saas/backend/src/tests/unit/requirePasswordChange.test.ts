import { Request, Response } from 'express';
import { requirePasswordChange } from '../../middleware/requirePasswordChange';
import { ErrorCode } from '../../constants/errors';

describe('requirePasswordChange middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      path: '/api/v1/some-route',
      user: {
        _id: '1',
        id: '1',
        role: 'STAFF',
      }
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('calls next() if user does NOT have mustChangePassword=true', () => {
    requirePasswordChange(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('calls next(error) if user has mustChangePassword=true', () => {
    mockReq.user!.mustChangePassword = true;
    requirePasswordChange(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const errorArgs = mockNext.mock.calls[0][0];
    expect(errorArgs).toBeDefined();
    expect(errorArgs.statusCode).toBe(403);
    expect(errorArgs.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('allows access to allowed paths even if mustChangePassword=true', () => {
    mockReq.user!.mustChangePassword = true;
    const allowedPaths = [
      '/auth/logout',
      '/api/v1/auth/refresh',
      '/users/me/password'
    ];

    allowedPaths.forEach(path => {
      mockNext.mockClear();
      const customReq = { ...mockReq, path } as Request;
      requirePasswordChange(customReq, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  it('allows access to GET /users/me even if mustChangePassword=true', () => {
    mockReq.user!.mustChangePassword = true;
    mockReq.method = 'GET';
    const customReq = { ...mockReq, path: '/api/v1/users/me' } as Request;
    requirePasswordChange(customReq, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });
});