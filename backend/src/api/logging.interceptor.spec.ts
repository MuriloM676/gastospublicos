import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let loggerSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    const mockRequest = {
      method: 'GET',
      url: '/api/v1/test',
    };
    const mockResponse = {
      statusCode: 200,
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;

    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<CallHandler>;

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('intercept', () => {
    it('should log status code on successful response', (done) => {
      mockCallHandler.handle.mockReturnValue(of({ data: 'ok' }));

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET /api/v1/test 200'),
          );
          expect(loggerErrorSpy).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it('should log error on exception', (done) => {
      const testError = new Error('Test error');
      mockCallHandler.handle.mockReturnValue(throwError(() => testError));

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET /api/v1/test'),
          );
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Test error'),
          );
          done();
        },
      });
    });

    it('should use error status if present', (done) => {
      const testError = { status: 403, message: 'Forbidden' };
      mockCallHandler.handle.mockReturnValue(throwError(() => testError));

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('403'),
          );
          done();
        },
      });
    });

    it('should default to 500 when error has no status', (done) => {
      const testError = { message: 'Unknown' };
      mockCallHandler.handle.mockReturnValue(throwError(() => testError));

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      result$.subscribe({
        error: () => {
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('500'),
          );
          done();
        },
      });
    });
  });
});
