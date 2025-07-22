import React from 'react';

const NoDataRow = ({ colSpan = 1, message = 'No data available' }) => (
  <tr>
    <td colSpan={colSpan} style={{ textAlign: 'center', fontWeight: 500, color: '#888', fontSize: '1.1rem', padding: '32px 0' }}>
      {message}
    </td>
  </tr>
);

export default NoDataRow; 