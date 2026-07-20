import React, { useState, useEffect } from 'react';
import { getService } from '../../../../services/getService';
import Button from '../../../common/formInputs/Button';
import InputField from '../../../common/formInputs/InputField';
import ConfirmModal from '../../../common/ConfirmModal';

const ConfigModal = ({
    show,
    onClose,
    showSuccess,
    showError,
    onSaveSuccess,
    onDeleteSuccess,
    title = 'Configuration',
    serviceName = ''
}) => {
    const [serviceNameInput, setServiceNameInput] = useState(serviceName);
    // TEMPORARY: Commented out individual key/value field logic in favor of a single JSON text area.
    // const [fields, setFields] = useState([{ key: '', value: '' }]);
    const [jsonConfig, setJsonConfig] = useState('{\n\n}');
    const [isExisting, setIsExisting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (show) {
            setServiceNameInput(serviceName);
            setIsExisting(false);
            setLocalError('');
            fetchConfig();
        }
    }, [show, serviceName]);

    const showLocalError = (msg) => {
        setLocalError(msg);
        setTimeout(() => setLocalError(''), 3000);
    };

    const fetchConfig = () => {
        setLoading(true);
        const payload = { action: 'get' };
        if (serviceName) payload.provider = serviceName;

        getService.getCall('config_setting.php', payload)
            .then(data => {
                setLoading(false);
                if (data.status === 'success' && data.data) {
                    let providerDetails = {};
                    let currentProvider = '';

                    if (serviceName) {
                        currentProvider = data.data.provider;
                        providerDetails = data.data.provider_details || {};
                    }

                    if (currentProvider) {
                        setServiceNameInput(currentProvider);
                        setIsExisting(true);
                        /*
                        const fieldsArr = Object.entries(providerDetails).map(([k, v]) => ({ key: k, value: v }));
                        if (fieldsArr.length > 0) {
                            setFields(fieldsArr);
                        } else {
                            setFields([{ key: '', value: '' }]);
                        }
                        */
                        setJsonConfig(JSON.stringify(providerDetails, null, 2) || '{\n\n}');
                    } else {
                        setIsExisting(false);
                        // setFields([{ key: '', value: '' }]);
                        setJsonConfig('{\n\n}');
                    }
                } else {
                    setIsExisting(false);
                    // setFields([{ key: '', value: '' }]);
                    setJsonConfig('{\n\n}');
                }
            })
            .catch(err => {
                setLoading(false);
                console.error('Failed to fetch config:', err);
                setIsExisting(false);
                // setFields([{ key: '', value: '' }]);
                setJsonConfig('{\n\n}');
            });
    };

    /*
    // TEMPORARY: Commented out individual key/value field logic in favor of a single JSON text area.
    const handleFieldChange = (index, fieldName, val) => {
        const newFields = [...fields];
        newFields[index][fieldName] = val;
        setFields(newFields);
    };

    const addField = () => {
        setFields([...fields, { key: '', value: '' }]);
    };

    const removeField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        if (newFields.length === 0) {
            newFields.push({ key: '', value: '' });
        }
        setFields(newFields);
    };
    */

    const handleSave = async () => {
        if (!serviceNameInput) {
            showLocalError('Service Name (Cloud Name) is required');
            return;
        }

        /*
        const validFields = fields.filter(f => f.key.trim() !== '' && f.value.trim() !== '');
        if (validFields.length === 0) {
            showLocalError('Please add at least one valid key-value pair');
            return;
        }
        */

        setLocalError('');
        setLoading(true);

        try {
            let provider_details = {};
            try {
                provider_details = JSON.parse(jsonConfig);
            } catch (e) {
                setLoading(false);
                showLocalError('Invalid JSON format in Provider Details');
                return;
            }
            /*
            for (const field of validFields) {
                provider_details[field.key.trim()] = field.value.trim();
            }
            */

            const payload = {
                provider: serviceNameInput,
                provider_details: provider_details
            };

            const action = isExisting ? 'update' : 'create';
            const res = await getService.addCall('config_setting.php', action, payload);

            if (res && res.status === 'error') {
                setLoading(false);
                showLocalError(res.message || 'Failed to save configurations');
                return;
            }

            setLoading(false);
            showSuccess('Configuration saved successfully');
            if (onSaveSuccess) {
                onSaveSuccess();
            }
            onClose();
        } catch (err) {
            console.error('Error saving config:', err);
            setLoading(false);
            showLocalError('An error occurred while saving configurations');
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setShowDeleteConfirm(false);
        setLocalError('');
        setLoading(true);

        try {
            const res = await getService.addCall('config_setting.php', 'delete', { provider: serviceNameInput });

            if (res && res.status === 'error') {
                setLoading(false);
                showLocalError(res.message || 'Failed to delete configuration');
                return;
            }

            setLoading(false);
            showSuccess('Configuration deleted successfully');
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
            onClose();
        } catch (err) {
            console.error('Error deleting config:', err);
            setLoading(false);
            showLocalError('An error occurred while deleting configuration');
        }
    };

    if (!show) return null;

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="close" aria-label="Close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {localError && <div className="alert alert-danger mb-3 p-2">{localError}</div>}
                            {loading && <div className="text-center mb-3">Loading...</div>}
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <InputField
                                        label="Provider Name"
                                        name="serviceNameInput"
                                        type="text"
                                        value={serviceNameInput}
                                        onChange={e => setServiceNameInput(e.target.value)}
                                        placeholder="Enter Service Name"
                                        disabled={loading || (serviceName !== '')}
                                    />
                                </div>
                            </div>

                            <label className="form-label font-weight-bold mt-2">Provider Details</label>
                            {/* TEMPORARY: Commented out individual key/value field logic in favor of a single JSON text area.
                            <div style={{ maxHeight: '280px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '5px' }}>
                                {fields.map((field, index) => (
                                    <div key={index} className="row clearfix mb-1">
                                        <div className="col-md-5">
                                            <InputField
                                                name={`key_${index}`}
                                                type="text"
                                                placeholder="Key (e.g. API_KEY)"
                                                value={field.key}
                                                onChange={e => handleFieldChange(index, 'key', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <InputField
                                                name={`value_${index}`}
                                                type="text"
                                                placeholder="Value"
                                                value={field.value}
                                                onChange={e => handleFieldChange(index, 'value', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100"
                                                onClick={() => removeField(index)}
                                                disabled={loading}
                                                title="Remove Field"
                                            >
                                                <i className="icon-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="row clearfix mt-2">
                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={addField}
                                        disabled={loading}
                                    >
                                        <i className="icon-plus"></i> Add Field
                                    </button>
                                </div>
                            </div>
                            */}
                            <div className="row clearfix mb-1">
                                <div className="col-md-12">
                                    <InputField
                                        type="textarea"
                                        name="providerDetails"
                                        value={jsonConfig}
                                        onChange={e => setJsonConfig(e.target.value)}
                                        placeholder="{\n}"
                                        disabled={loading}
                                        rows={8}
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                {isExisting && (
                                    <Button
                                        label={loading ? 'Deleting...' : 'Delete'}
                                        onClick={handleDeleteClick}
                                        className="btn-danger"
                                        disabled={loading}
                                    />
                                )}
                            </div>
                            <div>
                                <Button label={loading ? (isExisting ? 'Updating...' : 'Saving...') : (isExisting ? 'Update' : 'Save')} onClick={handleSave} className="btn-primary" disabled={loading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={showDeleteConfirm}
                title="Delete Configuration"
                message={`Are you sure you want to delete configuration for ${serviceNameInput}?`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonClass="btn-danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};

export default ConfigModal;
