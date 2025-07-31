// src/components/common/DepartmentGridSkeleton.js
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DepartmentGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="row clearfix">
      {[...Array(count)].map((_, index) => (
        <div className="col-lg-3 col-md-6 mb-4" key={index}>
          <div className="card">
            <div className="card-body text-center">
              <Skeleton circle height={80} width={80} className="mb-3" />
              <h6 className="mt-3">
                <Skeleton width={`60%`} />
              </h6>
              <div className="text-muted mb-2">
                <Skeleton width={`70%`} />
              </div>
              <div className="text-muted mb-3">
                <Skeleton width={`50%`} />
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Skeleton circle height={30} width={30} />
                <Skeleton circle height={30} width={30} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentGridSkeleton;
