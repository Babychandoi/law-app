import React, { useCallback, useRef, useState } from 'react';
import ConfirmDialog, { ConfirmDialogProps } from './ConfirmDialog';

type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel' | 'loading'>;

/**
 * Hook xác nhận dạng promise, thay cho window.confirm:
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   ...
 *   if (await confirm({ message: 'Xoá mục này?', variant: 'danger' })) { ... }
 *   return (<>{confirmDialog}{...}</>);
 */
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; opts: ConfirmOptions | null }>({
    open: false,
    opts: null,
  });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setState({ open: true, opts });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState({ open: false, opts: null });
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={state.open}
      message={state.opts?.message ?? ''}
      title={state.opts?.title}
      confirmText={state.opts?.confirmText}
      cancelText={state.opts?.cancelText}
      variant={state.opts?.variant}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, confirmDialog };
}

export default useConfirm;
