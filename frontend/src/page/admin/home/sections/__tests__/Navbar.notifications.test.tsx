import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Navbar from '../Navbar';
import {
  getNotificationPage,
  getNotificationUnreadCount,
  myProfile,
} from '../../../../../service/admin';

jest.mock('../../../../../service/admin', () => ({
  getNotificationPage: jest.fn(),
  getNotificationUnreadCount: jest.fn(),
  myProfile: jest.fn(),
  logout: jest.fn(),
  markAsRead: jest.fn(),
  markAllRead: jest.fn(),
}));
jest.mock('../ChatMenu', () => () => null);
jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const page = (start: number, hasNext: boolean) => ({
  code: 200,
  data: Array.from({ length: 5 }, (_, i) => ({
    id: String(start + i),
    title: `Thông báo ${start + i}`,
    type: 'SYSTEM',
    createdAt: '2026-10-08',
    read: true,
  })),
  meta: { hasNext, totalElements: 10 },
});

beforeEach(() => {
  jest.clearAllMocks();
  (myProfile as jest.Mock).mockResolvedValue({ code: 200, data: null });
  (getNotificationUnreadCount as jest.Mock).mockResolvedValue({ code: 200, data: 42 });
  (getNotificationPage as jest.Mock)
    .mockResolvedValueOnce(page(0, true))
    .mockResolvedValueOnce(page(5, false));
});

test('loads only unread count until opened, then requests subsequent pages on demand', async () => {
  render(<Navbar />);
  await screen.findByText('42');
  expect(getNotificationPage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Thông báo' }));
  await screen.findByText('Thông báo 0');
  expect(getNotificationPage).toHaveBeenCalledWith(0, 5);
  expect(screen.queryByText('Thông báo 3')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Xem thêm/ }));
  await screen.findByText('Thông báo 7');
  expect(getNotificationPage).toHaveBeenCalledWith(1, 5);
  expect(getNotificationPage).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: /Xem thêm/ }));
  await screen.findByText('Thông báo 9');
  expect(getNotificationPage).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
  await waitFor(() => expect(screen.queryByText('Thông báo 3')).not.toBeInTheDocument());
});
