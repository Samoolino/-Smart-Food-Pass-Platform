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
  it('renders onboarding navigation state and key trust content', () => {
    render(<OnboardingPage />);

    expect(screen.getByTestId('role-navigation')).toHaveTextContent('onboarding');
    expect(screen.getByText(/Secure registration, KYC clarity, and verified access pathways/i)).toBeInTheDocument();
    expect(screen.getByText(/Document readiness and screening visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Wallet, bank, and authorization connection model/i)).toBeInTheDocument();
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

  it('shows document checklist and connection guidance blocks', () => {
    render(<OnboardingPage />);

    expect(screen.getByText(/Government ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Proof of address/i)).toBeInTheDocument();
    expect(screen.getByText(/Wallet connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Authorization layer/i)).toBeInTheDocument();
  });
});
