import React from 'react';
import Button from '../../../common/formInputs/Button';

const Row = ({ label, value }) => (
  <div className="row mb-2">
    <div className="col-sm-3 text-muted" style={{ fontSize: 13 }}>{label}</div>
    <div className="col-sm-9" style={{ fontSize: 14 }}>{value ?? '-'}</div>
  </div>
);

const SyncedApplicantViewModal = ({ show, data, onClose }) => {
  if (!show || !data) return null;
  const address = [data.street, data.city, data.state, data.zip].filter(Boolean).join(', ');

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Synced Applicant Details</h5>
            <button type="button" className="close" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-6">
                  <Row label="Name" value={data.name} />
                  <Row label="Email" value={data.email} />
                  <Row label="Phone" value={data.phone} />
                  <Row label="Address" value={address} />
                  <Row label="Birth Date" value={data.birth_date} />
                  <Row label="Gender" value={data.gender} />
                  <Row label="Marital Status" value={data.marital_status} />
                </div>
                <div className="col-md-6">
                  <Row label="Emergency Contact Name" value={data.emergency_contact_name} />
                  <Row label="Emergency Contact Phone" value={data.emergency_contact_phone} />
                  <Row label="Emergency Contact Relationship" value={data.emergency_contact_relationship} />
                  <Row label="Education" value={data.education} />
                </div>
              </div>

              <div className="mt-4">
                <h6>Interview Results</h6>
                {Array.isArray(data.interview_results) && data.interview_results.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.interview_results.map((q, idx) => (
                          <tr key={idx}>
                            <td>{q.title}</td>
                            <td>{q.question_type}</td>
                            <td>{q.description || '-'}</td>
                            <td>{Array.isArray(q.submitted_answers) ? q.submitted_answers.join(', ') : (q.submitted_answers ?? '-')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">No interview results.</div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button label="Close" className="btn btn-secondary" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncedApplicantViewModal; 