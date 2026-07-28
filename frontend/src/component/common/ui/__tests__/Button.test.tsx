import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  it('hiển thị nội dung và bắt sự kiện click', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Lưu</Button>);
    const btn = screen.getByRole('button', { name: 'Lưu' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('khi loading thì disabled và không click được', async () => {
    const onClick = jest.fn();
    render(
      <Button loading onClick={onClick}>
        Gửi
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Gửi' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('tôn trọng prop disabled', () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();
  });

  it('áp dụng class theo biến thể danger', () => {
    render(<Button variant="danger">Xóa</Button>);
    expect(screen.getByRole('button', { name: 'Xóa' }).className).toMatch(/bg-red-600/);
  });

  it('hiển thị leftIcon', () => {
    render(<Button leftIcon={<span data-testid="ic" />}>Thêm</Button>);
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });
});
