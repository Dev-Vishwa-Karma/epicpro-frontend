import React from 'react';
import InputField from '../../../common/formInputs/InputField';
import Button from '../../../common/formInputs/Button';
import { getSortedEmployees } from '../../../../utils';

const TodoModal = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = {},
  errors = {},
  loading = false,
  modalId,
  employees = [],
  loggedInEmployeeRole = '',
}) => {
  const { 
    title = '', 
    due_date = '', 
    priority = '', 
    selectedEmployeeId = '' 
  } = formData;

  //state for button disabled status using ref to avoid hooks
  const buttonDisabledRef = React.useRef(false);

  const handleSubmit = (e) => {
    // If already submitted and loading, prevent double click
    if (buttonDisabledRef.current) {
      e.preventDefault();
      return;
    }
    
    // Set button as disabled
    buttonDisabledRef.current = true;
    
    // original onSubmit
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Reset button disabled state when modal closes or when loading becomes false
  React.useEffect(() => {
    if (!show || !loading) {
      buttonDisabledRef.current = false;
    }
  }, [show, loading]);

  return (
    <>
      {show && (
        <div className="modal fade show d-block" id={modalId} tabIndex={-1} role="dialog" aria-modal="true" data-backdrop="static" data-keyboard="false">
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title" id={`${modalId}Label`}>{isEdit ? 'Edit Todo' : 'Add Todo'}</h5>
                <button type="button" className="close" onClick={onClose}><span aria-hidden="true">×</span></button>
              </div>

              <div className="modal-body">
                <div className="row clearfix">
                  {/* Show dropdown only for admin and only when not in edit mode */}
                  {(loggedInEmployeeRole === 'admin' || loggedInEmployeeRole === 'super_admin') && (
                    <div className="col-md-12 col-sm-12">
                      <InputField
                        label="Select Employee"
                        name="selectedEmployeeId"
                        type="select"
                        value={selectedEmployeeId}
                        onChange={onChange}
                        error={errors.selectedEmployeeId}
                        options={[
                          { value: 'all', label: 'All Employees' },
                          // ...employees.map((emp) => ({
                            ...getSortedEmployees(employees)
                            .filter(emp => emp.status === 1)
                            .map((emp) => ({
                            value: emp.id,
                            label: `${emp.first_name} ${emp.last_name}`
                          }))
                        ]}
                      />
                    </div>
                  )}

                  <div className="col-md-12">
                    <InputField
                      label="Title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={onChange}
                      placeholder="Todo title"
                      error={errors.title}
                    />
                  </div>
                  
                  <div className="col-md-12">
                    <InputField
                      label="Due Date"
                      name="due_date"
                      type="date"
                      value={due_date}
                      onChange={onChange}
                      error={errors.due_date}
                    />
                  </div>
                  
                  <div className="col-md-12 col-sm-12">
                    <InputField
                      label="Priority"
                      name="priority"
                      type="select"
                      value={priority}
                      onChange={onChange}
                      error={errors.priority}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  label="Close"
                  onClick={onClose}
                  className="btn-secondary"
                />

                <Button
                  label={loading ? "Saving..." : "Save changes"}
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={loading || buttonDisabledRef.current}
                  loading={loading} 
                />
              </div>

            </div>
          </div>
        </div>
      )}
      {show && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default TodoModal;