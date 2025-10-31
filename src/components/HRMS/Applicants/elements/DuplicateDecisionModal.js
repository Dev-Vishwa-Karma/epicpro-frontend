import React from 'react';
import Button from '../../../common/formInputs/Button';
import { shortformatDate } from '../../../../utils';

const DuplicateDecisionModal = ({ show, duplicates = [], selected = {}, onToggleOne, onToggleAll, onUpdateSelected, onClose }) => {
  if (!show) return null;

  const allSelected = duplicates.length > 0 && duplicates.every(d => selected[d.email]);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
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
                    <th>ID & Email</th>
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
                      <td>{d.existing_id} - {d.email}</td>
                      <td>
                        <p><b>Name:&nbsp;</b> {d.existing_name || '-'}</p>
                        <p><b>Email:&nbsp;</b> {d.existing_email || '-'}</p>
                        <p><b>Phone:&nbsp;</b> {d.existing_phone || '-'}</p>
                        <p><b>DOB:&nbsp;</b> {shortformatDate(d.existing_dob || '-')}</p>
                        <p><b>Address:&nbsp;</b> {d.existing_address || '-'}</p>
                        <p><b>Experience:&nbsp;</b> {d.existing_experience || '-'}</p>
                        <p style={{ width: 350 }}><b>Resume:&nbsp;</b>
                        {d.new_data?.resume_path
                            ? d.existing_resume_path.length > 30
                              ? d.existing_resume_path.substring(0, 30) + "....."
                              : d.existing_resume_path
                            : '-'}</p>
                        <p><b>Graduate Year:&nbsp;</b> {d.existing_graduate_year || '-'}</p>
                        <p><b>Alt. Phone:&nbsp;</b> {d.existing_alternate_phone || '-'}</p>
                      </td>
                      <td>
                        <p>{d.new_data?.fullname || '-'}</p>
                        <p>{d.new_data?.email || '-'}</p>
                        <p>{d.new_data?.phone || '-'}</p>
                        <p>{shortformatDate(d.new_data?.dob || '-')}</p>
                        <p>{d.new_data?.address || '-'}</p>
                        <p>{d.new_data?.experience || '-'}</p>
                        <p>
                          {d.new_data?.resume_path
                            ? d.new_data.resume_path.length > 30
                              ? d.new_data.resume_path.substring(0, 30) + "....."
                              : d.new_data.resume_path
                            : '-'}
                        </p>
                        <p>{d.new_data?.graduate_year || '-'}</p>
                        <p>{d.new_data?.alternate_phone || '-'}</p>
                      </td>
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