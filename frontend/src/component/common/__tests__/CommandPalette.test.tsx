import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CommandPalette from '../CommandPalette';
import { LayoutDashboard, Users } from 'lucide-react';
import type { NavGroup } from '../../../page/admin/home/navConfig';

const groups: NavGroup[] = [
  { title: 'Tổng quan', items: [{ label: 'Trang chủ', path: '/admin', icon: LayoutDashboard }] },
  { title: 'Khách hàng', items: [{ label: 'Khách hàng', path: '/admin/customers', icon: Users }] },
];

const renderR = () =>
  render(
    <MemoryRouter>
      <CommandPalette groups={groups} />
    </MemoryRouter>
  );

describe('CommandPalette', () => {
  it('ẩn mặc định, mở bằng Ctrl+K', async () => {
    renderR();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: /Bảng lệnh/ })).toBeInTheDocument();
    // Hiển thị các điểm đến.
    expect(screen.getByRole('option', { name: /Trang chủ/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Khách hàng/ })).toBeInTheDocument();
  });

  it('gõ để lọc điểm đến', async () => {
    renderR();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByRole('combobox'), 'khách');
    expect(screen.getByRole('option', { name: /Khách hàng/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Trang chủ/ })).not.toBeInTheDocument();
  });

  it('đóng bằng Escape', async () => {
    renderR();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
