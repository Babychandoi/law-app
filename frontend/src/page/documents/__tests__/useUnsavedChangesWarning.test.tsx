import { fireEvent, render, screen } from '@testing-library/react';
import useUnsavedChangesWarning from '../useUnsavedChangesWarning';

function Harness({ dirty }: { dirty: boolean }) {
  useUnsavedChangesWarning(dirty);
  return (
    <a href="/another-page" onClick={(event) => event.preventDefault()}>
      Rời trang
    </a>
  );
}

describe('useUnsavedChangesWarning', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('chặn liên kết nội bộ khi người dùng hủy rời trang', () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Harness dirty />);
    const dispatched = fireEvent.click(screen.getByRole('link', { name: 'Rời trang' }));
    expect(confirm).toHaveBeenCalled();
    expect(dispatched).toBe(false);
  });

  it('đánh dấu beforeunload là đã bị chặn khi còn dữ liệu chưa lưu', () => {
    render(<Harness dirty />);
    const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('không cảnh báo khi dữ liệu đã được lưu', () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Harness dirty={false} />);
    fireEvent.click(screen.getByRole('link', { name: 'Rời trang' }));
    expect(confirm).not.toHaveBeenCalled();
  });
});
