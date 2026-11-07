import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_MESSAGE = 'Bạn có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?';

/**
 * BrowserRouter của ứng dụng không cung cấp data-router blocker. Hook này bảo vệ cả refresh/đóng
 * tab và các liên kết nội bộ; nút quay lại của trình duyệt được khôi phục nếu người dùng hủy.
 */
export default function useUnsavedChangesWarning(
  when: boolean,
  message = DEFAULT_MESSAGE
): () => void {
  const bypassRef = useRef(false);
  const restoringHistoryRef = useRef(false);

  const allowNextNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  useEffect(() => {
    if (!when) {
      bypassRef.current = false;
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bypassRef.current) return;
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (bypassRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${destination.pathname}${destination.search}${destination.hash}`;
      if (current === next) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onPopState = () => {
      if (bypassRef.current) return;
      if (restoringHistoryRef.current) {
        restoringHistoryRef.current = false;
        return;
      }
      if (!window.confirm(message)) {
        restoringHistoryRef.current = true;
        window.history.forward();
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onDocumentClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [message, when]);

  return allowNextNavigation;
}
