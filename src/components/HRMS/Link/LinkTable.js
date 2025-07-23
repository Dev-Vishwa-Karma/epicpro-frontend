import React from 'react';

const LinkTable = ({ data, loading, emptyMessage, onEdit, onDelete, type }) => (
  <div className="card">
    <div className="card-body">
      <div className="table-responsive todo_list">
        <table className="table table-hover table-striped table-vcenter mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th className="w150 ">Link</th>
              <th className="w100">Action</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan="3">
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "100px" }}>
                    <div className="loader" />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data && data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td>{row.title}</td>
                    <td>
                      {type === 'git' ? (
                        row.link
                      ) : row.link ? (
                        <a href={row.link} target="_blank" rel="noopener noreferrer">{row.link}</a>
                      ) : row.file ? (
                        typeof row.file === 'string' ? (
                          <a href={row.file} download className="btn btn-sm ">
                            <i class="fa fa-download"></i>
                          </a>
                        ) : (
                          <>
                            <div  className="d-flex justify-content-center align-items-center">
                                <button className="btn btn-sm ml-2 text-center"><i class="fa fa-download"></i></button>
                            </div>
                          </>
                        )
                      ) : (
                        ''
                      )}
                    </td>
                    <td>
                      <button type="button" className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit && onEdit(row)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button type="button" className="btn btn-icon btn-sm" title="Delete" onClick={() => onDelete && onDelete(row)}>
                        <i className="fa fa-trash-o text-danger" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', fontWeight: 500, color: '#888', fontSize: '1.1rem', padding: '32px 0' }}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  </div>
);

export default LinkTable; 