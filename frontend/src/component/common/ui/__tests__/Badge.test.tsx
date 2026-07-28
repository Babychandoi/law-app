import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('hiển thị nội dung', () => {
    render(<Badge>Mới</Badge>);
    expect(screen.getByText('Mới')).toBeInTheDocument();
  });

  it('áp class theo màu', () => {
    render(<Badge color="green">OK</Badge>);
    expect(screen.getByText('OK').className).toMatch(/bg-green-100/);
  });

  it('mặc định màu gray', () => {
    render(<Badge>N/A</Badge>);
    expect(screen.getByText('N/A').className).toMatch(/bg-gray-100/);
  });
});
