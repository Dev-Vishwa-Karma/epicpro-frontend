import React from 'react';
import NoDataRow from '../../../common/NoDataRow';
import PropTypes from 'prop-types';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Button from '../../../common/formInputs/Button';
import Avatar from '../../../common/Avatar';
import { shortformatDate } from '../../../../utils';

const formatDate = (date) => {
    return shortformatDate(date)
}
const TicketListTable = ({ loading, logged_in_employee_role, ticketListData, goToViewTicket, message, goToEditTicket, openDeleteModal }) => {
    return (
        <div className="card-body">
            {loading ? (
                <div className="card-body">
                    <div className="dimmer active">
                        <TableSkeleton columns={8} rows={ticketListData.length} />
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-vcenter mb-0 table_custom spacing8 text-nowrap">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Title</th>
                                <th>Priority</th>
                                {logged_in_employee_role !== 'employee' &&
                                    <th>Assigned To</th>
                                }
                                <th>Assigned At</th>
                                <th>Progress</th>
                                <th>Duration</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ticketListData.length > 0 ? (
                                ticketListData.map((ticket, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="font-15"></div>
                                            <h6 className="mb-0">{ticket.title}</h6>
                                            <span title={ticket.description}>
                                                {`${(ticket.description.length < 10) ? ticket.description : ticket.description.substring(0, 10) + ' ...'}`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`tag ml-0 mr-0 ${ticket.priority === "high" ? "tag-danger"
                                                : ticket.priority === "medium" ? "tag-warning"
                                                    : "tag-success"
                                                }`}>
                                                {ticket.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        {logged_in_employee_role !== 'employee' &&
                                            <td className='d-flex'>
                                                <Avatar
                                                    profile={ticket.assigned_to.profile}
                                                    first_name={ticket.assigned_to.first_name}
                                                    last_name={ticket.assigned_to.last_name}
                                                    size={40}
                                                    className="avatar avatar-blue add-space me-2"
                                                    onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                                />
                                                <div className="ml-3">
                                                    <h6 className="mb-0">
                                                        {`${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`}
                                                    </h6>
                                                    <span className="text-muted">
                                                        {ticket.assigned_to.email}
                                                    </span>
                                                </div>
                                            </td>
                                        }
                                        <td><div className="text-info">{formatDate(ticket.assigned_at)}</div></td>
                                        <td style={{ width: ticket.progress}}>
                                            <div className="clearfix">
                                                <div className="float-left"><strong>{ticket.progress}</strong></div>
                                                <div className="float-right"><small className="text-muted">Progress</small></div>
                                            </div>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-blue" role="progressbar" style={{ width: ticket.progress }} aria-valuemin={0} aria-valuemax={100} data-width={ticket.progress}/>
                                            </div>
                                        </td>
                                        <td className='text-center'>
                                            <div className="text-pink" title="Due Date">{ticket.due_date ? formatDate(ticket.due_date) : '--/--/--'}</div>
                                            <div className="text-green" title="Completed At">{ticket.completed_at ? formatDate(ticket.completed_at) : '--/--/--'}</div>
                                        </td>
                                        <td>
                                            <Button
                                                icon="fa fa-eye"
                                                title="View"
                                                onClick={() => goToViewTicket(ticket, ticket.ticket_id)}
                                                className="btn-icon btn-sm"
                                            />
                                            {logged_in_employee_role !== 'employee' &&
                                                <>
                                                    <Button
                                                        icon="fa fa-edit"
                                                        className="btn-icon"
                                                        title="Edit"
                                                        onClick={() => goToEditTicket(ticket, ticket.ticket_id)}
                                                    />

                                                    <Button
                                                        icon="fa fa-trash-o text-danger"
                                                        className="btn-icon btn-sm js-sweetalert"
                                                        title="Delete"
                                                        dataToggle="modal"
                                                        dataTarget="#deleteTicketModal"
                                                        onClick={() => openDeleteModal(ticket.ticket_id)}
                                                        dataType="confirm"
                                                    />
                                                </>
                                            }
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <NoDataRow colSpan={8} message="No tickets to display" />
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
};

TicketListTable.propTypes = {
    loading: PropTypes.bool.isRequired,
    ticketListData: PropTypes.array.isRequired,
    goToViewTicket: PropTypes.func.isRequired,
    message: PropTypes.string,
    goToEditTicket: PropTypes.func.isRequired,
    openDeleteModal: PropTypes.func.isRequired,
    logged_in_employee_role: PropTypes.string.isRequired
};

export default TicketListTable;
