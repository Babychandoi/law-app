import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirm } from '../useConfirm';

// Harness: bấm "Kích hoạt" -> gọi confirm(), lưu kết quả vào state để hiển thị.
function Harness() {
  const { confirm, confirmDialog } = useConfirm();
  const [result, setResult] = useState<string>('');
  return (
    <div>
      {confirmDialog}
      <button
        onClick={async () => {
          const ok = await confirm({ message: 'Xóa mục này?', confirmText: 'Đồng ý' });
          setResult(ok ? 'YES' : 'NO');
        }}
      >
        Kích hoạt
      </button>
      {result && <span data-testid="result">{result}</span>}
    </div>
  );
}

describe('useConfirm', () => {
  it('resolve true khi người dùng xác nhận', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
    expect(screen.getByText('Xóa mục này?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Đồng ý' }));
    expect(await screen.findByTestId('result')).toHaveTextContent('YES');
  });

  it('resolve false khi người dùng hủy', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(await screen.findByTestId('result')).toHaveTextContent('NO');
  });
});
