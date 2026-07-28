import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('hiển thị children', () => {
    render(<Card>Nội dung</Card>);
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
  });

  it('hiển thị tiêu đề dạng chuỗi', () => {
    render(<Card title="Tiêu đề">x</Card>);
    expect(screen.getByRole('heading', { name: 'Tiêu đề' })).toBeInTheDocument();
  });

  it('hiển thị actions', () => {
    render(
      <Card title="T" actions={<button>Thêm</button>}>
        x
      </Card>
    );
    expect(screen.getByRole('button', { name: 'Thêm' })).toBeInTheDocument();
  });
});
