import { render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('hiển thị tiêu đề và mô tả', () => {
    render(<EmptyState title="Trống" description="Chưa có gì" />);
    expect(screen.getByText('Trống')).toBeInTheDocument();
    expect(screen.getByText('Chưa có gì')).toBeInTheDocument();
  });

  it('hiển thị hành động khi được truyền', () => {
    render(<EmptyState title="Trống" action={<button>Thêm</button>} />);
    expect(screen.getByRole('button', { name: 'Thêm' })).toBeInTheDocument();
  });

  it('render icon không lỗi', () => {
    render(<EmptyState icon={Mail} title="Trống" />);
    expect(screen.getByText('Trống')).toBeInTheDocument();
  });
});
