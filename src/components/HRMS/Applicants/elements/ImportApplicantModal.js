import React, { Component } from 'react';
import * as XLSX from 'xlsx';
import Button from '../../../common/formInputs/Button';
import { getService } from '../../../../services/getService';

const SYSTEM_FIELDS = [
  { key: 'fullname', label: 'Full Name', required: true, discription: 'Full name of the applicant' },
  { key: 'email', label: 'Email Address', required: false, badge: 'Email or Phone Required', discription: 'Email address of the applicant' },
  { key: 'phone', label: 'Phone Number', required: false, badge: 'Email or Phone Required', discription: 'Phone number of the applicant' },
  { key: 'alternate_phone', label: 'Alternate Phone', required: false, discription: 'Alternate phone number of the applicant' },
  { key: 'position', label: 'Position', required: false, discription: 'Position of the applicant (saved in note)' },
  { key: 'experience', label: 'Experience (Years)', required: false, discription: 'Experience of the applicant' },
  { key: 'graduate_year', label: 'Graduation Year', required: false, discription: 'Graduation / Passout year of the applicant' },
  { key: 'location', label: 'Permanent Location', required: false, discription: 'Permanent location of the applicant' },
  { key: 'ctc', label: 'Expected CTC (₹)', required: false, discription: 'Expected CTC of the applicant (saved in note)' },
  { key: 'joining_timeframe', label: 'Notice Period', required: false, discription: 'Notice period of the applicant' },
  { key: 'resume_path', label: 'Resume Path', required: false, discription: 'Path of the resume' },
  { key: 'applied_date', label: 'Applied Date (YYYY-MM-DD)', required: false, discription: 'Applied date of the applicant' },
  { key: 'interview_date', label: 'Interview Date (YYYY-MM-DD)', required: false, discription: 'Interview date of the applicant (saved in note)' },
  { key: 'interview_time', label: 'Interview Time', required: false, discription: 'Interview time of the applicant (saved in note)' },
  { key: 'status', label: 'Status', required: false, discription: 'Status of the applicant' },
  { key: 'followup1', label: 'Follow-up 1', required: false, discription: 'First follow-up response (saved in note)' },
  { key: 'followup2', label: 'Follow-up 2', required: false, discription: 'Second follow-up response (saved in note)' },
  { key: 'remark', label: 'Remark', required: false, discription: 'General remarks (saved in note)' },
  { key: 'aptitude_marks', label: 'Aptitude Test Marks', required: false, discription: 'Aptitude test score/marks (saved in note)' },
  { key: 'test_review', label: 'Test Review', required: false, discription: 'Technical test review (saved in note)' },
  { key: 'machine_test', label: 'Machine Test', required: false, discription: 'Machine test info / submission (saved in note)' },
  { key: 'final_round', label: 'Final Round', required: false, discription: 'Final round date/info (saved in note)' },
  { key: 'outcome', label: 'Outcome', required: false, discription: 'Final interview outcome (saved in note)' },
  { key: 'final_remark', label: 'Final Remark', required: false, discription: 'Final decision remarks (saved in note)' },
  { key: 'note', label: 'Note', required: false, discription: 'Any extra notes or comments' }
];

class ImportApplicantModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      file: null,
      fileName: '',
      workbook: null,
      sheetNames: [],
      selectedSheet: '',
      headers: [],
      rawData: [],
      fieldMapping: {},
      isSubmitting: false,
      importResult: null,
      errorMessage: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      currentStep: 1,
      file: null,
      fileName: '',
      workbook: null,
      sheetNames: [],
      selectedSheet: '',
      headers: [],
      rawData: [],
      fieldMapping: {},
      isSubmitting: false,
      importResult: null,
      errorMessage: ''
    });
  };

  normalizeText = (value) => {
    return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  };

  getFieldAliases = (field) => {
    const aliases = {
      fullname: ['fullname', 'full name', 'full_name', 'name', 'candidate name', 'applicant name', 'customer name'],
      email: ['email', 'email address', 'email_address', 'e-mail', 'mail'],
      phone: ['phone', 'phone number', 'phone_number', 'mobile', 'mobile number', 'mobile_number', 'contact number', 'contact'],
      alternate_phone: ['alternate phone', 'alternate_phone', 'alternate mobile', 'alternative phone', 'secondary phone', 'secondary mobile'],
      dob: ['dob', 'date of birth', 'date_of_birth', 'birth date', 'birthdate'],
      marital_status: ['marital status', 'marital_status', 'marriage status', 'marriage_status'],
      status: ['status', 'applicant status', 'final status'],
      experience: ['experience', 'experience years', 'experience (years)', 'years experience', 'years of experience'],
      address: ['address', 'full address', 'current address', 'permanent address'],
      location: ['location', 'city', 'current location', 'preferred location', 'place', 'permanent location'],
      skills: ['skills', 'skill', 'technical skills', 'key skills'],
      joining_timeframe: ['joining timeframe', 'joining_timeframe', 'joining time', 'joining', 'notice period', 'availability'],
      bond_agreement: ['bond agreement', 'bond_agreement', 'bond', 'agreement', 'bond status'],
      branch: ['branch', 'branch name', 'office branch', 'location branch'],
      graduate_year: ['graduate year', 'graduate_year', 'graduation year', 'graduation_year', 'passing year', 'passout year'],
      note: ['note', 'notes', 'comment', 'comments', 'note comments'],
      reject_reason: ['reject reason', 'reject_reason', 'rejection reason', 'rejection_reason', 'reason for rejection'],
      resume_path: ['resume path', 'resume_path', 'resume', 'cv', 'cv path', 'resume link'],
      applied_date: ['applied date', 'applied_date', 'date applied', 'application date', 'date'],
      contacted_date: ['contacted date', 'contacted_date', 'date contacted', 'contact date'],
      interview_date: ['interview date', 'interview_date', 'date interviewed', 'interview schedule date'],
      interview_time: ['interview time', 'interview_time', 'time interviewed', 'interview schedule time', 'time'],
      position: ['position', 'applied position', 'job title', 'role', 'designation', 'job position'],
      ctc: ['ctc', 'expected ctc', 'current ctc', 'salary', 'expected salary'],
      followup1: ['follow-up1', 'followup1', 'follow_up1', 'follow up 1', 'follow-up 1'],
      followup2: ['follow-up2', 'followup2', 'follow_up2', 'follow up 2', 'follow-up 2'],
      remark: ['remark', 'remarks'],
      aptitude_marks: ['aptitude test marks', 'aptitude_test_marks', 'aptitude marks', 'aptitude_marks'],
      test_review: ['test review', 'test_review'],
      machine_test: ['machine test', 'machine test ', 'machine_test'],
      final_round: ['final round', 'final_round'],
      outcome: ['outcome', 'outcome status', 'out come'],
      final_remark: ['final remark', 'final_remark'],
      employee_id: ['employee id', 'employee_id', 'employee', 'emp id', 'emp_id', 'employee code'],
      employee_name: ['employee name', 'employee_name', 'employee', 'emp name', 'emp_name']
    };
    return aliases[field.key] || [];
  };


  findMatchingHeader = (field, headers) => {
    const fieldKey = this.normalizeText(field.key);
    const fieldLabel = this.normalizeText(field.label);
    const aliases = this.getFieldAliases(field).map(alias => this.normalizeText(alias)).filter(Boolean);
    let match = headers.find(header => {
      return this.normalizeText(header) === fieldKey;
    });

    if (match) {
      return match;
    }

    match = headers.find(header => {
      return this.normalizeText(header) === fieldLabel;
    });

    if (match) {
      return match;
    }

    match = headers.find(header => {
      const normalizedHeader = this.normalizeText(header);
      return aliases.includes(normalizedHeader);
    });

    if (match) {
      return match;
    }

    match = headers.find(header => {
      const normalizedHeader = this.normalizeText(header);
      if (!normalizedHeader) {
        return false;
      }

      return aliases.some(alias => {
        return (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)
        );
      });
    });
    return match || '';
  };

  handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const fileName = file.name;
    this.setState({
      errorMessage: '',
      importResult: null
    });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, {
          type: 'binary',
          cellDates: true
        });

        const sheetNames = workbook.SheetNames || [];
        if (sheetNames.length === 0) {
          this.setState({
            errorMessage: 'No worksheet found in the selected file.'
          });
          return;
        }

        const firstSheet = sheetNames[0];
        this.setState(
          {
            file,
            fileName,
            workbook,
            sheetNames,
            selectedSheet: firstSheet,
            errorMessage: '',
            importResult: null
          },
          () => {
            this.parseSheet(firstSheet);
          }
        );
      } catch (err) {
        console.error('File read error:', err);
        this.setState({
          errorMessage:
            'Failed to read file. Please ensure it is a valid CSV or Excel file.'
        });
      }
    };

    reader.onerror = () => {
      this.setState({
        errorMessage: 'Unable to read the selected file.'
      });
    };

    reader.readAsBinaryString(file);
  };

  handleSheetChange = (e) => {
    const sheetName = e.target.value;
    this.setState(
      {
        selectedSheet: sheetName,
        errorMessage: '',
        importResult: null
      },
      () => {
        this.parseSheet(sheetName);
      }
    );
  };

  parseSheet = (sheetName) => {
    const { workbook } = this.state;
    if (!workbook) {
      return;
    }

    if (!workbook.Sheets[sheetName]) {
      this.setState({
        errorMessage: 'Selected worksheet could not be found.'
      });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(
      worksheet,
      {
        header: 1,
        defval: '',
        raw: false
      }
    );

    if (!jsonData || jsonData.length === 0) {
      this.setState({
        errorMessage: 'Selected sheet is empty.',
        headers: [],
        rawData: [],
        fieldMapping: {}
      });
      return;
    }

    let headerRowIndex = 0;
    while (
      headerRowIndex < jsonData.length &&
      (!jsonData[headerRowIndex] || jsonData[headerRowIndex].every(cell => String(cell).trim() === ''))
    ) {
      headerRowIndex++;
    }

    if (headerRowIndex >= jsonData.length) {
      this.setState({
        errorMessage: 'No valid header row found.',
        headers: [],
        rawData: [],
        fieldMapping: {}
      });
      return;
    }

    const headers = jsonData[headerRowIndex].map(h => String(h || '').trim()).filter(Boolean);
    if (headers.length === 0) {
      this.setState({
        errorMessage: 'No valid columns found in the file.',
        headers: [],
        rawData: [],
        fieldMapping: {}
      });
      return;
    }

    const rows = jsonData.slice(headerRowIndex + 1);
    const autoMapping = {};
    SYSTEM_FIELDS.forEach(field => { autoMapping[field.key] = this.findMatchingHeader(field, headers); });
    this.setState({
      headers,
      rawData: rows,
      fieldMapping: autoMapping,
      errorMessage: ''
    });
  };

  handleMappingChange = (sysKey, selectedHeader) => {
    this.setState(prevState => ({
      fieldMapping: {
        ...prevState.fieldMapping,
        [sysKey]: selectedHeader
      },
      errorMessage: ''
    }));
  };

  validateMapping = () => {
    const { fieldMapping } = this.state;
    if (!fieldMapping.fullname) {
      this.setState({
        errorMessage: 'Full Name mapping is required.'
      });
      return false;
    }

    if (!fieldMapping.email && !fieldMapping.phone
    ) {
      this.setState({
        errorMessage: 'At least Email Address or Phone Number mapping is required.'
      });
      return false;
    }
    return true;
  };

  getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      return {};
    }
  };

  getMappedData = () => {
    const { headers, rawData, fieldMapping } = this.state;
    const user = this.getLoggedInUser();
    const loggedInEmpId = user.employee_id || user.id || user.user_id || '';
    const loggedInEmpName = user.fullname || user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '');

    return rawData.map(row => {
      const obj = {};

      SYSTEM_FIELDS.forEach(field => {
        const mappedHeader = fieldMapping[field.key];
        if (!mappedHeader) return;

        const headerIndex = headers.indexOf(mappedHeader);
        if (headerIndex !== -1 && row[headerIndex] !== undefined && row[headerIndex] !== null) {
          let value = String(row[headerIndex]).trim();
          if (value) {
            obj[field.key] = value;
          }
        }
      });

      // Split multiple phone numbers if present e.g. "8602850930, 9294665629"
      if (obj.phone && obj.phone.includes(',')) {
        const parts = obj.phone.split(',').map(p => p.trim()).filter(Boolean);
        obj.phone = parts[0];
        if (!obj.alternate_phone && parts[1]) {
          obj.alternate_phone = parts[1];
        }
      }

      if (!obj.employee_id && loggedInEmpId) {
        obj.employee_id = loggedInEmpId;
      }

      if (!obj.employee_name && loggedInEmpName) {
        obj.employee_name = loggedInEmpName;
      }

      return obj;
    }).filter(item => {
      const nameLower = (item.fullname || '').toLowerCase();
      if (nameLower.includes('total candidates') || nameLower.includes('scheduled interviews') || nameLower.includes('completed interviews') || nameLower.includes('selected candidates') || nameLower.includes('rejected candidates')) {
        return false;
      }
      return (item.fullname || item.email || item.phone);
    });
  };

  handleFinalImport = () => {
    if (!this.state.file) {
      this.setState({ errorMessage: 'Please select a CSV or Excel file.' });
      return;
    }

    if (this.state.headers.length === 0) {
      this.setState({ errorMessage: 'No valid columns found in the file.' });
      return;
    }

    if (!this.validateMapping()) {
      return;
    }

    const mappedData = this.getMappedData();
    if (mappedData.length === 0) {
      this.setState({ errorMessage: 'No valid applicant records found to import.' });
      return;
    }

    this.setState({
      isSubmitting: true,
      errorMessage: '',
      importResult: null
    });

    const user = this.getLoggedInUser();
    const loggedInEmpId = user.employee_id || user.id || user.user_id || '';
    const loggedInEmpName = user.fullname || user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '');
    const payload = new FormData();
    payload.append('file', this.state.file);
    payload.append('field_mapping', JSON.stringify(this.state.fieldMapping));
    payload.append('file_name', this.state.fileName);

    if (loggedInEmpId) {
      payload.append('logged_in_employee_id', loggedInEmpId);
    }
    if (loggedInEmpName) {
      payload.append('logged_in_employee_name', loggedInEmpName);
    }

    getService.addCall('applicants.php', 'import', payload)
      .then(response => {
        if (response.status === 'success') {
          this.setState({
            isSubmitting: false, importResult: response.data || {}
          });

          if (this.props.onSuccess) {
            this.props.onSuccess();
          }
        } else {
          throw new Error(response.data?.message || 'Import failed'
          );
        }
      })
      .catch(err => {
        console.error('Applicant import error:', err);

        this.setState({
          isSubmitting: false, errorMessage: err.message || 'Error occurred while importing data.'
        });
      });
  };

  downloadSampleCSV = () => {
    const fieldsToExport = SYSTEM_FIELDS.filter(field => field.key !== 'employee_id' && field.key !== 'employee_name');
    const headers = fieldsToExport.map(field => field.label);
    const sampleRowMap = {
      fullname: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      alternate_phone: '9123456789',
      dob: '1995-05-15',
      marital_status: 'single',
      status: 'interviewed',
      experience: '3.5',
      address: '123 Street, Tech Park',
      location: 'Ahmedabad',
      skills: 'React, Node.js, PHP',
      joining_timeframe: 'Next Week',
      bond_agreement: 'yes',
      branch: 'Head Office',
      graduate_year: '2017',
      note: 'Strong technical candidate',
      reject_reason: '',
      resume_path: '',
      applied_date: '2026-08-01',
      interview_date: '2026-08-10'
    };
    const sampleRow = fieldsToExport.map(field => sampleRowMap[field.key] ?? '');
    const escapeCSV = value => {
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    };

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), sampleRow.map(escapeCSV).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'sample_applicant_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  downloadSampleExcel = () => {
    const sampleData = [
      {
        'Full Name': 'Jane Smith',
        'Email Address': 'jane.smith@example.com',
        'Phone Number': '9876543211',
        'Alternate Phone': '9123456780',
        'Status': 'interviewed',
        'Experience (Years)': '2',
        'Graduation Year': '2023',
        'Location': 'Mumbai',
        'Skills (Comma separated)': 'Python, Django, HTML',
        'Joining Timeframe': 'Same Week',
        'Note / Comments': 'Referred candidate',
        'Applied Date (YYYY-MM-DD)': '2026-08-02',
        'Interview Date (YYYY-MM-DD)': '2026-08-11'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');
    XLSX.writeFile(workbook, 'sample_applicant_import_template.xlsx');
  };

  handleNextStep = () => {
    const { file, headers } = this.state;

    if (!file) {
      this.setState({
        errorMessage: 'Please select a CSV or Excel file.'
      });
      return;
    }

    if (!headers.length) {
      this.setState({
        errorMessage: 'No valid columns found in the file.'
      });
      return;
    }

    this.setState({
      currentStep: 2,
      errorMessage: ''
    });
  };

  handlePreviousStep = () => {
    this.setState({
      currentStep: 1,
      errorMessage: ''
    });
  };

  renderFileUpload = () => {
    const { fileName, sheetNames, selectedSheet, errorMessage } = this.state;
    return (
      <div>
        {errorMessage && (
          <div className="alert alert-danger py-2 small mb-3">
            {errorMessage}
          </div>
        )}
        <div className="form-group mb-3">
          <label className="form-label font-weight-bold">Select CSV / Excel File</label>
          <input type="file" className="form-control-file" accept=".csv,.xlsx,.xls" onChange={this.handleFileSelect} />
          {fileName && (
            <small className="text-success mt-2 d-block">
              <i className="fa fa-check-circle mr-1"></i>
              Loaded: {fileName}
            </small>
          )}
        </div>

        {sheetNames.length > 1 && (
          <div className="form-group mb-3">
            <label className="form-label font-weight-bold">Select Worksheet</label>
            <select
              className="form-control form-control-sm"
              value={selectedSheet}
              onChange={
                this.handleSheetChange
              }
            >
              {sheetNames.map(sheet => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  renderColumnMapping = () => {
    const { headers, fieldMapping, errorMessage } = this.state;
    return (
      <div>
        {errorMessage && (
          <div className="alert alert-danger py-2 small mb-3">
            {errorMessage}
          </div>
        )}
        <div
          className="table-responsive"
          style={{
            maxHeight: '420px',
            overflowY: 'auto'
          }}
        >
          <table className="table table-sm table-bordered mb-0">
            <thead
              className="thead-light"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: '#f8f9fa'
              }}
            >
              <tr>
                <th style={{ width: '50%' }}>System Field</th>
                <th style={{ width: '50%' }}>CSV / Excel Column</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEM_FIELDS.map(field => {
                const isRequired = field.required;
                const isEmailPhone = field.key === 'email' || field.key === 'phone';
                const hasMapping = !!fieldMapping[field.key];
                return (
                  <tr key={field.key}>
                    <td className="align-middle">
                      <strong>{field.label}</strong>
                      {isRequired && (
                        <span className="text-danger ml-1">*</span>
                      )}
                    </td>
                    <td className="align-middle">
                      <select
                        className={`form-control form-control-sm ${isRequired && !hasMapping ? 'is-invalid' : ''}`}
                        value={fieldMapping[field.key] || ''}
                        onChange={e => this.handleMappingChange(field.key, e.target.value)}
                      >
                        <option value="">-- Ignore / Unmapped --</option>
                        {
                          headers.map((header, index) => (
                            <option key={`${header}-${index}`} value={header}>{header}</option>))
                        }
                      </select>

                      {isRequired && !hasMapping && (
                        <div className="invalid-feedback">
                          This field is required.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="alert alert-info py-2 small mt-3 mb-0">
          <i className="fa fa-info-circle mr-1"></i>
          <strong>Required:</strong> Full Name and at least one of Email Address or Phone Number must be mapped.
        </div>
      </div>
    );
  };

  renderImportResult = () => {
    const { importResult } = this.state;
    const inserted = importResult?.inserted || 0;
    const updated = importResult?.updated || 0;
    const errors = importResult?.errors || [];
    return (
      <div className="py-3">
        <div className="text-center mb-4">
          <div className="mb-2">
            <i className="fa fa-check-circle text-success" style={{ fontSize: '52px' }}></i>
          </div>
          <h5 className="mb-1">Import Processed</h5>
          <small className="text-muted">Applicant import has been completed.</small>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-4 mb-3">
            <div className="card bg-light border-0 p-3 text-center h-100">
              <h3 className="text-success mb-1">{inserted}</h3>
              <small className="text-muted">New Applicants Added</small>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-light border-0 p-3 text-center h-100">
              <h3 className="text-info mb-1">{updated}</h3>
              <small className="text-muted">Existing Applicants Updated</small>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-3">
            <label className="font-weight-bold text-danger">Skipped Rows / Errors:</label>
            <div
              className="border rounded p-2 bg-light text-danger small"
              style={{ maxHeight: '180px', overflowY: 'auto' }}
            >
              {errors.map((err, index) => (
                <div key={index} className="mb-1">
                  <i className="fa fa-exclamation-circle mr-1"></i>
                  {err}
                </div>
              )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { show, onClose } = this.props;

    const {
      currentStep,
      headers,
      importResult,
      isSubmitting,
      file
    } = this.state;

    if (!show) {
      return null;
    }

    return (
      <div
        className="modal fade show"
        style={{
          display: 'block',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-top"
          role="document"
        >
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-1">
                  {importResult
                    ? 'Import Summary'
                    : currentStep === 1
                      ? 'Import Applicants'
                      : 'Map Applicant Columns'
                  }
                </h5>
              </div>

              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {importResult ? (
                this.renderImportResult()
              ) : (
                <>
                  {currentStep === 1 && (
                    this.renderFileUpload()
                  )}

                  {currentStep === 2 && (
                    this.renderColumnMapping()
                  )}
                </>
              )}

            </div>

            {/* FOOTER */}
            <div className="modal-footer">

              {!importResult ? (
                <>
                  <Button
                    label={currentStep == 2 ? "Back" : "Close"}
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (currentStep !== 2) {
                        onClose();
                      } else {
                        this.handlePreviousStep();
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <div className="ml-auto">
                    <Button
                      type="button"
                      title="Download sample CSV file"
                      icon="fa fa-download"
                      className="btn btn-outline-secondary btn-sm mr-2"
                      onClick={this.downloadSampleCSV}
                    />

                    <Button
                      title="Download sample Excel file"
                      type="button"
                      className="btn btn-outline-primary btn-sm mr-2"
                      icon="fa fa-download"
                      onClick={this.downloadSampleExcel}
                    />
                  </div>
                  {currentStep === 1 && (
                    <>
                      <Button
                        label="Next"
                        className="btn btn-primary btn-sm"
                        onClick={this.handleNextStep}
                        disabled={
                          !file ||
                          headers.length === 0
                        }
                      />
                    </>
                  )}

                  {/* STEP 2 FOOTER */}
                  {currentStep === 2 && (
                    <>
                      <div >
                        <Button
                          label={
                            isSubmitting
                              ? 'Importing...'
                              : 'Import'
                          }
                          className="btn btn-success btn-sm"
                          onClick={this.handleFinalImport}
                          disabled={
                            isSubmitting ||
                            !file ||
                            headers.length === 0
                          }
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="ml-auto">
                  <Button
                    label="Done"
                    className="btn btn-primary btn-sm"
                    onClick={onClose}
                  />
                </div>
              )}

            </div>

          </div>
        </div>
      </div >
    );
  }
}

export default ImportApplicantModal;