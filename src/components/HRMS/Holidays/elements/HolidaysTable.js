import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Button from '../../../common/formInputs/Button';

const HolidaysTable = ({
  loading,
  holidays,
  message,
  logged_in_user_role,
  currentHolidays,
  handleEditClickForHoliday,
  openDeleteHolidayModal
}) => {
  return (
    <div className="card-body">
      {loading ? (
        <div className="dimmer active mb-4">
          <TableSkeleton columns={5} rows={holidays.length} />
        </div>
      ) : holidays.length === 0 && !message ? (
        <div className="text-center">
          <div className="text-muted" style={{ fontSize: '1rem', padding: '2rem 0' }}>
            Holidays data not found
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table_custom spacing5 border-style mb-0">
            <thead>
              <tr>
                <th>DAY</th>
                <th>DATE</th>
                <th>HOLIDAY</th>
                {(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
                  <th>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentHolidays.length > 0 ? (
                currentHolidays
                  .filter((holiday) => holiday.event_type === 'holiday')
                  .map((holiday, index) => (
                    <tr key={index}>
                      <td>
                        <span>
                          {new Date(holiday.event_date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                      </td>
                      <td>
                        <span>
                          {new Intl.DateTimeFormat('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(holiday.event_date))}
                        </span>
                      </td>
                      <td>
                        <span>{holiday.event_name}</span>
                      </td>
                      {(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
                        <td>
                          <Button
                            label=""
                            onClick={() => handleEditClickForHoliday(holiday)}
                            title="Edit"
                            className="btn-icon btn-sm"
                            dataToggle="modal"
                            dataTarget="#editHolidayModal"
                            icon="fa fa-edit"
                          />

                          {/* Delete Button */}
                          <Button
                            label=""
                            onClick={() => openDeleteHolidayModal(holiday.id)}
                            title="Delete"
                            className="btn-icon btn-sm js-sweetalert"
                            dataType="confirm"
                            dataToggle="modal"
                            dataTarget="#deleteHolidayModal"
                            icon="fa fa-trash-o text-danger"
                          />
                            </td>
                      )}
                    </tr>
                  ))
              ) : (
                <NoDataRow colSpan={5} message="Holidays data not found" />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HolidaysTable;
