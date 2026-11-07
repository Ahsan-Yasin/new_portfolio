'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useAdmin, useStore } from './store';
import { Button, spring, useMediaQuery } from './ui';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** The sheet needs an answer, so the backdrop and Esc don't dismiss it. */
  persistent?: boolean;
  wide?: boolean;
};

/** A native modal dialog: it brings focus trapping, Esc and an inert page behind it. */
export function Sheet({ open, ...props }: SheetProps) {
  return <AnimatePresence>{open ? <SheetDialog {...props} /> : null}</AnimatePresence>;
}

function SheetDialog({ onClose, title, description, children, footer, persistent, wide }: Omit<SheetProps, 'open'>) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isPhone = useMediaQuery('(max-width: 760px)');

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const offscreen = isPhone ? { y: '100%' } : { y: 28, opacity: 0 };

  return (
    <dialog
      ref={ref}
      className="a-sheet-root"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!persistent) onClose();
      }}
    >
      <motion.div
        className="a-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={spring}
        onClick={() => {
          if (!persistent) onClose();
        }}
      />
      <motion.div
        className={`a-sheet${wide ? ' is-wide' : ''}`}
        initial={offscreen}
        animate={{ y: 0, opacity: 1 }}
        exit={offscreen}
        transition={spring}
      >
        <div className="a-sheet-head">
          <h2 id={titleId}>{title}</h2>
          {description ? <div className="a-sheet-description">{description}</div> : null}
        </div>
        {children ? <div className="a-sheet-body">{children}</div> : null}
        {footer ? <div className="a-sheet-footer">{footer}</div> : null}
      </motion.div>
    </dialog>
  );
}

/** Answers store.confirm(). */
export function ConfirmHost() {
  const store = useStore();
  const request = useAdmin((state) => state.confirm);
  return (
    <Sheet
      open={request !== null}
      onClose={() => store.resolveConfirm(false)}
      title={request?.title ?? ''}
      description={request?.message}
      footer={
        <>
          <Button onClick={() => store.resolveConfirm(false)}>Cancel</Button>
          <Button variant={request?.destructive ? 'danger' : 'tint'} onClick={() => store.resolveConfirm(true)}>
            {request?.confirmLabel}
          </Button>
        </>
      }
    />
  );
}

export function ToastHost() {
  const store = useStore();
  const toasts = useAdmin((state) => state.toasts);
  return (
    <div className="a-toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout="position"
            className={`a-toast${toast.tone === 'error' ? ' is-error' : ''}`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={spring}
          >
            <span>{toast.message}</span>
            {toast.undo ? (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  store.dismissToast(toast.id);
                }}
              >
                Undo
              </button>
            ) : null}
            {toast.link ? (
              <a href={toast.link.href} target="_blank" rel="noreferrer">
                {toast.link.label}
              </a>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
