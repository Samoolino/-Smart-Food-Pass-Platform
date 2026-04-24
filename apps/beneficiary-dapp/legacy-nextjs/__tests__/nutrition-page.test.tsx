import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NutritionPage from '../app/nutrition/page';
import { api } from '../lib/api';

jest.mock('../components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/role-navigation', () => ({
  RoleNavigation: ({ current }: { current: string }) => <div data-testid="role-navigation">{current}</div>,
}));

jest.mock('../lib/api', () => ({
  api: {
    getAccessibleMarketplace: jest.fn(),
  },
}));

describe('NutritionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nutrition navigation state and loads accessible products', async () => {
    (api.getAccessibleMarketplace as jest.Mock).mockResolvedValue({
      plans: [{ id: 1 }],
      accessible: [
        {
          id: 7,
          merchantId: 4,
          productId: 9,
          price: 4500,
          merchantWalletAddress: '0xmerchant',
          productOwnerWalletAddress: '0xowner',
          category: 'protein',
        },
      ],
      guidance: { nutritionSupplyChain: 'Priority should go to approved protein support.' },
    });

    render(<NutritionPage />);

    expect(screen.getByTestId('role-navigation')).toHaveTextContent('nutrition');
    fireEvent.click(screen.getByRole('button', { name: /Load nutrition access/i }));

    await waitFor(() => {
      expect(api.getAccessibleMarketplace).toHaveBeenCalledWith(1, undefined);
    });

    expect(await screen.findByText(/Priority should go to approved protein support./i)).toBeInTheDocument();
    expect(screen.getByText(/Registry #7/i)).toBeInTheDocument();
    expect(screen.getByText(/Merchant #4 · Product #9/i)).toBeInTheDocument();
  });

  it('passes optional pass id into the eligibility lookup', async () => {
    (api.getAccessibleMarketplace as jest.Mock).mockResolvedValue({ plans: [], accessible: [] });

    render(<NutritionPage />);

    fireEvent.change(screen.getByLabelText(/Pass ID \(optional\)/i), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: /Load nutrition access/i }));

    await waitFor(() => {
      expect(api.getAccessibleMarketplace).toHaveBeenCalledWith(1, 22);
    });
  });

  it('shows an error message when the lookup fails', async () => {
    (api.getAccessibleMarketplace as jest.Mock).mockRejectedValue(new Error('Failed to load nutrition workspace'));

    render(<NutritionPage />);
    fireEvent.click(screen.getByRole('button', { name: /Load nutrition access/i }));

    expect(await screen.findByText(/Failed to load nutrition workspace/i)).toBeInTheDocument();
  });
});
