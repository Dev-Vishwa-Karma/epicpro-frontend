import React, { useState } from 'react';
import api from '../../../api/axios';
import authService from '../../Authentication/authService';
import cryptoService from '../../../services/cryptoService';
import './E2EESetupModal.css';

const E2EESetupModal = ({ isOpen, onClose, onSuccess, mode = 'generate', backupData = null }) => {
  const [password, setPassword] = useState('');
  const [backupPin, setBackupPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupPin, setShowBackupPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleMaskedChange = (e, currentValue, setValue, isVisible) => {
    if (error) setError(null);
    const val = e.target.value;
    if (isVisible) {
      setValue(val);
      return;
    }

    const isPureStars = val === '*'.repeat(val.length);
    const currentLen = currentValue.length;
    const newLen = val.length;

    if (val === '') {
      setValue('');
    } else if (isPureStars) {
      if (newLen < currentLen) {
        setValue(currentValue.slice(0, newLen));
      } else if (newLen > currentLen) {
        setValue(currentValue + '*'.repeat(newLen - currentLen));
      }
    } else {
      if (newLen > currentLen) {
        const added = val.slice(currentLen);
        setValue(currentValue + added);
      } else {
        const cleaned = val.replace(/\*/g, '');
        setValue(cleaned);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'generate' && !password) {
      setError('Please enter your account password.');
      return;
    }
    if (!backupPin) {
      setError('Please enter a Backup PIN.');
      return;
    }

    // Show warning if using weak backup PIN (less than 6 digits)
    if (backupPin.length < 4 || backupPin.length > 6) {
      setError('Backup PIN must be 4 to 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error('User session not found. Please log in again.');
      }

      if (mode === 'generate') {
        // Step 1: Verify Password with backend
        const formData = new FormData();
        formData.append('password', password);

        const verifyRes = await api.post('/get_employees.php?action=verify-password', formData);

        if (verifyRes.data?.status !== 'success') {
          throw new Error(verifyRes.data?.message || 'Password verification failed.');
        }

        // Generate Web Crypto RSA-OAEP 2048 Key Pair
        const keyPair = await cryptoService.generateKeyPair();

        // Encrypt Private Key for Backup
        const backup = await cryptoService.encryptPrivateKeyForBackup(keyPair.privateKeyPEM, backupPin);

        // Upload Public Key and Backup JSON to Backend
        const backupJson = JSON.stringify({
          iv: backup.iv,
          salt: backup.salt,
          blob: backup.encryptedBlob
        });

        const updateKeyData = new FormData();
        updateKeyData.append('public_key', keyPair.publicKeyPEM);
        updateKeyData.append('encrypted_blob', backupJson);

        const uploadRes = await api.post('/get_employees.php?action=update-public-key', updateKeyData);

        if (uploadRes.data?.status !== 'success') {
          throw new Error(uploadRes.data?.message || 'Failed to upload keys to server.');
        }

        // Store Private Key in Local IndexedDB
        await cryptoService.savePrivateKey(user.id, keyPair.privateKeyPEM);

        // Update Local User State
        const updatedUser = { ...user, public_key: keyPair.publicKeyPEM };
        authService.setUser(updatedUser);

        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(keyPair.publicKeyPEM);
          if (onClose) onClose();
        }, 1000);

      } else if (mode === 'restore') {
        const backupJson = JSON.parse(backupData?.encryptedBlob);
        const backupBlob = backupJson?.blob;
        const backupSalt = backupJson?.salt;
        const backupIv = backupJson?.iv;
        if (!backupData || !backupBlob || !backupSalt || !backupIv) {
          throw new Error('Backup data is missing or corrupted.');
        }

        // Decrypt the backup blob
        const privateKeyPEM = await cryptoService.decryptPrivateKeyFromBackup(
          backupBlob,
          backupSalt,
          backupIv,
          backupPin
        );

        // Store in Local IndexedDB
        await cryptoService.savePrivateKey(user.id, privateKeyPEM);

        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(user.public_key);
          if (onClose) onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordInvalid = Boolean(
    error && (error.toLowerCase().includes('password') || (!password && mode === 'generate'))
  );
  const isPinInvalid = Boolean(
    error && (error.toLowerCase().includes('pin') || !backupPin || backupPin.length < 4 || backupPin.length > 6)
  );

  return (
    <div className="e2ee-modal-backdrop">
      <div className="e2ee-modal-card">
        <div className="e2ee-modal-header">
          <button type="button" className="close" onClick={onClose} aria-label="Close">
          </button>
          <div className="e2ee-modal-icon">
            <i className="fe fe-lock" />
          </div>
          <h3 className="e2ee-modal-title">
            {mode === 'generate' ? 'End-to-End Encryption Setup' : 'Restore Encryption Keys'}
          </h3>
          <p className="e2ee-modal-description">
            {mode === 'generate'
              ? 'To protect your discussions, encryption keys must be created. Please set a Backup PIN to recover your keys later.'
              : 'Your encryption keys are missing on this device. Please enter your Backup PIN to restore them.'}
          </p>
        </div>

        {error && (
          <div className="e2ee-alert-error">
            <i className="fe fe-alert-triangle" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="e2ee-alert-success">
            <i className="fe fe-check-circle" />
            <span>
              {mode === 'generate' ? 'Encryption keys generated & saved successfully!' : 'Encryption keys restored successfully!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="e2ee-modal-body">
          {mode === 'generate' && (
            <div className="e2ee-form-group">
              <label className="e2ee-label">Account Password</label>
              <div className="e2ee-input-wrapper">
                <input
                  type="text"
                  className={`form-control form-control-sm e2ee-input ${!showPassword && password ? 'is-masked' : ''} ${isPasswordInvalid ? 'is-invalid' : ''}`}
                  placeholder="Enter your account password"
                  value={showPassword ? password : '*'.repeat(password.length)}
                  onChange={(e) => handleMaskedChange(e, password, setPassword, showPassword)}
                  disabled={loading || success}
                  autoFocus={mode === 'generate'}
                />
                <button
                  type="button"
                  className="e2ee-toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading || success}
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fe ${showPassword ? 'fe-eye-off' : 'fe-eye'}`} />
                </button>
              </div>
            </div>
          )}

          <div className="e2ee-form-group">
            <label className="e2ee-label" title='Please remember your Backup PIN. It is required to restore your end-to-end encrypted discussions. If you forget this PIN, your encrypted backup cannot be recovered'>{mode === 'generate' ? 'Create Backup PIN' : 'Enter Backup PIN'}</label>
            <div className="e2ee-input-wrapper">
              <input
                type="text"
                title='Please remember your Backup PIN. It is required to restore your end-to-end encrypted discussions. If you forget this PIN, your encrypted backup cannot be recovered.'
                className={`form-control form-control-sm e2ee-input ${!showBackupPin && backupPin ? 'is-masked' : ''} ${isPinInvalid ? 'is-invalid' : ''}`}
                placeholder="e.g. 123456"
                value={showBackupPin ? backupPin : '*'.repeat(backupPin.length)}
                onChange={(e) => handleMaskedChange(e, backupPin, setBackupPin, showBackupPin)}
                disabled={loading || success}
                autoFocus={mode === 'restore'}
              />
              <button
                type="button"
                className="e2ee-toggle-visibility"
                onClick={() => setShowBackupPin((prev) => !prev)}
                disabled={loading || success}
                tabIndex="-1"
                aria-label={showBackupPin ? 'Hide PIN' : 'Show PIN'}
              >
                <i className={`fe ${showBackupPin ? 'fe-eye-off' : 'fe-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="e2ee-btn-primary"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <div className="e2ee-spinner" />
                <span>{mode === 'generate' ? 'Generating Keys...' : 'Restoring Keys...'}</span>
              </>
            ) : (
              <>
                <i className={mode === 'generate' ? 'fe fe-key' : 'fe fe-unlock'} />
                <span>{mode === 'generate' ? 'Generate Keys' : 'Restore Keys'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default E2EESetupModal;

