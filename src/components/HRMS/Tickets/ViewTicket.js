import React, { Component } from "react";
import Button from '../../common/formInputs/Button';
import TextEditor from "../../common/TextEditor";
import { getService } from "../../../services/getService";
import { connect } from "react-redux";
import Avatar from "../../common/Avatar";
import { validateFields } from "../../common/validations";
import { appendDataToFormData, formatDateTimeAMPM, shortformatDate } from "../../../utils";
import ProgressModal from "./elements/ProgressModal";
import BlankState from "../../common/BlankState";
import TableSkeleton from '../../common/skeletons/TableSkeleton';

class ViewTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticket_id: '',
            ticket: '',
            comments: [],
            logs: [],
            isLoading: true,
            ButtonLoading: false,
            comment: '',
            showProgressModal: false,
            errors: {},
            showError: false,
            showSuccess: false,
            errorMessage: '',
            current_progress: 0,
            successMessage: '',
            progress_date: '',
            progress_done: 0,
            working_hours: 0,
            SaveProgressButtonLoading: false,
            progressErrors: {},
            logged_in_employee_id: '',
            logged_in_employee_role: '',
        }
    }

    formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = shortformatDate(date);
        const formattedTime = formatDateTimeAMPM(dateString)
        return `${formattedDate} ${formattedTime}`;
    }

    stripHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
    };

    openProgressModal = () => {
        this.setState({
            showProgressModal: true,
            showError: false,
            SaveProgressButtonLoading: false,
            current_progress: this.state.ticket.progress
        });
    }

    handleSaveProgress = async (e) => {
        const { id } = window.user;
        this.setState({
            SaveProgressButtonLoading: false,
            errors: {},
            errorMessage: '',
            showError: false
        });
        const { progress_date, ticket_id, working_hours, current_progress, ticket } = this.state;

        const validationSchema = [
            { name: 'progress_date', value: progress_date, required: true, messageName: 'Progress Date' },
            {
                name: 'current_progress',
                value: current_progress,
                required: true,
                messageName: 'Progress',
                customValidator: (val) => {
                    if (val === undefined || val === null || String(val).trim() === '') {
                        return ' is required.';
                    }
                    const newProgress = Number(val);
                    const currentProgress = Number((ticket && ticket.progress) != null ? ticket.progress : 0);

                    if (Number.isNaN(newProgress)) {
                        return ' must be a number.';
                    }
                    if (newProgress <= currentProgress) {
                        return "Progress can't be less than current progress.";
                    }
                    if (newProgress > 100) {
                        return "Progress can't be greater than 100";
                    }
                    return undefined;
                }
            },
            {
                name: 'working_hours',
                value: working_hours,
                required: true,
                messageName: 'Working Hours',
                customValidator: (val) => {
                    if (val === undefined || val === null || String(val).trim() === '') {
                        return ' is required.';
                    }
                    const workingHours = Number(val);

                    if (Number.isNaN(workingHours)) {
                        return ' must be a number.';
                    }
                    if (10 < workingHours) {
                        return "Working hours can't exceed 10 hours.";
                    }
                    return undefined;
                }
            }
        ]

        const errors = validateFields(validationSchema);

        if (Object.keys(errors).length > 0) {
            this.setState({
                progressErrors: errors,
                ButtonLoading: false
            });
            return;
        } else {
            this.setState({ progressErrors: {} });
        }

        const addProgressData = new FormData();
        const data = {
            ticket_id: ticket_id,
            date: progress_date,
            working_hours: working_hours,
            progress: current_progress,
            updated_by: id
        };
        appendDataToFormData(addProgressData, data)

        getService.addCall('tickets.php', 'add-progress-logs', addProgressData)
            .then((data) => {
                if (data.status === 'success') {
                    this.setState((prevState) => ({
                        showProgressModal: false,
                        successMessage: data.message || "Progress saved successfully",
                        showSuccess: true,
                        ButtonLoading: false,
                        progress_done: [...(prevState.progress_done || []), data.data.progress],
                        ticket: prevState.ticket ? { ...prevState.ticket, progress: (typeof data.progress !== 'undefined' ? data.progress : prevState.ticket.progress) } : prevState.ticket,
                        comment: "",
                        progress_date: "",
                        working_hours: ""
                    }));
                    this.getData(ticket_id);
                } else {
                    console.error("Failed to add Comment details:", data);
                    this.setState({
                        errorMessage: data.message || "Failed to add comment.",
                        showError: true,
                        showSuccess: false,
                        ButtonLoading: false,
                    });
                }
            }).catch((error) => {
                console.error("Error adding comment:", error);
                this.setState({
                    errorMessage: "An error occurred while adding the comment.",
                    showError: true,
                    showSuccess: false,
                    ButtonLoading: false,
                });
            });
    }

    closeModal = () => {
        this.setState({
            showProgressModal: false,
            errorMessage: {},
            progressErrors: {},
            working_hours: "",
            progress_date: "",
            current_progress: 0
        });
    };

    handleBack = () => {
        this.props.history.goBack(); // Navigate to the previous page
    };

    addComment = async (e) => {
        e.preventDefault();
        const { id } = window.user;
        const { ticket_id, comment } = this.state;
        this.setState({ ButtonLoading: true });

        const validationSchema = [
            { name: 'comment', value: comment, required: true, messageName: 'Comment' },
        ]

        const errors = validateFields(validationSchema);

        if (Object.keys(errors).length > 0) {
            this.setState({ errors, ButtonLoading: false, showError: false, showSuccess: false }, () => {
                const firstErrorField = Object.keys(errors)[0];
                const ref = this.fieldRefs[firstErrorField];
                if (ref && ref.current) {
                    ref.current.focus();
                    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                } else {
                    console.warn('No ref found for field:', firstErrorField);
                }
            });
            return
        } else {
            this.setState({ errors: {} });
        }

        const addCommentData = new FormData();
        const data = {
            ticket_id: ticket_id,
            comment: this.stripHtml(comment),
            comment_by: id
        }

        appendDataToFormData(addCommentData, data)

        getService.addCall('comment.php', 'add', addCommentData)
            .then((data) => {
                if (data.status === 'success') {
                    const newComment = {
                        id: data.data.id,
                        ticket_id: data.data.ticket_id,
                        comment_comment: data.data.comment_comment,
                        commented_by: data.data.commented_by,
                        comment_created_at: data.data.comment_created_at,
                    };
                    this.setState((prevState) => ({
                        successMessage: data.message || "Comment added successfully",
                        showSuccess: true,
                        ButtonLoading: false,
                        comment: "",
                        comments: [...prevState.comments, newComment]
                    }));
                } else {
                    console.error("Failed to add Comment details:", data);
                    this.setState({
                        errorMessage: data.message || "Failed to add comment.",
                        showError: true,
                        showSuccess: false,
                        ButtonLoading: false,
                    });
                }
            }).catch((error) => {
                console.error("Error adding comment:", error);
                this.setState({
                    errorMessage: "An error occurred while adding the comment.",
                    showError: true,
                    showSuccess: false,
                    ButtonLoading: false,
                });
            }
            );
    }

    getData = (ticket_id) => {
        if (ticket_id) {
            this.setState({ ticket_id, isLoading: true });
            getService.getCall('tickets.php', {
                action: 'get',
                ticket_id: ticket_id
            })
                .then((response) => {
                    if (response.data) {
                        this.setState({
                            ticket: response.data.ticket,
                            comments: response.data.comments,
                            logs: response.data.logs
                        });
                    }
                })
                .catch(() => {})
                .finally(() => {
                    this.setState({ isLoading: false });
                });
        }
    }

    componentDidMount() {
        const { location } = this.props;
        const { id, role } = window.user;
        this.setState({
            employee_id: id || null,
            logged_in_employee_role: role || null,
        });
        if (location && location.state && location.state.ticketId) {
            const ticket_id = location?.state?.ticketId;
            this.getData(ticket_id);
        }
    }

    render() {
        const { fixNavbar } = this.props;
        const { ticket, comments, logs, isLoading, showProgressModal, progress_date, working_hours, progress_done, current_progress, progressErrors, showError, errorMessage } = this.state;
        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-12">
                                <div className="card c_grid c_yellow">
                                    <div className="card-body text-center">
                                        {isLoading ? (
                                            <>
                                                <div className="mb-3"><TableSkeleton columns={1} rows={1} /></div>
                                                <div className="mb-2"><TableSkeleton columns={2} rows={1} /></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="circle">
                                                    <Avatar
                                                        profile={ticket.assigned_to?.profile}
                                                        first_name={ticket.assigned_to?.first_name}
                                                        last_name={ticket.assigned_to?.last_name}
                                                        size={130}
                                                        className="avatar avatar-blue add-space me-2"
                                                        onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                                    />
                                                </div>
                                                <h6 className="mt-3 mb-0">{(ticket.assigned_to?.first_name || '') + ' ' + (ticket.assigned_to?.last_name || '')}</h6>
                                                <span>{(ticket.assigned_to?.email)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Ticket Details</h3>
                                        <div className="card-options">
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {isLoading ? <TableSkeleton columns={2} rows={1} /> : <span>{ticket.title}</span>}
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Ticket Info</h3>
                                        <div className="card-options">
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {isLoading ? (
                                            <TableSkeleton columns={3} rows={4} />
                                        ) : (
                                            <ul className="list-group" style={{height:"500px", overflow:"aito"}}>
                                                <li className="list-group-item">
                                                    <small className="text-muted">Description: </small>
                                                    <p className="mb-0" style={{height:"180px", overflow:"auto"}}>{ticket.description}</p>
                                                </li>
                                                <li className="list-group-item">
                                                    <small className="text-muted">Priority: </small>
                                                    <p className="mb-0">
                                                        <span className={`tag ml-0 mr-0 ${ticket.priority === "high" ? "tag-danger"
                                                            : ticket.priority === "medium" ? "tag-warning"
                                                                : "tag-success"
                                                            }`}>
                                                            {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : ''}
                                                        </span>
                                                    </p>
                                                </li>
                                                <li className="list-group-item">
                                                    <div className="d-flex justify-content-between">
                                                        <small className="text-muted">Due Date: </small>
                                                        {ticket.due_date && (new Date(ticket.due_date) < new Date() && ticket.status !== 'completed') ? <span className="tag over-due-ticket">Overdue</span> : ''}
                                                    </div>
                                                    <p className="mb-0">{ticket.due_date ? this.formatDate(ticket.due_date) : '--/--/--'}</p>
                                                </li>
                                                <li className="list-group-item">
                                                    <div className="d-flex justify-content-between">
                                                        <div>Progress</div>
                                                        <small><span className={`tag ml-1 mr-0 mb-1 ${ticket.progress === "100" ? "tag-blue"
                                                            : "tag-gray"
                                                            }`}>{`${ticket.progress !== '100' ? ticket.progress + '%' : 'Completed'}`}
                                                        </span></small>
                                                    </div>
                                                    <div className="progress progress-xs mb-0">
                                                        <div className="progress-bar bg-info" style={{ width: `${ticket.progress}%` }} />
                                                    </div>
                                                </li>
                                                {ticket.completed_at == null && ticket.progress !== 100 ? '' :
                                                    <li className="list-group-item">
                                                        <small className="text-muted">Completed On: </small>
                                                        <p className="mb-0">{this.formatDate(ticket.completed_at)}</p>
                                                    </li>
                                                }
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Ticket Progress</h3>
                                        {(this.state.logged_in_employee_role === 'employee') && !(progress_done === 100 || ticket.progress === 100) && (
                                            <div className="card-options">
                                                <Button
                                                    label="Add Progress"
                                                    loading={this.state.ButtonLoading}
                                                    disabled={this.state.ButtonLoading}
                                                    className="btn-primary btn-custom"
                                                    dataToggle="modal"
                                                    dataTarget="#ticketProgressModal"
                                                    onClick={() => this.openProgressModal(ticket.ticket_id)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        {isLoading ? (
                                            <TableSkeleton columns={2} rows={4} />
                                        ) : (
                                            <ul className="list-group" style={{
                                                height: "150px",
                                                overflowY: "auto"
                                            }}>
                                                {logs.length === 0 ? (
                                                    <BlankState message="No logs to show" /> 
                                                    ) : (
                                                    <table className="table table-hover table-vcenter mb-0 table_custom spacing8 text-nowrap">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Working</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {logs
                                                            .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
                                                            .map((log, index) => (
                                                            <tr key={log.log_id || index}>
                                                                <td>{shortformatDate(log.log_date)}</td>
                                                                <td>{log.log_working_hours} hrs</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                    
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12">
                                <div className="card">
                                    <form noValidate onSubmit={this.addComment}>
                                        <div className="card-body">
                                            <p>Add a comment</p>
                                            <TextEditor
                                                value={this.state.comment}
                                                onChange={(value) => this.handleChange({ target: { name: 'comment', value } })}
                                                placeholder={"Add a comment..."}
                                            />
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                gap: "10px",
                                            }} className="mt-3">
                                                <Button
                                                    type="submit"
                                                    icon="fa fa-send"
                                                    loading={this.state.ButtonLoading}
                                                    disabled={this.state.ButtonLoading}
                                                    className="btn-primary"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Ticket Replies</h3>
                                    </div>
                                    <div className="card-body" style={{
                                        height: "681px",
                                        overflow: "auto"
                                    }}>
                                        {isLoading ? (
                                            <TableSkeleton columns={3} rows={6} />
                                        ) : (
                                            comments.length > 0 ? (
                                                comments.map((comment, index) => (
                                                    <div className="timeline_item" key={comment.comment_id || index}>
                                                        <Avatar
                                                            profile={comment.commented_by?.profile}
                                                            first_name={comment.commented_by?.first_name}
                                                            last_name={comment.commented_by?.last_name}
                                                            size={30}
                                                            className="avatar avatar-blue add-space me-2 mr-2 tl_avatar"
                                                            onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                                                        />
                                                        <span>{comment.commented_by?.first_name + ' ' + comment.commented_by?.last_name} <small className="float-right text-right">{this.formatDate(comment.comment_created_at)}</small></span>
                                                        <div className="msg">
                                                            <p>{comment.comment_comment}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) :
                                                <BlankState message="No comments to Show" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showProgressModal &&
                    <ProgressModal
                        modelId="ticketProgressModal"
                        handleSaveProgress={this.handleSaveProgress}
                        closeModal={this.closeModal}
                        handleChange={this.handleChange}
                        min_date={ticket.assigned_at}
                        current_progress={current_progress}
                        progress_date={progress_date}
                        working_hours={working_hours}
                        SubmitButtonLoading={this.state.SaveProgressButtonLoading}
                        showError={showError}
                        errorMessage={errorMessage}
                        errors={progressErrors}
                    />
                }
            </>
        )
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ViewTicket);
