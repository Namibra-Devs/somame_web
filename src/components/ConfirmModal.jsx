import { createPortal } from 'react-dom';

/**
 * Gmail / Google Material 3 inspired confirmation dialog
 * Matches the clean, spacious, borderless 28px-radius modal aesthetic.
 */
const ConfirmModal = ({
  open,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger'
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-panel modal-panel-sm"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0.25rem 0' }}
      >
        <div className="modal-header" style={{ paddingBottom: '0.5rem' }}>
          <h3>{title}</h3>
        </div>

        <div className="modal-body" style={{ paddingTop: '0.25rem', paddingBottom: '1.25rem' }}>
          <p style={{ margin: 0, color: '#444746', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ paddingTop: '0.25rem' }}>
          <button type="button" className="btn-text-pill" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={variant === 'danger' ? 'btn-danger-pill' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
