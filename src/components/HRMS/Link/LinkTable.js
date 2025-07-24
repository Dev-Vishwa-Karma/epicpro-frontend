import React from 'react';
import NoDataRow from '../../common/NoDataRow';

const LinkTable = ({ data, tab, onEdit, onDelete }) => {
  // Download handler for file URLs
  const getAbsoluteUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    // Ensure no double slashes
    const base = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    return base + '/' + fileUrl.replace(/^\//, '');
  };

  const handleDownload = (fileUrl) => {
    const absUrl = getAbsoluteUrl(fileUrl);
    const link = document.createElement('a');
    link.href = absUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped table-vcenter mb-0">
        <thead>
          <tr>
            <th>Title</th>
            <th className='w100'>Link</th>
            <th className='w100'>Action</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>
                  {tab === 'Git' ? (
                    row.link ? (
                      <a href={row.link} target="_blank" rel="noopener noreferrer">{row.link}</a>
                    ) : (
                      <span>-</span>
                    )
                  ) : (
                    row.link ? (
                      <a href={row.link} target="_blank" rel="noopener noreferrer">{row.link}</a>
                    ) : row.file ? (
                      typeof row.file === 'string' ? (
                        <>
                          <a href={getAbsoluteUrl(row.file)} target="_blank" rel="noopener noreferrer">File</a>
                          <button
                            className="btn btn-link btn-sm ml-2"
                            title="Download"
                            style={{ padding: 0, border: 'none', background: 'none' }}
                            onClick={() => handleDownload(row.file)}
                          >
                            <i className="fa fa-download" />
                          </button>
                        </>
                      ) : (
                        <span>File</span>
                      )
                    ) : (
                      <span>-</span>
                    )
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-icon btn-sm mr-2"
                    title="Edit"
                    onClick={() => onEdit(tab, row.id)}
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-sm js-sweetalert"
                    title="Delete"
                    onClick={() => onDelete(tab, row.id)}
                  >
                    <i className="fa fa-trash-o text-danger" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <NoDataRow colSpan={3} message="No links found." />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LinkTable; 