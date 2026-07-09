import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock AuthService before imports
vi.mock('../services/authService', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loginWithGoogle: vi.fn(),
    updateUserProfile: vi.fn(),
    getEmailVerified: vi.fn(),
    sendVerificationCode: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    generateVerificationCode: vi.fn(),
    verifyEmailCode: vi.fn(),
    isPhoneVerified: vi.fn(),
    generatePhoneVerificationCode: vi.fn(),
    verifyPhoneCode: vi.fn(),
    checkNameExists: vi.fn(),
  },
}));

import { AuthService } from '../services/authService';

const mockAuthService = vi.mocked(AuthService);

describe('AuthContext', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    name: 'Test User',
    phone: '9876543210',
    role: 'citizen' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: true,
    nationality: 'citizen' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides authentication state to children', () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    function TestComponent() {
      const { user, loading, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="loading">{loading.toString()}</span>
          <span data-testid="authenticated">{isAuthenticated.toString()}</span>
          <span data-testid="user">{user?.name || 'null'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestComponent() {
      useAuth();
      return <div>Test</div>;
    }

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });
});