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
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [cloudName, setCloudName] = useState('');
    const [isExisting, setIsExisting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [localSuccess, setLocalSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            setServiceNameInput(serviceName);
            setIsExisting(false);
            setLocalError('');
            setLocalSuccess('');
            setErrors({});
            fetchConfig();
        }
    }, [show, serviceName]);

    const showLocalError = (msg) => {
        setLocalError(msg);
        setTimeout(() => setLocalError(''), 3000);
    };

    const showLocalSuccess = (msg) => {
        setLocalSuccess(msg);
        setTimeout(() => setLocalSuccess(''), 3000);
    };

    const fetchConfig = () => {
        setLoading(true);
        const payload = { action: 'get' };
        if (serviceName) payload.service = serviceName;

        getService.getCall('config_setting.php', payload)
            .then(data => {
                setLoading(false);
                if (data.status === 'success' && data.data) {
                    let serviceDetails = {};
                    let currentProvider = '';

                    if (serviceName) {
                        currentProvider = data.data.service;
                        serviceDetails = data.data.service_details || {};
                    }

                    if (currentProvider) {
                        setServiceNameInput(currentProvider);
                        setIsExisting(true);
                        /*
                        const fieldsArr = Object.entries(serviceDetails).map(([k, v]) => ({ key: k, value: v }));
                        if (fieldsArr.length > 0) {
                            setFields(fieldsArr);
                        } else {
                            setFields([{ key: '', value: '' }]);
                        }
                        */
                        setApiKey(serviceDetails.api_key || '');
                        setApiSecret(serviceDetails.api_secret || '');
                        setCloudName(serviceDetails.cloud_name || '');
                    } else {
                        setIsExisting(false);
                        // setFields([{ key: '', value: '' }]);
                        setApiKey('');
                        setApiSecret('');
                        setCloudName('');
                    }
                } else {
                    setIsExisting(false);
                    // setFields([{ key: '', value: '' }]);
                    setApiKey('');
                    setApiSecret('');
                    setCloudName('');
                }
            })
            .catch(err => {
                setLoading(false);
                console.error('Failed to fetch config:', err);
                setIsExisting(false);
                // setFields([{ key: '', value: '' }]);
                setApiKey('');
                setApiSecret('');
                setCloudName('');
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
        let formErrors = {};
        if (!serviceNameInput) formErrors.serviceNameInput = 'Service Name (Cloud Name) is required';
        if (!apiKey) formErrors.apiKey = 'API Key is required';
        if (!apiSecret) formErrors.apiSecret = 'API Secret is required';
        if (!cloudName) formErrors.cloudName = 'Cloud Name is required';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        /*
        const validFields = fields.filter(f => f.key.trim() !== '' && f.value.trim() !== '');
        if (validFields.length === 0) {
            showLocalError('Please add at least one valid key-value pair');
            return;
        }
        */

        setErrors({});
        setLocalError('');
        setLoading(true);

        try {
            let service_details = {
                api_key: apiKey,
                api_secret: apiSecret,
                cloud_name: cloudName
            };
            /*
            for (const field of validFields) {
                service_details[field.key.trim()] = field.value.trim();
            }
            */

            const payload = {
                service: serviceNameInput,
                service_details: service_details
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
            showLocalSuccess('Configuration saved successfully');
            if (onSaveSuccess) {
                onSaveSuccess();
            }
            // onClose();
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
            const res = await getService.addCall('config_setting.php', 'delete', { service: serviceNameInput });

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
                            {localSuccess && <div className="alert alert-success mb-3 p-2">{localSuccess}</div>}
                            {loading && <div className="text-center mb-3">Loading...</div>}
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <InputField
                                        label="Service Name"
                                        name="serviceNameInput"
                                        type="text"
                                        value={serviceNameInput}
                                        onChange={e => {
                                            setServiceNameInput(e.target.value);
                                            if (errors.serviceNameInput) setErrors(prev => ({ ...prev, serviceNameInput: '' }));
                                        }}
                                        placeholder="Enter Service Name"
                                        disabled={loading || (serviceName !== '')}
                                        error={errors.serviceNameInput}
                                    />
                                </div>
                            </div>

                            <label className="form-label font-weight-bold mt-2">Service Details</label>
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
                                        label="API Key"
                                        name="apiKey"
                                        type="text"
                                        value={apiKey}
                                        onChange={e => {
                                            setApiKey(e.target.value);
                                            if (errors.apiKey) setErrors(prev => ({ ...prev, apiKey: '' }));
                                        }}
                                        placeholder="Enter API Key"
                                        disabled={loading}
                                        error={errors.apiKey}
                                    />
                                </div>
                            </div>
                            <div className="row clearfix mb-1">
                                <div className="col-md-12">
                                    <InputField
                                        label="API Secret"
                                        name="apiSecret"
                                        type="text"
                                        value={apiSecret}
                                        onChange={e => {
                                            setApiSecret(e.target.value);
                                            if (errors.apiSecret) setErrors(prev => ({ ...prev, apiSecret: '' }));
                                        }}
                                        placeholder="Enter API Secret"
                                        disabled={loading}
                                        error={errors.apiSecret}
                                    />
                                </div>
                            </div>
                            <div className="row clearfix mb-1">
                                <div className="col-md-12">
                                    <InputField
                                        label="Cloud Name"
                                        name="cloudName"
                                        type="text"
                                        value={cloudName}
                                        onChange={e => {
                                            setCloudName(e.target.value);
                                            if (errors.cloudName) setErrors(prev => ({ ...prev, cloudName: '' }));
                                        }}
                                        placeholder="Enter Cloud Name"
                                        disabled={loading}
                                        error={errors.cloudName}
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
