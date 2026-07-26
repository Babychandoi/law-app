import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('liên kết label với ô nhập qua id', () => {
    render(<Input label="Email" />);
    // getByLabelText chỉ tìm thấy khi label liên kết đúng htmlFor/id
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('hiển thị lỗi và đặt aria-invalid', () => {
    render(<Input label="Email" error="Email không hợp lệ" />);
    expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hiển thị hint khi không có lỗi', () => {
    render(<Input label="Mật khẩu" hint="Ít nhất 6 ký tự" />);
    expect(screen.getByText('Ít nhất 6 ký tự')).toBeInTheDocument();
  });

  it('ẩn hint khi có lỗi', () => {
    render(<Input label="Mật khẩu" hint="Gợi ý" error="Sai rồi" />);
    expect(screen.queryByText('Gợi ý')).not.toBeInTheDocument();
    expect(screen.getByText('Sai rồi')).toBeInTheDocument();
  });

  it('nhận nhập liệu', async () => {
    render(<Input label="Tên" />);
    const el = screen.getByLabelText('Tên');
    await userEvent.type(el, 'Phong');
    expect(el).toHaveValue('Phong');
  });
});
