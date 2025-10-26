import React, { useState } from 'react';
import styles from './CopyButton.module.css';

const CopyButton = ({ text, label = 'text', className = '', timeout = 2000 }) => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    if (!text || copied || isLoading) return;

    setIsLoading(true);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Auto-reset after timeout
      setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (error) {
      console.error('Failed to copy text:', error);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, timeout);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        // Could show a toast notification here
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text || isLoading}
      className={`${styles.copyButton} ${className} ${copied ? styles.copied : ''}`}
      title={copied ? 'Copied!' : `Copy ${label}`}
    >
      {isLoading ? (
        <span className={styles.spinner} />
      ) : copied ? (
        <span className={styles.checkmark}>✓</span>
      ) : (
        <span className={styles.copyIcon}>📋</span>
      )}
      <span className={styles.buttonText}>
        {isLoading ? 'Copying...' : copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  );
};

export default CopyButton;
