import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { getCustomers, getCustomerStats } from '../../../../../service/admin';
import { getMe } from '../../../../../service/auth';
import chatService from '../../../../../service/chat';

jest.mock('../../../../../service/admin', () => ({
  getCustomers: jest.fn(),
  getCustomerStats: jest.fn(),
}));
jest.mock('../../../../../service/auth', () => ({ getMe: jest.fn() }));
jest.mock('../../../../../service/chat', () => ({
  __esModule: true,
  default: { fetchStats: jest.fn() },
}));

test('uses aggregate stats and keeps successful sections when chat fails', async () => {
  (getCustomerStats as jest.Mock).mockResolvedValue({
    data: { total: 17, newLead: 4, pending: 9 },
  });
  (getCustomers as jest.Mock).mockResolvedValue({
    data: [{ id: '1', name: 'Khách gần đây', status: 'NEW' }],
  });
  (getMe as jest.Mock).mockResolvedValue({ id: 'user-1' });
  (chatService.fetchStats as jest.Mock).mockRejectedValue(new Error('timeout'));
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  await screen.findByText('Khách gần đây');
  expect(screen.getByText('17')).toBeInTheDocument();
  expect(screen.getByText('9')).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByText(/Không tải được một phần dữ liệu/)).toBeInTheDocument()
  );
  expect(getCustomerStats).toHaveBeenCalledTimes(1);
  expect(getCustomers).toHaveBeenCalledTimes(1);
  expect(getCustomers).toHaveBeenCalledWith({ page: 0, size: 6 });
});
