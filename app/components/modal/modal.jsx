
// app/components/modal/modal.jsx
import React from 'react';
// 1. Import the styles object
import styles from './modal.module.css';

function Modal({ children, onClose, showCloseButton = true }) {
    return (
        // 2. Access classes via styles['className'] or styles.className
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {children}
                {showCloseButton && (
                    <button className={styles.modalCloseButton} onClick={onClose}>
                        닫기
                    </button>
                )}
            </div>
        </div>
    );
}

export default Modal;