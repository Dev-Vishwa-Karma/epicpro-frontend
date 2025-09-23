import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import Button from '../../../common/formInputs/Button';

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
      return `${urlObj.hostname}${urlObj.pathname !== '/' ? '...' : ''}`;
    } catch (e) {
      // If URL parsing fails, return original
      return url.length > 30 ? `${url.substring(0, 30)}...` : url;
    }
  };

  // Function to get file type icon based on file extension
  const getFileTypeIcon = (filePath) => {
    if (!filePath) return null;
    
    const fileName = filePath.split('/').pop() || filePath;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'pdf':
        return <i className="fa fa-file-pdf-o text-danger file-icon" title="PDF File" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <i className="fa fa-file-archive-o text-warning file-icon" title="Archive File" />;
      case 'doc':
      case 'docx':
        return <i className="fa fa-file-word-o text-primary file-icon" title="Word Document" />;
      case 'xls':
      case 'xlsx':
        return <i className="fa fa-file-excel-o text-success file-icon" title="Excel Spreadsheet" />;
      case 'ppt':
      case 'pptx':
        return <i className="fa fa-file-powerpoint-o text-danger file-icon" title="PowerPoint Presentation" />;
      case 'txt':
        return <i className="fa fa-file-text-o file-icon" title="Text File" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
      case 'psd':
        return <i className="fa fa-file-image-o text-info file-icon" title="Image File" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return <i className="fa fa-file-audio-o text-info file-icon" title="Audio File" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return <i className="fa fa-file-video-o text-info file-icon" title="Video File" />;
      case 'html':
      case 'htm':
      case 'css':
      case 'js':
      case 'php':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'sql':
      case 'json':
      case 'csv':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'ini':
        return <i className="fa fa-file-code-o file-icon" title="Code File" />;
      default:
        return <i className="fa fa-file-o text-muted file-icon" title="File" />;
    }
  };

  // Function to determine what to display in the Link column
  const renderLinkContent = (row) => {
    // For Git type, always show as link
    if (type === 'Git') {
      return row.url ? (
        <a 
          href={row.url} 
          target="_blank" 
          rel="noopener noreferrer"
          title={row.url}
          className="text-primary"
        >
          {shortenUrl(row.url)}
        </a>
      ) : <span className="text-muted">-</span>;
    }
  
    // For other types (Excel, Codebase)
    if (row.url) {
      // If URL exists, show as link
      return (
        <a 
          href={row.url} 
          target="_blank" 
          rel="noopener noreferrer"
          title={row.url}
          className="text-primary"
        >
          {shortenUrl(row.url)}
        </a>
      );
    } else if (row.file_path) {
      // If file exists, show only the icon (clickable for download)
      const fileName = row.file_path.split('/').pop() || row.file_path;
      return (
        <button
          onClick={() => handleDownload(row.file_path)}
          title={`Download ${fileName}`}
          className="btn btn-link p-0 border-0 bg-transparent"
        >
          {getFileTypeIcon(row.file_path)}
        </button>
      );
    }
    
    return <span className="text-muted">-</span>;
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
                <td>{row.title || '-'}</td>
                <td>
                  {renderLinkContent(row)}
                </td>
                <td>
                  <Button
                    label=""
                    onClick={() => onEdit(type, row.id)}
                    title="Edit"
                    className="btn-icon btn-sm mr-2"
                    icon="fa fa-edit"
                  />
                  <Button
                    label=""
                    onClick={() => onDelete(type, row.id)}
                    title="Delete"
                    className="btn-icon btn-sm js-sweetalert"
                    icon="fa fa-trash-o text-danger"
                  />
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