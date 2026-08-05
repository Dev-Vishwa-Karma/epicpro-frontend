import React, { useState, useRef } from 'react';
import api from '../../../api/axios';
import authService from '../../Authentication/authService';
import cryptoService from '../../../services/cryptoService';
import InputField from '../../common/formInputs/InputField';
import Button from '../../common/formInputs/Button';
import './E2EESetupModal.css';

const E2EESetupModal = ({ isOpen, onClose, onSuccess, mode = 'generate', backupData = null }) => {
  const [password, setPassword] = useState('');
  const [backupPin, setBackupPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupPin, setShowBackupPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  const pinRefs = useRef([]);

  const handlePasswordChange = (e) => {
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
    if (serverError) setServerError(null);
    setPassword(e.target.value);
  };

  const handleBoxChange = (val, idx) => {
    if (fieldErrors.pin) setFieldErrors((prev) => ({ ...prev, pin: null }));
    if (serverError) setServerError(null);
    const digit = val.replace(/\D/g, '').slice(-1);
    const pinArr = backupPin.split('');
    pinArr[idx] = digit || '';
    const updatedPin = pinArr.join('');
    setBackupPin(updatedPin);

    if (digit && idx < 3 && pinRefs.current[idx + 1]) {
      pinRefs.current[idx + 1].focus();
    }
  };

  const handleBoxKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (fieldErrors.pin) setFieldErrors((prev) => ({ ...prev, pin: null }));
      if (serverError) setServerError(null);
      if (!backupPin[idx] && idx > 0 && pinRefs.current[idx - 1]) {
        const pinArr = backupPin.split('');
        pinArr[idx - 1] = '';
        setBackupPin(pinArr.join(''));
        pinRefs.current[idx - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0 && pinRefs.current[idx - 1]) {
      pinRefs.current[idx - 1].focus();
    } else if (e.key === 'ArrowRight' && idx < 3 && pinRefs.current[idx + 1]) {
      pinRefs.current[idx + 1].focus();
    }
  };

  const handleBoxPaste = (e) => {
    e.preventDefault();
    if (fieldErrors.pin) setFieldErrors((prev) => ({ ...prev, pin: null }));
    if (serverError) setServerError(null);
    const pastedData = e.clipboardData.getData('text');
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 4);
    setBackupPin(digitsOnly);
    if (digitsOnly.length > 0) {
      const focusIndex = Math.min(digitsOnly.length, 3);
      if (pinRefs.current[focusIndex]) {
        pinRefs.current[focusIndex].focus();
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (mode === 'generate' && !password) {
      errors.password = 'Please enter your account password.';
    }
    if (!backupPin) {
      errors.pin = 'Please enter a Backup PIN.';
    } else if (!/^\d{4}$/.test(backupPin)) {
      errors.pin = 'Backup PIN must be exactly 4 integer digits.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setServerError(null);
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error('User session not found. Please log in again.');
      }

      if (mode === 'generate') {
        const formData = new FormData();
        formData.append('password', password);

        const verifyRes = await api.post('/get_employees.php?action=verify-password', formData);

        if (verifyRes.data?.status !== 'success') {
          throw new Error(verifyRes.data?.message || 'Password verification failed.');
        }

        const keyPair = await cryptoService.generateKeyPair();
        const backup = await cryptoService.encryptPrivateKeyForBackup(keyPair.privateKeyPEM, backupPin);

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

        await cryptoService.savePrivateKey(user.id, keyPair.privateKeyPEM);

        const updatedUser = { ...user, public_key: keyPair.publicKeyPEM };
        authService.setUser(updatedUser);

        setSuccess(true);
        window.dispatchEvent(new CustomEvent('e2eeKeysUpdated', { detail: { publicKey: keyPair.publicKeyPEM } }));
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

        const privateKeyPEM = await cryptoService.decryptPrivateKeyFromBackup(
          backupBlob,
          backupSalt,
          backupIv,
          backupPin
        );

        await cryptoService.savePrivateKey(user.id, privateKeyPEM);

        setSuccess(true);
        window.dispatchEvent(new CustomEvent('e2eeKeysUpdated', { detail: { publicKey: user.public_key } }));
        setTimeout(() => {
          if (onSuccess) onSuccess(user.public_key);
          if (onClose) onClose();
        }, 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setServerError(msg);
      const newFieldErrors = {};
      if (msg.toLowerCase().includes('password')) newFieldErrors.password = msg;
      if (msg.toLowerCase().includes('pin')) newFieldErrors.pin = msg;
      if (Object.keys(newFieldErrors).length > 0) setFieldErrors(newFieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="e2ee-modal-backdrop">
      <div className="e2ee-modal-card">
        <div className="e2ee-modal-header">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              border: 'none',
              background: 'transparent',
              fontSize: '20px',
              color: '#64748b',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1
            }}
          >
            <i className="fe fe-x" />
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

        {serverError && (
          <div className="e2ee-alert-error">
            <i className="fe fe-alert-triangle" />
            <span>{serverError}</span>
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
            <div className="e2ee-form-group position-relative mb-4">
              <InputField
                label="Account Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your account password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading || success}
                inputClassName="form-control-sm e2ee-input"
                error={fieldErrors.password}
              />
              <Button
                type="button"
                className="e2ee-toggle-visibility border-0 p-0 bg-transparent shadow-none"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading || success}
                icon={`fe ${showPassword ? 'fe-eye-off' : 'fe-eye'}`}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '12px', top: '36px', zIndex: 5 }}
              />
            </div>
          )}

          <div className="e2ee-form-group mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="e2ee-label mb-0" title="Please remember your Backup PIN. It is required to restore your end-to-end encrypted discussions. If you forget this PIN, your encrypted backup cannot be recovered.">
                {mode === 'generate' ? 'Create Backup PIN (4 Digits)' : 'Enter Backup PIN (4 Digits)'}
              </label>
              <Button
                type="button"
                className="btn-sm border-0 p-0 bg-transparent shadow-none text-muted"
                onClick={() => setShowBackupPin((prev) => !prev)}
                disabled={loading || success}
                icon={`fe ${showBackupPin ? 'fe-eye-off' : 'fe-eye'} mr-1`}
                label={showBackupPin ? 'Hide PIN' : 'Show PIN'}
                style={{ fontSize: '12px', fontWeight: '500' }}
              />
            </div>

            <div className="pin-boxes-wrapper">
              {Array.from({ length: 4 }).map((_, idx) => {
                const digit = backupPin[idx] || '';
                return (
                  <input
                    key={idx}
                    ref={(el) => (pinRefs.current[idx] = el)}
                    type={showBackupPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleBoxChange(e.target.value, idx)}
                    onKeyDown={(e) => handleBoxKeyDown(e, idx)}
                    onPaste={handleBoxPaste}
                    disabled={loading || success}
                    className={`pin-box-single ${digit ? 'is-filled' : ''} ${fieldErrors.pin ? 'is-invalid' : ''}`}
                    autoFocus={mode === 'restore' && idx === 0}
                  />
                );
              })}
            </div>

            {fieldErrors.pin && (
              <div className="text-danger text-center small mt-2">
                <i className="fe fe-alert-circle mr-1" />
                {fieldErrors.pin}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="e2ee-btn-primary w-100"
            disabled={loading || success}
            loading={loading}
            icon={mode === 'generate' ? 'fe fe-key mr-2' : 'fe fe-unlock mr-2'}
            label={mode === 'generate' ? (loading ? 'Generating Keys...' : 'Generate Keys') : (loading ? 'Restoring Keys...' : 'Restore Keys')}
          />
        </form>
      </div>
    </div>
  );
};

export default E2EESetupModal;
