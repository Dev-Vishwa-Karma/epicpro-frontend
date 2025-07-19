import React, { Component } from 'react'
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AlertMessages from '../../common/AlertMessages';
import TextEditor from '../../common/TextEditor';
import { getService } from '../../../services/getService';
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
        };
        this.reportMessageTimeout = null;
    }

    componentDidMount() {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Set to start of day
        today.setHours(0, 0, 0, 0); // Set to start of day
        
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
        formData.append('note', this.state.editNotes);

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
                    this.setState({ reportSuccess: data.message });
                    setTimeout(() => {
                        this.setState({ reportSuccess: null });
                    }, 5000)
                    // Close the modal
                    document.querySelector("#deleteReportModal .close").click();
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
        // Handles both "10:30 AM" and "2025-04-21 10:30"
        const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!ampmMatch) return null;
        let hours = parseInt(ampmMatch[1]);

        const minutes = parseInt(ampmMatch[2]);
        const ampm = ampmMatch[3]?.toUpperCase();

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    };

    // Format date and time
    formatDateTimeAMPM = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return '';

        // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
        if (timeString.includes(' ')) {
            const parts = timeString.split(' ');
            timeString = parts[1]; // Extract the time part
        }

        const [hours, minutes, seconds = '00'] = timeString.split(':');
        const now = new Date();

        now.setHours(parseInt(hours, 10));
        now.setMinutes(parseInt(minutes, 10));
        now.setSeconds(parseInt(seconds, 10));
        now.setMilliseconds(0);

        if (isNaN(now.getTime())) {
            console.warn("Invalid time format:", timeString);
            return '';
        }

        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    getTimeAsDate = (time) => {
        if (!time) return null;
    
        // Handle "2025-04-21 19:30" or just "10:30 AM"
        if (typeof time === 'string') {
            // If it includes date part, extract just the time
            if (time.includes(' ')) {
                const parts = time.split(' ');
                const timePart = parts.length === 2 ? parts[1] : parts[0];
                time = timePart;
            }
    
            // Handle AM/PM
            const ampmMatch = time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if (!ampmMatch) return null;
    
            let hours = parseInt(ampmMatch[1]);
            const minutes = parseInt(ampmMatch[2]);
            const ampm = ampmMatch[3]?.toUpperCase();
    
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
    
            const now = new Date();
            now.setHours(hours);
            now.setMinutes(minutes);
            now.setSeconds(0);
            now.setMilliseconds(0);
    
            return now;
        }
    
        if (time instanceof Date) return time;
    
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

        // Parse using consistent utility
        const startDate = this.getTimeAsDate(rawStart);
        const endDate = this.getTimeAsDate(rawEnd);
    
        if (startDate && endDate) {
            const workingDuration = this.calculateWorkingHours(startDate, endDate, breakMinutes);
            const totalDuration = this.calculateWorkingHours(startDate, endDate, 0);
    
            updatedState.todays_working_hours = workingDuration;
            updatedState.todays_total_hours = totalDuration;
        }
    
        this.setState(updatedState);
    };    

    calculateWorkingHours = (start, end, breakMinutes) => {
		try {
            start = this.getTimeAsDate(start);
            end = this.getTimeAsDate(end);

			if (!(start instanceof Date) || isNaN(start)) return "00:00";
			if (!(end instanceof Date) || isNaN(end)) return "00:00";
	
			breakMinutes = parseInt(breakMinutes || 0);
			if (isNaN(breakMinutes)) breakMinutes = 0;
	
			// Remove seconds/milliseconds for cleaner diff
			start.setSeconds(0, 0);
			end.setSeconds(0, 0);
	
			let diff = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
	
			if (diff < 0) diff += 1440;
			diff -= breakMinutes;
			if (diff < 0) diff = 0;
	
			const hours = Math.floor(diff / 60);
			const minutes = Math.round(diff % 60);
	
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		} catch (err) {
			return "00:00";
		}
	};

    formatToMySQLDateTime = (input) => {
        const pad = (n) => n.toString().padStart(2, '0');
        let date;
    
        if (input instanceof Date && !isNaN(input)) {
            date = input;
        } else if (typeof input === 'string') {
            if (input.includes(' ')) {
                // Handle full datetime string: "2025-04-21 12:00"
                const [, timePart] = input.split(' ');
                const [hours, minutes] = timePart.split(':').map(Number);
                date = new Date();
                date.setHours(hours || 0);
                date.setMinutes(minutes || 0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else if (input.includes(':')) {
                // Handle "HH:mm" or "HH:mm:ss"
                const [hours, minutes] = input.split(':').map(Number);
                date = new Date();
                date.setHours(hours || 0);
                date.setMinutes(minutes || 0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            } else {
                return null;
            }
        } else {
            return null;
        }
    
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
        formData.append("note", editNotes);

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
    
        const formatDate = (date) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const day = String(date.getDate()).padStart(2, '0'); 
            return `${year}-${month}-${day}`; 
        };

        getService.getCall('reports.php', {
            action: 'view',
            user_id:selectedReportEmployee,
            from_date:formatDate(fromDate),
            to_date:formatDate(toDate)
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
        const inputDate = new Date(dateString);
        const today = new Date();
    
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };

    // Handle Pagination of employee listing and employee leaves listing
	handlePageChange = (newPage, listType) => {
		if (listType === 'reports') {
			const totalPages = Math.ceil(this.state.reports.length / this.state.dataPerPage);
			if (newPage >= 1 && newPage <= totalPages) {
				this.setState({ currentPageReports: newPage });
			}
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
            errorMessage
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
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label className="form-label">From Date</label>
                                                            <DatePicker
                                                                selected={fromDate}
                                                                onChange={(date) => this.handleDateChange(date, 'fromDate')}
                                                                className="form-control"
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="From Date"
                                                                maxDate={new Date()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label className="form-label">To Date</label>
                                                            <DatePicker
                                                                selected={toDate}
                                                                onChange={(date) => this.handleDateChange(date, 'toDate')}
                                                                className="form-control"
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="To Date"
                                                                minDate={fromDate}
                                                                maxDate={new Date()}
                                                            />
                                                        </div>
                                                    </div>
                                                    {window.user && (window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label className="form-label">Select Employee</label>
                                                            <select 
                                                                className="form-control" 
                                                                value={selectedReportEmployee} 
                                                                onChange={this.handleEmployeeChange}
                                                            >
                                                                <option value="">All Employees</option>
                                                                {employeeData
                                                                    .filter(employee => {
                                                                        const role = (employee.role || '').toLowerCase();
                                                                        return role !== 'admin' && role !== 'super_admin';
                                                                    })
                                                                    .map((employee) => (
                                                                        <option key={employee.id} value={employee.id}>
                                                                            {employee.first_name} {employee.last_name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                    </div> 
                                                    )}
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label className="form-label">&nbsp;</label>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-primary btn-block"
                                                                onClick={this.handleApplyFilters}
                                                                disabled={this.state.ButtonLoading}
                                                            >
                                                                {this.state.ButtonLoading ? (
                                                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                                ) : null}
                                                                Apply
                                                            </button>
                                                        </div>
                                                    </div>
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
                                        <div className="card-body">
                                            {loading ? (
												<div className="dimmer active p-3">
													<div className="loader" />
												</div>
											) : (
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-striped table-vcenter mb-0">
                                                        <thead>
                                                            <tr>
                                                                {window.user && window.user.role !== 'employee' && (
                                                                    <th>Employee Name</th>
                                                                )}
                                                                <th>Date</th>
                                                                <th>Start Time</th>
                                                                <th>Break Duration</th>
                                                                <th>End Time</th>
                                                                <th>Working Hours</th>
                                                                <th>Total Hours</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentReports.length > 0 ? (
                                                                currentReports.map((report, index) => (
                                                                    <tr key={index}>
                                                                        {window.user && window.user.role !== 'employee' && (
                                                                            <td>{report.full_name}</td>
                                                                        )}
                                                                        <td>
                                                                        {report.created_at && !isNaN(new Date(report.created_at).getTime())
                                                                        ? new Intl.DateTimeFormat('en-US', {
                                                                            day: '2-digit',
                                                                            month: 'short',
                                                                            year: 'numeric',
                                                                        }).format(new Date(report.created_at))
                                                                        : 'N/A'}
                                                                        </td>
                                                                        <td>{this.formatDateTimeAMPM(report.start_time)}</td>
                                                                        <td>{report.break_duration_in_minutes} Mins</td>
                                                                        <td>{this.formatDateTimeAMPM(report.end_time)}</td>
                                                                        <td>{report.todays_working_hours?.slice(0, 5)}</td>
                                                                        <td>{report.todays_total_hours?.slice(0, 5)}</td>
                                                                        <td width="15%">
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-icon btn-sm" 
                                                                                title="View" 
                                                                                data-toggle="modal" 
                                                                                data-target="#viewpunchOutReportModal" 
                                                                                onClick={() => this.openReportModal(report)}
                                                                            >
                                                                                <i className="icon-eye text-danger"></i>
                                                                            </button>

                                                                            {/* Admin/Super Admin can edit any report */}
                                                                            {window.user && (window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-icon btn-sm"
                                                                                    title="Edit"
                                                                                    data-toggle="modal"
                                                                                    data-target="#editpunchOutReportModal"
                                                                                    onClick={() => this.openReportModal(report)}
                                                                                >
                                                                                    <i className="icon-pencil text-primary"></i>
                                                                                </button>
                                                                            )}

                                                                            {/* Employee can edit only today's report */}
                                                                            {window.user && window.user.role === 'employee' && this.isToday(report.created_at) && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    className="btn btn-icon btn-sm"
                                                                                    title="Edit"
                                                                                    data-toggle="modal" 
                                                                                    data-target= "#editpunchOutReportModal"
                                                                                    onClick={() => this.openReportModal(report)}
                                                                                >
                                                                                    <i className="icon-pencil text-danger"></i>
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="8" style={{ textAlign: 'center' }}>
                                                                        No reports available
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Only show pagination if there are reports */}
                                    {totalPagesReports > 1 && (
                                        <nav aria-label="Page navigation">
                                            <ul className="pagination mb-0 justify-content-end">
                                                <li className={`page-item ${currentPageReports === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => this.handlePageChange(currentPageReports - 1, 'reports')}>
                                                        Previous
                                                    </button>
                                                </li>
                                                {[...Array(totalPagesReports)].map((_, i) => (
                                                    <li key={i} className={`page-item ${currentPageReports === i + 1 ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => this.handlePageChange(i + 1, 'reports')}>
                                                            {i + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPageReports === totalPagesReports ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => this.handlePageChange(currentPageReports + 1, 'reports')}>
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Modal for viewing report details */}
                    <div className="modal fade" id="viewpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="viewpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    {selectedModalReport && typeof selectedModalReport === 'object' && selectedModalReport.report != null ? (
                                        <div className="row">
                                            {window.user && window.user.role !== 'employee' && (
                                                <div className="col-md-12 mb-3">
                                                    <strong>Employee Name:</strong> {selectedModalReport.full_name}
                                                </div>
                                            )}
                                            <div className="col-md-12 mb-4">
                                                <div
                                                    className="multiline-text"
                                                    dangerouslySetInnerHTML={{ __html: selectedModalReport?.report || '' }}
                                                />
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Start Time:</strong> {this.formatDateTimeAMPM(selectedModalReport.start_time)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>End Time:</strong> {this.formatDateTimeAMPM(selectedModalReport.end_time)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Break Duration:</strong> {selectedModalReport.break_duration_in_minutes} Mins
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Working Hours:</strong> {selectedModalReport.todays_working_hours?.slice(0, 5)}
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <strong>Total Hours:</strong> {selectedModalReport.todays_total_hours?.slice(0, 5)}
                                            </div>
                                            {
                                                selectedModalReport.note !== null &&
                                                <div className="col-md-12 p-3 mb-2 alert alert-danger alert-dismissible fade show">
                                                    <strong>Note:</strong> {selectedModalReport.note}
                                                </div>
                                            }
                                        </div>
                                    ) : (
                                        <p>No report data available.</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeReportModal}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Report Modal for employees */}
                    <div className="modal fade" id="editpunchOutReportModal" tabIndex={-1} role="dialog" aria-labelledby="editpunchOutReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog modal-xl" role="document">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title" id="editpunchoutReportModalLabel">Update Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeReportModal}>
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                    {/* Edit Modal */}
                                <div className="modal-body">
                                    <div className="row">

                                        {/* Left side - Report TextArea */}
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <TextEditor
                                                    name="report"
                                                    value={this.state.report || ''}
                                                    onChange={(value) => this.handleChange('report', value)}
                                                    error={this.state.error?.report}
                                                    />
                                            </div>
                                        </div>

                                        {/* Right side - Form fields */}
                                        <div className="col-md-6">
                                            <div className="row">

                                                    {/* Start time */}
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="event_name">Start time</label>
                                                            <DatePicker
                                                            selected={this.getTimeAsDate(start_time)}
                                                            onChange={(time) => this.handleChange('start_time', time)}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={15}
                                                            timeCaption="Start time"
                                                            dateFormat="h:mm aa"
                                                            placeholderText="Select time"
                                                            className={`form-control ${this.state.error?.start_time ? "is-invalid" : ""}`}
                                                            readOnly
                                                            />
                                                            {this.state.error?.start_time && (
                                                            <div className="invalid-feedback d-block">{this.state.error.start_time}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Break duration */}
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="break_duration_in_minutes">Break duration in minutes</label>
                                                            <input
                                                            readOnly
                                                            disabled
                                                            type="number"
                                                            value={break_duration_in_minutes || 0}
                                                            onChange={(e) => this.handleChange('break_duration_in_minutes', e.target.value)}
                                                            />
                                                            {this.state.error?.break_duration_in_minutes && (
                                                            <div className="invalid-feedback">{this.state.error.break_duration_in_minutes}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* End time */}
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="event_name">End time</label>
                                                            <DatePicker
                                                            selected={this.getTimeAsDate(end_time)}
                                                            onChange={(time) => this.handleChange('end_time', time)}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={15}
                                                            timeCaption="End time"
                                                            dateFormat="h:mm aa"
                                                            placeholderText="Select End time"
                                                            className={`form-control ${this.state.error?.end_time ? "is-invalid" : ""}`}
                                                            disabled={window.user.role !== 'admin' && window.user.role !== 'super_admin'}
                                                            />
                                                            {this.state.error?.end_time && (
                                                            <div className="invalid-feedback d-block">{this.state.error.end_time}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Today's working hours */}
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="todays_working_hours">Today's working hours</label>
                                                            <input
                                                            type="text"
                                                            className="form-control"
                                                            name="todays_working_hours"
                                                            id="todays_working_hours"
                                                            placeholder="Today's working hours"
                                                            value={todays_working_hours?.slice(0, 5) || ''}
                                                            readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Today's total hours */}
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="todays_total_hours">Today's total hours</label>
                                                            <input
                                                            type="text"
                                                            className="form-control"
                                                            name="todays_total_hours"
                                                            id="todays_total_hours"
                                                            placeholder="Today's total hours"
                                                            value={todays_total_hours?.slice(0, 5) || ''}
                                                            readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        {(window.user.role === 'admin' || window.user.role === 'super_admin') && (
                                                            <div className="form-group">
                                                                <label className="form-label"><strong>Note</strong></label>
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="3"
                                                                    placeholder="Add note for this update..."
                                                                    name="note"
                                                                    id="note"
                                                                    value={this.state.editNotes}
                                                                    onChange={this.handleNotesChange}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeReportModal}>Close</button>
                                    <button type="button" className="btn btn-primary" onClick={this.updateReport}>Update Report</button>
                                </div>

                            </div>
                        </div>
                    </div>
    
                    {/* Modal for deleting report details */}
                    <div className="modal fade" id="deleteReportModal" tabIndex={-1} role="dialog" aria-labelledby="deleteReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteReportModal">Delete</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        Are you sure you want to delete this Record?
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={this.deleteReport}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add Break Modal */}
                    <div className="modal fade" id="addReportModal" tabIndex={-1} role="dialog" aria-labelledby="addReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="addReportModalLabel">Register Employee Punch-In/Out</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    {/* Display activity error message outside the modal */}
                                    {addReportByAdminError && (
                                        <div className="alert alert-danger mb-0">{addReportByAdminError}</div>
                                    )}
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <select className="form-control" value={selectedEmployee} onChange={this.handleEmployeeChange}>
                                                    <option value="">Select Employee</option>
                                                    {employeeData.length > 0 ? (
                                                        employeeData.map((employee, index) => (
                                                            <option key={index} value={employee.id}>
                                                                {`${employee.first_name} ${employee.last_name}`}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="">No Employees Available</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <select className="form-control" value={selectedStatus} onChange={this.handleStatusChange}>
                                                    <option value="">Select Status</option>
                                                    <option value="active">Punch In</option>
                                                    <option value="completed">Punch Out</option>
                                                </select>
                                            </div>
                                        </div>
                                        {selectedStatus === "completed" && (
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Report"
                                                        value={punchOutReport || ''}
                                                        onChange={this.handleReportChange}
                                                        rows="30"
                                                        cols="50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.addReportByAdmin}>Save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal for edit report details */}
                    <div className="modal fade" id="editReportModal" tabIndex={-1} role="dialog" aria-labelledby="editReportModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                        <div className="modal-dialog" role="dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editReportModal">Edit Report</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                {/* Display activity error message outside the modal */}
                                {editReportByAdminError && (
                                    <div className="alert alert-danger mb-0">{editReportByAdminError}</div>
                                )}
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Employee</label>
                                                <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." readOnly value={existingFullName} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Activity Type</label>
                                                <input type="text" className="form-control" name="example-disabled-input" placeholder="Disabled.." value={existingActivityType} readOnly/>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    placeholder="Description"
                                                    value={existingActivityDescription}
                                                    rows="10"
                                                    cols="50"
                                                    onChange={this.handleEditActivityDescriptionChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">In Time</label>
                                                <input type="text" className="form-control" value={existingActivityInTime} onChange={this.handleEditActivityInTimeChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Out Time</label>
                                                <input type="text" className="form-control" value={existingActivityOutTime || ''} onChange={this.handleEditActivityOutTimeChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="form-label">Status</label>
                                                <select className="form-control" value={existingActivitySatus} onChange={this.handleEditActivityStatusChange}>
                                                    <option value="">Select Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="auto closed">Auto Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.editReportByAdmin}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
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