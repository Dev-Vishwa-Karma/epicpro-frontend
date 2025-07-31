import React from 'react';
import NoDataRow from '../../common/NoDataRow';

const LinkTable = ({ data, type, onEdit, onDelete, onDownload }) => {
  // Download handler for file URLs
  const getAbsoluteUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    const base = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    return base + '/' + fileUrl.replace(/^\//, '');
  };

  const handleDownload = (fileUrl) => {
    if (onDownload) {
      onDownload(fileUrl);
    } else {
      // Fallback to direct download if no onDownload handler provided
      const absUrl = getAbsoluteUrl(fileUrl);
      const link = document.createElement('a');
      link.href = absUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Function to shorten URL display
  const shortenUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}`;
    } catch (e) {
      // If URL parsing fails, return original
      return url;
    }
  };

  // Function to get file type icon based on file extension
  const getFileTypeIcon = (filePath) => {
    if (!filePath) return null;
    
    const fileName = filePath.split('/').pop() || filePath;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'pdf':
        return <i className="fa fa-file-pdf-o file-icon" title="PDF File" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <i className="fa fa-file-archive-o file-icon" title="Archive File" />;
      case 'doc':
      case 'docx':
        return <i className="fa fa-file-word-o file-icon" title="Word Document" />;
      case 'xls':
      case 'xlsx':
        return <i className="fa fa-file-excel-o file-icon" title="Excel Spreadsheet" />;
      case 'ppt':
      case 'pptx':
        return <i className="fa fa-file-powerpoint-o file-icon" title="PowerPoint Presentation" />;
      case 'txt':
        return <i className="fa fa-file-text-o file-icon" title="Text File" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return <i className="fa fa-file-image-o file-icon" title="Image File" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return <i className="fa fa-file-audio-o file-icon" title="Audio File" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return <i className="fa fa-file-video-o file-icon" title="Video File" />;
      case 'html':
      case 'htm':
      case 'css':
      case 'js':
      case 'php':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <i className="fa fa-file-code-o file-icon" title="Code File" />;
      default:
        return <i className="fa fa-file-o text-muted file-icon" title="File" />;
    }
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
                  {type === 'Git' ? (
                    row.url ? (
                      <a 
                        href={row.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={row.url}
                      >
                        {shortenUrl(row.url)}
                      </a>
                    ) : (
                      <span>-</span>
                    )
                  ) : (
                    row.url ? (
                      <a 
                        href={row.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={row.url}
                      >
                        {shortenUrl(row.url)}
                      </a>
                    ) : row.file_path ? (
                      typeof row.file_path === 'string' ? (
                        <>
                          
                          <button
                            className="btn btn-link btn-sm ml-2"
                            title="Download"
                            style={{ padding: 0, border: 'none', background: 'none' }}
                            onClick={() => handleDownload(row.file_path)}
                          >
                            {getFileTypeIcon(row.file_path)}
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
                    onClick={() => onEdit(type, row.id)}
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-sm js-sweetalert"
                    title="Delete"
                    onClick={() => onDelete(type, row.id)}
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