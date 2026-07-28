import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('không render gì khi open=false', () => {
    render(
      <ConfirmDialog open={false} message="Xóa?" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.queryByText('Xóa?')).not.toBeInTheDocument();
  });

  it('hiển thị thông điệp và nút khi mở', () => {
    render(
      <ConfirmDialog open message="Bạn có chắc?" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.getByText('Bạn có chắc?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
  });

  it('gọi onConfirm khi bấm xác nhận', async () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        open
        message="?"
        confirmText="Xóa"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('gọi onCancel khi bấm hủy', async () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog open message="?" onConfirm={jest.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
