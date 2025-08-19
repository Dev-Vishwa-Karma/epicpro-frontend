import React from 'react';
import Button from '../../../common/formInputs/Button';

const DuplicateDecisionModal = ({ show, duplicates = [], selected = {}, onToggleOne, onToggleAll, onUpdateSelected, onClose }) => {
  if (!show) return null;

  const allSelected = duplicates.length > 0 && duplicates.every(d => selected[d.email]);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Duplicate Applicants Found</h5>
            <button type="button" className="close" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <p className="mb-3">Select the applicants you want to update with incoming data (e.g., new DOB). You can select all at once.</p>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" checked={allSelected} onChange={e => onToggleAll && onToggleAll(e.target.checked)} />
                    </th>
                    <th>Email</th>
                    <th>Existing</th>
                    <th>Incoming</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((d, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selected[d.email]}
                          onChange={e => onToggleOne && onToggleOne(d, e.target.checked)}
                        />
                      </td>
                      <td>{d.email}</td>
                      <td>{d.existing_name || '-'}</td>
                      <td>{d.new_data?.fullname || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <Button label="Update" className="btn btn-primary" onClick={onUpdateSelected} />
            <Button label="Close" className="btn btn-secondary" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDecisionModal; 