import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ClientCardSkeleton = () => {
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 mb-4">
      <div className="card h-100">
        <div className="card-body text-center ribbon" style={{ minHeight: '300px' }}>
          <div className="ribbon-box">
            <Skeleton width={80} height={20} />
          </div>

          <div className="d-flex justify-content-center" style={{ height: '100px', margin: '20px 0' }}>
            <Skeleton circle width={100} height={100} />
          </div>

          <div
            className="dropdown d-flex"
            style={{ position: 'absolute', top: '16px', right: '10px' }}
          >
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} style={{ marginLeft: '8px' }} />
          </div>

          <div style={{ minHeight: '40px' }}>
            <Skeleton width={150} height={20} />
            <Skeleton width={100} height={15} />
          </div>

          <ul className="mt-3 list-unstyled d-flex justify-content-center">
            <Skeleton width={100} height={30} />
          </ul>

          <div className="row text-center mt-4" style={{ minHeight: '80px' }}>
            <div className="col-lg-6 border-right">
              <Skeleton width={60} height={15} />
              <Skeleton width={40} height={25} />
            </div>
            <div className="col-lg-6">
              <Skeleton width={60} height={15} />
              <Skeleton width={40} height={25} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCardSkeleton;
