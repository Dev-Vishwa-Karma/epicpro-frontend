import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AttendanceTableSkeleton = ({ employeeCount = 5, dayCount = 10 }) => {
  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#a2c4c9 #ffffff', scrollBehavior: 'smooth' }}>
      <table className="table table-bordered table-sm text-center" style={{ minWidth: '600px' }}>
        <thead style={{ backgroundColor: "#a2c4c9" }}>
          <tr>
            <th style={{ padding: "14px" }}><Skeleton width={60} /></th>
            {[...Array(employeeCount)].map((_, index) => (
              <th key={index} style={{ padding: "14px" }}>
                <Skeleton width={80} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Skeleton rows for each date */}
          {[...Array(dayCount)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td><Skeleton width={80} /></td>
              {[...Array(employeeCount)].map((_, colIndex) => (
                <td key={colIndex}><Skeleton width={50} /></td>
              ))}
            </tr>
          ))}

          {/* Summary Row 1 */}
          <tr>
            <td><Skeleton width={100} /></td>
            {[...Array(employeeCount)].map((_, index) => (
              <td key={index}><Skeleton width={30} /></td>
            ))}
          </tr>

          {/* Summary Row 2 */}
          <tr>
            <td><Skeleton width={130} /></td>
            {[...Array(employeeCount)].map((_, index) => (
              <td key={index}><Skeleton width={30} /></td>
            ))}
          </tr>

          {/* Summary Row 3 */}
          <tr>
            <td><Skeleton width={130} /></td>
            {[...Array(employeeCount)].map((_, index) => (
              <td key={index}><Skeleton width={30} /></td>
            ))}
          </tr>

          {/* Summary Row 4 */}
          <tr>
            <td><Skeleton width={130} /></td>
            {[...Array(employeeCount)].map((_, index) => (
              <td key={index}><Skeleton width={30} /></td>
            ))}
          </tr>

          {/* Summary Row 5 */}
          <tr>
            <td><Skeleton width={170} /></td>
            {[...Array(employeeCount)].map((_, index) => (
              <td key={index}><Skeleton width={30} /></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTableSkeleton;
