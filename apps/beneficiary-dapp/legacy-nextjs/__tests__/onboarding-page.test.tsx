import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OnboardingPage from '../app/onboarding/page';
import { api } from '../lib/api';

jest.mock('../components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/role-navigation', () => ({
  RoleNavigation: ({ current }: { current: string }) => <div data-testid="role-navigation">{current}</div>,
}));

jest.mock('../lib/api', () => ({
  api: {
    getProfile: jest.fn(),
    getOnboardingDraft: jest.fn(),
    updateOnboardingDraft: jest.fn(async () => ({})),
    updateProfile: jest.fn(async () => ({})),
  },
}));

describe('OnboardingPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    (api.getProfile as jest.Mock).mockResolvedValue({
      email: 'ada@example.com',
      phone: '+2340000000',
      role: 'beneficiary',
      firstName: 'Ada',
      lastName: 'User',
      walletAddress: '0xabc123',
    });
    (api.getOnboardingDraft as jest.Mock).mockResolvedValue({
      activeStep: 'account',
      roleVariant: 'beneficiary',
      completionStatus: 'draft',
      account: { role: 'beneficiary', security: ['2FA'] },
      kyc: {},
      finance: { authorizationMode: 'biometric' },
    });
  });

  it('renders onboarding navigation state and key trust content', async () => {
    render(<OnboardingPage />);

    expect(screen.getByTestId('role-navigation')).toHaveTextContent('onboarding');
    expect(screen.getByText(/Secure registration, KYC clarity, and verified access pathways/i)).toBeInTheDocument();
    expect(screen.getByText(/Draft sync:/i)).toBeInTheDocument();
    expect(screen.getByText(/Role-specific onboarding variant/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getProfile).toHaveBeenCalled();
      expect(api.getOnboardingDraft).toHaveBeenCalled();
    });
  });

  it('switches active stages when a flow stage is selected', () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: /Onboarding & KYC\/KYB compliance/i }));
    expect(screen.getAllByText(/Onboarding & KYC\/KYB compliance/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Government ID upload/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Financial data connection/i }));
    expect(screen.getAllByText(/Financial data connection/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Wallet linkage/i)).toBeInTheDocument();
  });

  it('supports kyc upload widgets and role variant switching', async () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: /merchant/i }));
    expect(screen.getByText(/Merchant onboarding variant/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Onboarding & KYC\/KYB compliance/i }));

    const governmentIdInput = screen.getByLabelText(/Upload Government ID/i);
    fireEvent.change(governmentIdInput, {
      target: { files: [new File(['government-id'], 'passport.pdf', { type: 'application/pdf' })] },
    });

    expect(screen.getByText(/Saved file: passport.pdf/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.updateOnboardingDraft).toHaveBeenCalled();
    });
  });

  it('restores saved onboarding progress from local storage before remote sync', async () => {
    window.localStorage.setItem(
      'smartfoodpass:onboarding-state',
      JSON.stringify({
        activeStep: 'finance',
        account: { fullName: 'Ada Sponsor', email: 'ada@example.com', phone: '+2340000000', role: 'sponsor', security: ['2FA', 'PIN'] },
        kyc: { governmentIdFileName: 'passport.pdf', proofOfAddressFileName: 'utility-bill.pdf', businessVerificationFileName: 'cac.pdf', pepStatus: 'clear', consentChecked: true },
        finance: { walletAddress: '0xabc123', bankConnectionStatus: 'verified', cardConnectionStatus: 'pending_review', authorizationMode: 'pin' },
        roleVariant: 'sponsor',
      }),
    );

    render(<OnboardingPage />);

    expect(screen.getByDisplayValue('0xabc123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('verified')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pending_review')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pin')).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getOnboardingDraft).toHaveBeenCalled();
    });
  });
});
