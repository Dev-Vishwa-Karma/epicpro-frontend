import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-vcenter table-hover mb-0">
        <thead>
          <tr>
            {[...Array(columns)].map((_, index) => (
              <th key={index}>
                <Skeleton width={100} height={20} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex}>
                  {colIndex === columns - 1 ? (
                    <div className="d-flex gap-2">
                      <Skeleton circle width={24} height={24} />
                      <Skeleton circle width={24} height={24} />
                    </div>
                  ) : (
                    <Skeleton height={20} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
