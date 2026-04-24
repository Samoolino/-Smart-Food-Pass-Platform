import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import OnboardingPage from '../app/onboarding/page';

jest.mock('../components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/role-navigation', () => ({
  RoleNavigation: ({ current }: { current: string }) => <div data-testid="role-navigation">{current}</div>,
}));

describe('OnboardingPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders onboarding navigation state and key trust content', () => {
    render(<OnboardingPage />);

    expect(screen.getByTestId('role-navigation')).toHaveTextContent('onboarding');
    expect(screen.getByText(/Secure registration, KYC clarity, and verified access pathways/i)).toBeInTheDocument();
    expect(screen.getByText(/Document readiness and screening visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Wallet, bank, and authorization connection model/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved progress: On/i)).toBeInTheDocument();
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

  it('supports kyc upload widgets and step persistence', () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: /Onboarding & KYC\/KYB compliance/i }));

    const governmentIdInput = screen.getByLabelText(/Upload Government ID/i);
    const proofOfAddressInput = screen.getByLabelText(/Upload Proof of address/i);

    fireEvent.change(governmentIdInput, {
      target: {
        files: [new File(['government-id'], 'passport.pdf', { type: 'application/pdf' })],
      },
    });

    fireEvent.change(proofOfAddressInput, {
      target: {
        files: [new File(['utility-bill'], 'utility-bill.pdf', { type: 'application/pdf' })],
      },
    });

    fireEvent.click(screen.getByLabelText(/I understand why these documents are required/i));

    expect(screen.getByText(/Saved file: passport.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved file: utility-bill.pdf/i)).toBeInTheDocument();

    const persisted = JSON.parse(window.localStorage.getItem('smartfoodpass:onboarding-state') || '{}');
    expect(persisted.activeStep).toBe('kyc');
    expect(persisted.kyc.governmentIdFileName).toBe('passport.pdf');
    expect(persisted.kyc.proofOfAddressFileName).toBe('utility-bill.pdf');
    expect(persisted.kyc.consentChecked).toBe(true);
  });

  it('restores saved onboarding progress from local storage', () => {
    window.localStorage.setItem(
      'smartfoodpass:onboarding-state',
      JSON.stringify({
        activeStep: 'finance',
        account: {
          fullName: 'Ada Sponsor',
          email: 'ada@example.com',
          phone: '+2340000000',
          role: 'sponsor',
          security: ['2FA', 'PIN'],
        },
        kyc: {
          governmentIdFileName: 'passport.pdf',
          proofOfAddressFileName: 'utility-bill.pdf',
          businessVerificationFileName: '',
          pepStatus: 'clear',
          consentChecked: true,
        },
        finance: {
          walletAddress: '0xabc123',
          bankConnectionStatus: 'verified',
          cardConnectionStatus: 'pending_review',
          authorizationMode: 'pin',
        },
      }),
    );

    render(<OnboardingPage />);

    expect(screen.getByDisplayValue('0xabc123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('verified')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pending_review')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pin')).toBeInTheDocument();
  });
});
