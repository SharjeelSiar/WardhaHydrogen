import {useEffect, useRef, type ReactNode} from 'react';
export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`ws-dialog ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="ws-dialog-content">
        <div className="ws-dialog-heading">
          <span>{title}</span>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
