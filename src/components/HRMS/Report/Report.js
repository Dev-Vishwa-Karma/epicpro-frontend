import React, { Component } from 'react'
import { connect } from 'react-redux';
import "react-datepicker/dist/react-datepicker.css";
import AlertMessages from '../../common/AlertMessages';
import DeleteModal from '../../common/DeleteModal';
import { getService } from '../../../services/getService';
import Pagination from '../../common/Pagination';
import DateFilterForm from '../../common/DateFilterForm';
import ReportTable from './ReportTable';
import ViewReportModal from './ViewReportModal';
import EditReportModal from './EditReportModal';
import AddBreakModal from './AddBreakModal';
import EditReportDetailsModal from './EditReportDetailsModal';
import moment from 'moment';

class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            reports: [],
            selectedModalReport:null,
            selectedReport: null,
            isModalOpen: false,
            selectedReportEmployee: (window.user.role === 'admin' || window.user.role === 'super_admin') ? "" : window.user.id,
            selectedEmployee: "",
            employeeData: [],
            selectedStatus: "",
            punchOutReport: "",
            activityId: null,
            reportError: null,
            reportSuccess: null,
            addReportByAdminError: null,
            existingFullName: "",
            existingActivityType: "",
            existingActivityDescription: "",
            existingActivityInTime: "",
            existingActivityOutTime: null,
            existingActivitySatus: "",
            existingActivityId: null,
            editReportByAdminError: null,
            employee_id: '',
            report_id: '',
            report: '',
            start_time: '',
			end_time: '',
			todays_working_hours: '',
			break_duration_in_minutes: 0,
			todays_total_hours: '',
            note: '',
			currentPageReports: 1,
            dataPerPage: 10,
			fromDate: null,
			toDate: null,
			error: {
                report: '',
				start_time: '',
				end_time: '',
                break_duration_in_minutes: ''
			},
            loading: true,
            errorMessage: "",
            showError: false,
            showSuccess: false,
            successMessage: "",
            ButtonLoading: false,
            showDeleteModal: false,
            col: (window.user.role === "admin" || window.user.role === "super_admin") ? 3 : 4
        };
        this.reportMessageTimeout = null;
    }

    componentDidMount() {
        const today = moment().startOf('day').toDate();
        const yesterday = moment().subtract(1, 'days').startOf('day').toDate();
        
        this.setState({ 
            fromDate: yesterday,
            toDate: today 
        }, () => {
            this.fetchReports()
        });

        /** Get employees list */
        getService.getCall('get_employees.php', {
            action: 'view'
        })
            .then(data => {
                if (data.status === 'success') {
                    this.setState({ employeeData: data.data });
                } else {
                    this.setState({ error: data.message });
                }
            })
            .catch(err => {
                this.setState({ error: 'Failed to fetch data' });
            });

        // Check report message from route state
        const { state } = this.props.location;
        if (state?.message) {
            this.setState({ reportSuccess: state.message });

            this.reportMessageTimeout = setTimeout(() => {
                this.setState({ reportSuccess: "" });

                // Clear the message from history to avoid repeating
                this.props.history.replace({ ...this.props.location, state: {} });
            }, 5000);
        }

        // Listen for custom event
        window.addEventListener("reportMessage", this.handleReportMessage);
    }


    componentWillUnmount() {
        window.removeEventListener("reportMessage", this.handleReportMessage);

        // Clear timeout to avoid memory leaks
        if (this.reportMessageTimeout) {
            clearTimeout(this.reportMessageTimeout);
        }
    }

    handleReportMessage = (event) => {
        const { message, report } = event.detail;

        // Clone the report to avoid mutating the original
        const clonedReport = { ...report };

        // Add formatted time fields only if the original fields exist
        if (clonedReport.total_hours) {
            clonedReport.todays_total_hours = clonedReport.total_hours.split(" ")[1];
        }
        if (clonedReport.total_working_hours) {
            clonedReport.todays_working_hours = clonedReport.total_working_hours.split(" ")[1];
        }

        if (report) {
            this.setState(prevState => ({
                reports: [clonedReport, ...prevState.reports],
                reportSuccess: message
            }));
        }

        this.setState({ reportSuccess: message });

        if (message || report) {
            this.reportMessageTimeout = setTimeout(() => {
                this.setState({ reportSuccess: "" });
            }, 3000);
        }
    };

    /* setActivityIdState = (report) => {
        this.setState({ activityId: report.activity_id });
    }; */

    /* setStateForEditReportModel = (report) => {
        this.setState({ existingFullName: report.full_name, existingActivityType: report.activity_type, existingActivityDescription: report.description, existingActivityInTime: report.complete_in_time, existingActivityOutTime: report.complete_out_time, existingActivitySatus: report.status, existingActivityId: report.activity_id });
    }; */

    // Handle textarea input change admin
    handleEditActivityDescriptionChange = (event) => {
        this.setState({ existingActivityDescription: event.target.value });
    };

    // Handle in time input change admin
    handleEditActivityInTimeChange = (event) => {
        this.setState({ existingActivityInTime: event.target.value });
    };

    // Handle in out input change admin
    handleEditActivityOutTimeChange = (event) => {
        this.setState({ existingActivityOutTime: event.target.value });
    };

    // Handle status input change admin
    handleEditActivityStatusChange = (event) => {
        this.setState({ existingActivitySatus: event.target.value });
    };

    editReportByAdmin = () => {
        const { existingActivityDescription, existingActivityInTime, existingActivityOutTime, existingActivitySatus, existingActivityId, existingActivityType } = this.state;

        // Validate form inputs
        if (!existingActivityInTime) {
            this.setState({ editReportByAdminError: 'In-Time is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (!existingActivitySatus) {
            this.setState({ editReportByAdminError: 'Status is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'active' && existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please leave the Out-Time field empty when the status is set to Active!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'completed' && !existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please enter the Out-Time when the status is set to Completed' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivitySatus === 'auto closed' && !existingActivityOutTime) {
            this.setState({ editReportByAdminError: 'Please enter the Out-Time when the status is set to Auto Closed' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityInTime && existingActivityOutTime) {
            const inTimeDate = new Date(existingActivityInTime);
            const outTimeDate = new Date(existingActivityOutTime);
            if (outTimeDate <= inTimeDate) {
                this.setState({ editReportByAdminError: 'Out-Time must be later than In-Time.' });
                setTimeout(() => {
                    this.setState({ editReportByAdminError: null });
                }, 5000)
                return;
            }
        }
        if (existingActivityType === 'Punch' && existingActivityInTime && existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Punch-out Report/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityType === 'Break' && existingActivityInTime && !existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Break Reason/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }
        if (existingActivityType === 'Break' && existingActivityInTime && existingActivityOutTime && !existingActivityDescription) {
            this.setState({ editReportByAdminError: 'Break Reason/Description is required!' });
            setTimeout(() => {
                this.setState({ editReportByAdminError: null });
            }, 5000)
            return;
        }

        const formData = new FormData();
        formData.append('activity_id', existingActivityId);
        formData.append('description', existingActivityDescription);
        formData.append('in_time', existingActivityInTime);
        formData.append('out_time', existingActivityOutTime);
        formData.append('status', existingActivitySatus);
        formData.append('updated_by', window.user.id); //updated by admin
        formData.append('note', this.state.editNotes || '');

        // API call to add break
        getService.editCall('activities.php', 'report-by-admin', formData, null, null)
            .then((data) => {
                if (data.status === "success") {
                    this.setState({ reportSuccess: data.message });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    document.querySelector("#addReportModal .close").click();
                    this.componentDidMount();
                } else {
                    this.setState({ editReportByAdminError: data.message });
                    setTimeout(() => {
                        this.setState({ editReportByAdminError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
                this.setState({ editReportByAdminError: 'Something went wrong. Please try again.' });
                setTimeout(() => {
                    this.setState({ editReportByAdminError: null });
                }, 5000);
            });

    };

    deleteReport = () => {
        const { activityId } = this.state;

        // Validate form inputs
        if (!activityId) {
            this.setState({ reportError: 'Invalid Request' });
            setTimeout(() => {
                this.setState({ reportError: null });
            }, 5000)
            return;
        }

        // API call to add break
        getService.deleteCall('activities.php','delete', activityId, window.user.id, null, null)
            .then((data) => {
                if (data.status === "success") {
                    this.setState({ 
                        reportSuccess: data.message,
                        showDeleteModal: false,
                        activityId: null
                    });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    this.componentDidMount();
                } else {
                    this.setState({ reportError: data.message });
                    setTimeout(() => {
                        this.setState({ reportError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
                this.setState({ reportError: 'Something went wrong. Please try again.' });
                setTimeout(() => {
                    this.setState({ reportError: null });
                }, 5000);
            });
    };

    openDeleteModal = (activityId) => {
        this.setState({
            activityId: activityId,
            showDeleteModal: true
        });
    };

    closeDeleteModal = () => {
        this.setState({
            showDeleteModal: false,
            activityId: null
        });
    };

    // Handle dropdown change for employee
    handleEmployeeChange = (event) => {
        this.setState({ selectedReportEmployee: event.target.value });
    };

    // Handle dropdown change
    handleStatusChange = (event) => {
        this.setState({ selectedStatus: event.target.value });
    };

    // Handle textarea input change
    handleReportChange = (event) => {
        this.setState({ punchOutReport: event.target.value });
    };

    addReportByAdmin = () => {
        const { selectedEmployee, selectedStatus, punchOutReport } = this.state;

        // Validate form inputs
        if (!selectedEmployee && !selectedStatus) {
            this.setState({ addReportByAdminError: 'Please select an Employee and Status' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (!selectedEmployee) {
            this.setState({ addReportByAdminError: 'Please select an Employee' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (!selectedStatus) {
            this.setState({ addReportByAdminError: 'Please select a Status' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        if (selectedStatus === 'completed' && !punchOutReport) {
            this.setState({ addReportByAdminError: 'Please provide the punch-out report' });
            setTimeout(() => {
                this.setState({ addReportByAdminError: null });
            }, 5000)
            return;
        }

        const formData = new FormData();
        formData.append('employee_id', selectedEmployee);
        formData.append('activity_type', 'Punch');
        formData.append('description', punchOutReport);
        formData.append('status', selectedStatus);
        formData.append('created_by', window.user.id); //created by admin
        formData.append('updated_by', window.user.id); //updated by admin
        formData.append('note', this.state.editNotes);

        // API call to add break
        getService.addCall('activities.php','add-by-admin',formData )
            .then((data) => {
                if (data.status === "success") {
                    this.setState({ reportSuccess: data.message });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    document.querySelector("#addReportModal .close").click();
                    this.componentDidMount();
                } else {
                    this.setState({ addReportByAdminError: data.message });
                    setTimeout(() => {
                        this.setState({ addReportByAdminError: null });
                    }, 5000)
                }
            })
            .catch((error) => {
                this.setState({ addReportByAdminError: 'Something went wrong. Please try again.' });
                setTimeout(() => {
                    this.setState({ addReportByAdminError: null });
                }, 5000);
            });
    };

    parseTimeStringToDate = (timeString) => {
        const momentObj = moment(timeString, ["YYYY-MM-DD HH:mm", "hh:mm A"], true);
        
        if (!momentObj.isValid()) return null;
        
        return momentObj.toDate();
    };

    // Format date and time
    formatDateTimeAMPM = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return '';

        // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
        if (timeString.includes(' ')) {
            const parts = timeString.split(' ');
            timeString = parts[1]; // Extract the time part
        }

        // Use moment.js to parse the time string and format it in AM/PM format
        const formattedTime = moment(timeString, "HH:mm:ss").isValid()
            ? moment(timeString, "HH:mm:ss").format("hh:mm A")
            : moment(timeString, "HH:mm").format("hh:mm A");

        return formattedTime || '';
    };

    getTimeAsDate = (time) => {
        if (!time) return null;
    
        // Handle "2025-04-21 19:30" or just "10:30 AM"
        if (typeof time === 'string') {
            // If it includes date part, extract just the time
            if (time.includes(' ')) {
                const parts = time.split(' ');
                time = parts.length === 2 ? parts[1] : parts[0];  // Only keep the time part
            }

            // Use moment.js to parse the time and handle AM/PM
            const formattedTime = moment(time, ["HH:mm", "h:mm A"]);
            
            if (!formattedTime.isValid()) return null;  // If invalid, return null

            return formattedTime.toDate(); // Convert to JavaScript Date
        }

        if (time instanceof Date) return time;  // If it's already a Date, return it as is.

        return null;
    };    

    openReportModal = (report) => {
        this.setState({ 
            selectedModalReport: report,
            report: report.report || '',
            start_time: report.start_time ? report.start_time : null,
            break_duration_in_minutes: report.break_duration_in_minutes || 0,
            end_time: report.end_time ? report.end_time : null,
            todays_working_hours: report.todays_working_hours || '',
            todays_total_hours: report.todays_total_hours || '',
            report_id: report.id,
            employee_id: report.employee_id || '',
            editNotes: report.note || '',
        });
    };

    closeReportModal = () => {
        this.setState({ selectedModalReport: null });
    };

    handleChange = (field, value) => {
        const updatedState = {
            [field]: value,
            error: { ...this.state.error, [field]: "" },
        };
    
        const { start_time, end_time, break_duration_in_minutes } = this.state;
    
        // Get raw start and end values
        const rawStart = field === 'start_time' ? value : start_time;
        const rawEnd = field === 'end_time' ? value : end_time;
        const breakMinutes = field === 'break_duration_in_minutes'
            ? parseInt(value || 0, 10)
            : parseInt(break_duration_in_minutes || 0, 10);

        // Parse using moment.js
        const startDate = moment(rawStart, ["HH:mm", "h:mm A"]);
        const endDate = moment(rawEnd, ["HH:mm", "h:mm A"]);

        if (startDate.isValid() && endDate.isValid()) {
            const workingDuration = this.calculateWorkingHours(startDate, endDate, breakMinutes);
            const totalDuration = this.calculateWorkingHours(startDate, endDate, 0);
    
            updatedState.todays_working_hours = workingDuration;
            updatedState.todays_total_hours = totalDuration;
        }
    
        this.setState(updatedState);
    };    

    calculateWorkingHours = (start, end, breakMinutes) => {
        try {
            // Parse times using moment.js
            const startMoment = moment(start, ["HH:mm", "h:mm A"]);
            const endMoment = moment(end, ["HH:mm", "h:mm A"]);

            // Check if the parsed moments are valid
            if (!startMoment.isValid() || !endMoment.isValid()) return "00:00";
            
            // Default break minutes if not provided
            breakMinutes = parseInt(breakMinutes || 0);
            if (isNaN(breakMinutes)) breakMinutes = 0;

            // Calculate the duration in minutes
            let diff = endMoment.diff(startMoment, 'minutes'); // Duration in minutes

            if (diff < 0) {
                // If end time is earlier than start time, assume it's for the next day
                diff += 1440; // 24 hours in minutes
            }

            // Subtract break time from the total duration
            diff -= breakMinutes;
            if (diff < 0) diff = 0;

            // Calculate hours and minutes from the remaining duration
            const hours = Math.floor(diff / 60);
            const minutes = Math.round(diff % 60);

            // Return the formatted time
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        } catch (err) {
            console.error('Error calculating working hours:', err);
            return "00:00";
        }
    };


    formatToMySQLDateTime = (input) => {
        if (!input) return null;

        let date;

        // If input is a valid Date object
        if (input instanceof Date && !isNaN(input)) {
            date = moment(input);
        }
        // If input is a string
        else if (typeof input === 'string') {
            // Handle full datetime string: "2025-04-21 12:00"
            if (input.includes(' ')) {
                const [datePart, timePart] = input.split(' ');
                date = moment(`${datePart} ${timePart}`, 'YYYY-MM-DD HH:mm');
            }
            // Handle "HH:mm" or "HH:mm:ss"
            else if (input.includes(':')) {
                date = moment(input, 'HH:mm');
            } else {
                return null;
            }
        } else {
            return null;
        }

        // Format the output as 'HH:mm' (MySQL time format)
        return date.isValid() ? date.format('HH:mm') : null;
    };
        

    validateUpdateReportForm = () => {
		const { report, start_time, end_time, break_duration_in_minutes, todays_total_hours } = this.state;
		let error = {};
		let isValid = true;

		if (!report || report.trim() === "") {
			error.report = "Report is required.";
			isValid = false;
		}

		if (!start_time) {
			error.start_time = "Start time is required.";
			isValid = false;
		}

		if (!end_time) {
			error.end_time = "End time is required.";
			isValid = false;
		}

        if (start_time && end_time) {
            let start = typeof start_time === "string" ? new Date(start_time) : start_time;
            let end = typeof end_time === "string" ? new Date(end_time) : end_time;
        
            if (start.getTime() === end.getTime()) {
                error.start_time = "Start and end time cannot be the same.";
                error.end_time = "Start and end time cannot be the same.";
                isValid = false;
            } else if (start > end) {
                error.start_time = "Start time must be before end time.";
                error.end_time = "End time must be after start time.";
                isValid = false;
            }
        }

        // Break duration validation
		if (todays_total_hours) {
			const [hrs, mins] = todays_total_hours.split(":").map(Number);
			const totalMinutes = hrs * 60 + mins;
			const breakMinutes = parseInt(break_duration_in_minutes || 0, 10);

			if (breakMinutes > totalMinutes) {
				error.break_duration_in_minutes = "Break duration cannot exceed the total hours.";
				isValid = false;
			}
		}

		this.setState({ error });
		return isValid;
	};

    updateReport = () => {
        // e.preventDefault();
        if (!this.validateUpdateReportForm()) {
            return;
        }

        const { report_id, report, start_time, break_duration_in_minutes, end_time, todays_working_hours, todays_total_hours, editNotes, selectedReport } = this.state;
		const formData = new FormData();
        const finalStartTime = start_time || selectedReport.start_time;
        const finalEndTime = end_time || selectedReport.end_time;
        formData.append("report", report);
        formData.append("start_time", this.formatToMySQLDateTime(finalStartTime));
        formData.append("end_time", this.formatToMySQLDateTime(finalEndTime));
        formData.append("break_duration_in_minutes", break_duration_in_minutes);
        formData.append("todays_working_hours", todays_working_hours);
        formData.append("todays_total_hours", todays_total_hours);
        formData.append("logged_in_employee_role", window.user.role);
        formData.append("note", editNotes || '');

		// API call to save the report and punch-out
        getService.editCall('reports.php', 'update-report-by-user', formData, report_id, null)
        .then((data) => {
            if (data.status === "success") {
                this.setState({
					successMessage: data.message,
					showSuccess: true,
					isPunchedIn: false, 
                    showModal: false, 
                    report: ''
				});

                this.fetchReports();
                document.querySelector("#editpunchOutReportModal .close").click();
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: data.message,
                    showError: true,
                    showSuccess: false,
                });
               setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
                this.setState({
                    errorMessage: 'Something went wrong. Please try again.',
                    showError: true,
                    showSuccess: false,
                });
                setTimeout(this.dismissMessages, 3000);
        });
	};

    fetchReports = () => {
        const { fromDate, toDate, selectedReportEmployee } = this.state;
        getService.getCall('reports.php', {
            action: 'view',
            user_id:selectedReportEmployee,
            from_date: moment(fromDate).format('YYYY-MM-DD'),
            to_date: moment(toDate).format('YYYY-MM-DD')
        })
        .then(data => {
            if (data.status === 'success') {

                this.setState({ 
                        reports: data.data,
                        filteredReports: data.data,
                        loading: false,
                        currentPageReports: 1, 
                        error: { ...this.state.error, report: '' }
                    });
                
            }else {
                if (data.message === 'Reports not available.') {
                    this.setState({
                        reports: [],
                        filteredReports: [],
                        loading: false,
                    });
                } else {
                    this.setState({ 
                        errorMessage: data.message || 'Failed to fetch reports',
                        showError: true,
                        loading: false,
                        reports: [],
                        filteredReports: []
                    });
                    setTimeout(this.dismissMessages, 3000);
                }
            }
        });
    }

    // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
            error: { report: '', start_time: '', end_time: '', break_duration_in_minutes: '' },
        });
    };

    // Get the todays date and based on this update the edit report button
    isToday = (dateString) => {
        const inputDate = moment(dateString);
        const today = moment().startOf('day'); // Set the time part to 00:00:00 for comparison
        
        return inputDate.isSame(today, 'day');
    };

    // Handle Pagination of employee listing and employee leaves listing
	handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.reports.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPageReports: newPage });
        }
	};

    // Add new method for handling date changes
    handleDateChange = (date, type) => {
        if (date) {
            const newDate = new Date(date);
            if (type === 'fromDate') {
                this.setState({ fromDate: newDate });
               
            } else if (type === 'toDate') {
                this.setState({ toDate: newDate });
            }
         
        } else {
            this.setState({ [type]: null });
        }
    };

    handleApplyFilters = () => {
        this.setState({ ButtonLoading: true });
        this.fetchReports();
        this.setState({ ButtonLoading: false });
    };

    handleNotesChange = (e) => {
    this.setState({ editNotes: e.target.value });
    }

    render() {
        const { fixNavbar } = this.props;
        const { 
            reports, 
            employeeData, 
            selectedStatus, 
            selectedEmployee, 
            selectedReportEmployee,
            punchOutReport, 
            reportError, 
            reportSuccess, 
            addReportByAdminError, 
            existingFullName, 
            existingActivityType, 
            existingActivityDescription, 
            existingActivityInTime, 
            existingActivityOutTime, 
            existingActivitySatus, 
            editReportByAdminError, 
            loading, 
            start_time, 
            todays_total_hours, 
            break_duration_in_minutes, 
            todays_working_hours, 
            end_time, 
            currentPageReports, 
            dataPerPage,
            fromDate,
            toDate,
            filteredReports,
            selectedModalReport,
            showSuccess, 
            successMessage, 
            showError, 
            errorMessage,
            showDeleteModal
        } = this.state;

        // Handle empty employee data safely
        const reportList = (filteredReports || reports || []).length > 0 ? (filteredReports || reports) : [];

        // Pagination Logic for Reports
        const indexOfLastReport = currentPageReports * dataPerPage;
        const indexOfFirstReport = indexOfLastReport - dataPerPage;
        const currentReports = reportList.slice(indexOfFirstReport, indexOfLastReport);
        const totalPagesReports = Math.ceil(reportList.length / dataPerPage);

        return (
            <>  
                <AlertMessages
                    showSuccess={showSuccess}
                    successMessage={successMessage}
                    showError={showError}
                    errorMessage={errorMessage}
                    setShowSuccess={(val) => this.setState({ showSuccess: val })}
                    setShowError={(val) => this.setState({ showError: val })}
                />
                <div>
                    <div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
                        <div className="container-fluid">
                            <div className="d-flex justify-content-between align-items-center">
                                <ul className="nav nav-tabs page-header-tab">
                                </ul>
                                {/* {window.user && window.user.role !== 'employee' && (
                                    <div className="header-action d-md-flex">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addReportModal"><i className="fe fe-plus mr-2" />Add</button>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                    <div className="section-body mt-3">
                        <div className="container-fluid">
                            <div className="tab-content mt-3">
                                <div className="tab-pane fade show active" id="Report-Invoices" role="tabpanel">
                                    <div className="card">
                                        <div className="card-header">
                                            <div className="row">
                                                <DateFilterForm
                                                    fromDate={fromDate}
                                                    toDate={toDate}
                                                    selectedEmployee={selectedReportEmployee}
                                                    allEmployeesData={employeeData}
                                                    ButtonLoading={this.state.ButtonLoading}
                                                    handleDateChange={this.handleDateChange}
                                                    handleEmployeeChange={this.handleEmployeeChange}
                                                    handleApplyFilters={this.handleApplyFilters}
                                                    minDate={fromDate}
                                                    maxDate={new Date()}
                                                    col={this.state.col}
                                                />
											</div>
                                        </div>

                                        {/* Display activity success message outside the modal */}
                                        {reportSuccess && (
                                            <div className="alert alert-success mb-0">{reportSuccess}</div>
                                        )}
                                        {/* Display activity error message outside the modal */}
                                        {reportError && (
                                            <div className="alert alert-danger mb-0">{reportError}</div>
                                        )}
                                        <ReportTable 
                                            currentReports={currentReports}
                                            loading={loading}
                                            formatDateTimeAMPM={this.formatDateTimeAMPM}
                                            isToday={this.isToday}
                                            openReportModal={this.openReportModal}
                                        />
                                    </div>

                                    {/* Only show pagination if there are reports */}
                                    {totalPagesReports > 1 && (
                                        <Pagination
                                            currentPage={currentPageReports}
                                            totalPages={totalPagesReports}
                                            onPageChange={this.handlePageChange}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Modal for viewing report details */}
                    <ViewReportModal 
                        selectedModalReport={selectedModalReport}
                        formatDateTimeAMPM={this.formatDateTimeAMPM}
                        closeReportModal={this.closeReportModal}
                    />

                    {/* Edit Report Modal for employees */}
                    <EditReportModal 
                        selectedModalReport={selectedModalReport}
                        start_time={start_time}
                        end_time={end_time}
                        break_duration_in_minutes={break_duration_in_minutes}
                        todays_working_hours={todays_working_hours}
                        todays_total_hours={todays_total_hours}
                        report={this.state.report}
                        error={this.state.error}
                        getTimeAsDate={this.getTimeAsDate}
                        handleChange={this.handleChange}
                        handleNotesChange={this.handleNotesChange}
                        closeReportModal={this.closeReportModal}
                        updateReport={this.updateReport}
                        editNotes={this.state.editNotes}
                    />
    
                    {/* Modal for deleting report details */}
                    <DeleteModal
                        show={this.state.showDeleteModal}
                        onConfirm={this.deleteReport}
                        onClose={this.closeDeleteModal}
                        isLoading={this.state.ButtonLoading}
                        deleteBody='Are you sure you want to delete this Record?'
                        modalId="deleteReportModal"
                    />
                    {/* Add Break Modal */}
                    <AddBreakModal 
                        selectedEmployee={selectedEmployee}
                        selectedStatus={selectedStatus}
                        punchOutReport={punchOutReport}
                        employeeData={employeeData}
                        addReportByAdminError={addReportByAdminError}
                        handleEmployeeChange={this.handleEmployeeChange}
                        handleStatusChange={this.handleStatusChange}
                        handleReportChange={this.handleReportChange}
                        addReportByAdmin={this.addReportByAdmin}
                    />

                    {/* Modal for edit report details */}
                    <EditReportDetailsModal 
                        existingFullName={existingFullName}
                        existingActivityType={existingActivityType}
                        existingActivityDescription={existingActivityDescription}
                        existingActivityInTime={existingActivityInTime}
                        existingActivityOutTime={existingActivityOutTime}
                        existingActivitySatus={existingActivitySatus}
                        editReportByAdminError={editReportByAdminError}
                        handleEditActivityDescriptionChange={this.handleEditActivityDescriptionChange}
                        handleEditActivityInTimeChange={this.handleEditActivityInTimeChange}
                        handleEditActivityOutTimeChange={this.handleEditActivityOutTimeChange}
                        handleEditActivityStatusChange={this.handleEditActivityStatusChange}
                        editReportByAdmin={this.editReportByAdmin}
                    />
                </div>
                {/* Add the alert for error messages */}
                <div 
                    className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {this.state.errorMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showError: false })}
                    >
                    </button>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Report);