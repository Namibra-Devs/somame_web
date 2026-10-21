import { createPortal } from 'react-dom';
import { Utensils } from 'lucide-react';

/**
 * Gmail / Google Material 3 inspired confirmation dialog
 * Matches the clean, spacious, borderless 28px-radius modal aesthetic.
 */
const ConfirmModal = ({
  open,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  itemPreview = null, // Optional: { imageUrl, name, subtext }
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

        <div className="modal-body" style={{ paddingTop: '0.25rem', paddingBottom: '1.25rem', gap: '1rem' }}>
          {itemPreview && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {itemPreview.imageUrl ? (
                  <img
                    src={itemPreview.imageUrl}
                    alt={itemPreview.name || 'Item'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Utensils size={20} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: '0.975rem',
                    color: 'var(--text-main)'
                  }}
                >
                  {itemPreview.name}
                </div>
                {itemPreview.subtext && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-vendor)',
                      marginTop: '0.125rem'
                    }}
                  >
                    {itemPreview.subtext}
                  </div>
                )}
              </div>
            </div>
          )}

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
