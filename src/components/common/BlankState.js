import React from 'react';

const BlankState = ({ message = 'No data found' }) => (
  <div className="text-center text-muted py-4" style={{ fontWeight: 500, color: '#888', fontSize: '1.1rem', padding: '32px 0' }}>
    {message}
  </div>
);

export default BlankState; 