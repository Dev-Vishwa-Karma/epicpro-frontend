import React, { Component } from 'react';

class LinkModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.initialData && props.initialData.title ? props.initialData.title : '',
      link: props.initialData && props.initialData.link ? props.initialData.link : '',
      file: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.show &&
      (!prevProps.show || prevProps.initialData !== this.props.initialData)
    ) {
      this.setState({
        title: this.props.initialData && this.props.initialData.title ? this.props.initialData.title : '',
        link: this.props.initialData && this.props.initialData.link ? this.props.initialData.link : '',
        file: null,
      });
    }
  }

  handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      this.setState({ file: files[0] });
    } else {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, link, file } = this.state;
    const { type, onSubmit } = this.props;
    if (type === 'git') {
      onSubmit({ title, link });
    } else {
      onSubmit({ title, link, file });
    }
  };

  render() {
    const { show, onClose, type, isEdit, loading, errors = {} } = this.props;
    const { title, link } = this.state;
    if (!show) return null;
    return (
      <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <form onSubmit={this.handleSubmit}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEdit ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                  <button type="button" className="close" onClick={onClose}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      className={`form-control${errors.title ? ' is-invalid' : ''}`}
                      name="title"
                      value={title}
                      onChange={this.handleChange}
                      required
                    />
                    {errors.title && <small className="invalid-feedback">{errors.title}</small>}
                  </div>
                  <div className="form-group">
                    <label>Link</label>
                    <input
                      type="text"
                      className={`form-control${errors.link ? ' is-invalid' : ''}`}
                      name="link"
                      value={link}
                      onChange={this.handleChange}
                      required={type === 'git'}
                    />
                    {errors.link && <small className="invalid-feedback">{errors.link}</small>}
                  </div>
                  {(type === 'excel' || type === 'codebase') && (
                    <div className="form-group">
                      <label>File</label>
                      <input
                        type="file"
                        className={`form-control${errors.file ? ' is-invalid' : ''}`}
                        name="file"
                        onChange={this.handleChange}
                        // accept={type === 'excel' ? '.xls,.xlsx' : '*'}
                      />
                      {errors.file && <small className="invalid-feedback">{errors.file}</small>}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    {isEdit ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  }
}

export default LinkModal; 