import { render, screen } from '@testing-library/react';
import Spinner from '../Spinner';

describe('Spinner', () => {
  it('có role status và nhãn mặc định cho screen reader', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Đang tải')).toBeInTheDocument();
  });

  it('nhận nhãn tùy chỉnh', () => {
    render(<Spinner label="Đang lưu" />);
    expect(screen.getByText('Đang lưu')).toBeInTheDocument();
  });
});
