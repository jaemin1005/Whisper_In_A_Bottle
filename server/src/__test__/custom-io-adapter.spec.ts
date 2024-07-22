import { CustomIoAdapter } from '../letter/custom-io-adapter'; // 경로를 실제 경로로 수정하세요
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

describe('CustomIoAdapter', () => {
  let adapter: CustomIoAdapter;
  let mockApp: INestApplicationContext;
  let createIOServerSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockApp = {} as INestApplicationContext; // 간단한 mock 객체 생성
    adapter = new CustomIoAdapter(mockApp);

    // IoAdapter.prototype.createIOServer 메서드를 spy합니다
    createIOServerSpy = jest.spyOn(IoAdapter.prototype, 'createIOServer');
  });

  afterEach(() => {
    createIOServerSpy.mockRestore(); // 원래 구현 복원
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('createIOServer', () => {
    it('should configure CORS options correctly', () => {
      const port = 3000;
      const options: ServerOptions = {
        path: '/socket.io',
        serveClient: false,
        adapter: null as any, // Mock 또는 기본값을 사용
        parser: null as any, // Mock 또는 기본값을 사용
        connectTimeout: 45000,
        connectionStateRecovery: {
          maxDisconnectionDuration: 120000,
          skipMiddlewares: true,
        },
        cleanupEmptyChildNamespaces: false,
      };

      // Mock 구현 설정
      createIOServerSpy.mockImplementation(
        (port: number, options: ServerOptions) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _port = port;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _options = options;

          return {} as any; // Mocked server instance
        },
      );

      // adapter.createIOServer 호출
      adapter.createIOServer(port, options);

      // `super.createIOServer`의 호출을 검증
      expect(createIOServerSpy).toHaveBeenCalledWith(port, {
        ...options,
        cors: {
          origin: 'http://localhost:3000',
          methods: ['GET', 'POST'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
        },
      });
    });
  });
});
