import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

// Harness: input có kiểm soát -> mỗi ký tự khiến cha re-render và tạo onClose mới.
// Nếu effect của Modal phụ thuộc onClose, focus sẽ nhảy về nút đóng sau mỗi ký tự.
function Harness() {
  const [v, setV] = useState('');
  return (
    <Modal title="Form" onClose={() => {}}>
      <input aria-label="ten" value={v} onChange={(e) => setV(e.target.value)} />
    </Modal>
  );
}

describe('Modal', () => {
  it('không mất focus ô nhập khi cha re-render mỗi lần gõ (regression)', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('ten');
    input.focus();
    await userEvent.type(input, 'phong');
    expect(input).toHaveValue('phong');
    expect(input).toHaveFocus();
  });

  it('gọi onClose khi bấm nút đóng', async () => {
    const onClose = jest.fn();
    render(
      <Modal title="T" onClose={onClose}>
        nội dung
      </Modal>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('đóng khi nhấn Escape', async () => {
    const onClose = jest.fn();
    render(
      <Modal title="T" onClose={onClose}>
        nội dung
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
