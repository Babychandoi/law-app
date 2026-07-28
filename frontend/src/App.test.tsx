import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from './page/home/Slide';

test('homepage hero presents the primary consultation paths', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Hero />
    </MemoryRouter>
  );

  expect(
    screen.getByRole('heading', {
      name: /bảo vệ tài sản trí tuệ để doanh nghiệp phát triển vững chắc/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /nhận tư vấn ban đầu/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /gọi 0947.600.064/i })).toHaveAttribute(
    'href',
    'tel:0947600064'
  );
  expect(screen.getByRole('link', { name: /nhắn zalo/i })).toBeInTheDocument();
});
