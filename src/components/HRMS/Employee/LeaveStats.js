import React from 'react';
import CountUp from 'react-countup';

const LeaveStats = ({ label, value, loading }) => {
  return (
    <div className="col-6 col-sm-6 col-md-3 mb-3 d-flex align-items-stretch">
      <div className="card w-100 h-100">
        <div className="card-body w_sparkline d-flex flex-column justify-content-center align-items-center">
          <span>{label}</span>
          {loading ? (
            <div className="d-flex" style={{ height: '20px' }}>
              <div
                className="spinner-border"
                role="status"
                style={{ width: '20px', height: '20px', borderWidth: '2px' }}
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <h3 className="mb-0 counter">
              <CountUp end={value} />
            </h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveStats;
