import React, { Component } from 'react';
import { connect } from 'react-redux';
import Fullcalender from '../../../common/fullcalender';
import ReportModal from '../../Report/ReportModal';
import ActivitiesTime from '../../Activities/elements/ActivitiesTime';
import AlertMessages from '../../../common/AlertMessages';
import { getService } from '../../../../services/getService';
import { validateFields } from '../../../common/validations';
import DateFilterForm from '../../../common/DateFilterForm';
import InputField from '../../../common/formInputs/InputField';
import CheckboxGroup from '../../../common/formInputs/CheckboxGroup';
import { getToday, formatDate } from '../../../../utils';
import Button from '../../../common/formInputs/Button';
import { withRouter } from 'react-router-dom'; 


import { PASSWORD_SENTINEL as PASSWORD_STRING } from '../../../../utils';
class CalendarWithTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employee: {
                first_name: "",
                last_name: "",
                email: "",
                mobile_no1: "",
                mobile_no2: "",
                password: PASSWORD_STRING,
                gender: "",
                dob: "",
                address_line1: "",
                address_line2: "",
                about_me: "",
                department_id: "",
                joining_date: "",
                emergency_contact1: '',
                emergency_contact2: '',
                emergency_contact3: '',
            },
            skillsFrontend: [],
            skillsBackend: [],
            departments: [],
            employeeId: null,
            selectedImage: null,
            previewImage: null,
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            activeTab: this.props.activeTab || "calendar",
            activities: [],
            reports: [],
            leaves: [],
            calendarEventsData: [],
            showReportModal: false,
            selectedReport: null,
            alternateSatudays: [],
            images: [],
            filterFromDate: getToday(),
            filterToDate: getToday(),
            errors: {},
            col: (window.user.role === "admin" || window.user.role === "super_admin") ? 2 : 2,
            showPassword: false,
            passwordCleared: false,
        };
        localStorage.removeItem('empId');
        localStorage.removeItem('startDate');
        localStorage.removeItem('eventStartDate');
        localStorage.removeItem('eventEndDate');
        localStorage.removeItem('endDate');
        localStorage.removeItem('defaultView');

        // Create refs for form fields for error scrolling
        this.fieldRefs = {
            first_name: React.createRef(),
            last_name: React.createRef(),
            email: React.createRef(),
            gender: React.createRef(),
            department_id: React.createRef(),
            dob: React.createRef(),
            joining_date: React.createRef(),
            mobile_no1: React.createRef(),
            mobile_no2: React.createRef(),
            emergency_contact1: React.createRef(),
            emergency_contact2: React.createRef(),
            emergency_contact3: React.createRef(),
            password: React.createRef(),
        };
    }

    onTogglePassword = () => {
        this.setState(prev => ({ showPassword: !prev.showPassword }));
    }
    componentDidMount() {
        if (this.props.activeTab && this.props.activeTab !== this.state.activeTab) {
            this.setState({ activeTab: this.props.activeTab });
        }
    }

    // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    componentDidUpdate(prevProps) {
        if (prevProps.employeeId !== this.props.employeeId) {
            this.setState({
                employeeId: this.props.employeeId
            })
            this.setState({ activeTab: this.props.activeTab })
            if (this.props.employeeId) {
                this.fetchEmployeeDetails(this.props.employeeId);
                this.getDepartments();
                this.handleApplyFilter();
            }
        }
        // Sync when only tab changes
        if (prevProps.activeTab !== this.props.activeTab && this.props.activeTab !== this.state.activeTab) {
            this.setState({ activeTab: this.props.activeTab || 'profile' });
        }
    }

    getDepartments = () => {
        // Get department data from departments table
         getService.getCall('departments.php', {
            action: 'view'
        })
            .then(data => {
                this.setState({ departments: data.data });
            })
            .catch(error => console.error("Error fetching departments:", error));
    }

    generateCalendarEvents = (reports, leaves) => {
        const missingReportEvents = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Determine which reports to check based on employeeId in state
        let reportsForMissing = reports;
        let startDate;
        let endDate;

        const date = new Date();
        const year = date.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        const tformatDate = (date) => date.toISOString().split('T')[0];
        startDate = tformatDate(firstDay);
        endDate = tformatDate(lastDay);
        const employeeLeavesData = [];
        let currentDate = new Date(startDate);


        // 1. Working Hours Events
        const totalWorkingHours = reports.map(report => {
            const hoursStr = report.todays_working_hours?.slice(0, 5);
            const hours = parseFloat(hoursStr);

            let className = "daily-report";
            if (hours < 4) className = "red-event";
            else if (hours >= 4 && hours < 8) className = "half-day-leave-event";

            return {
                title: `${hoursStr}`, // Display hours
                start: report.created_at?.split(" ")[0],
                display: "background", // Render as background event
                allDay: true,
                className: className, // Use the className based on hours
                report: report // Store the full report object directly
            };
        }).flat();

        leaves.filter(leave => leave.status === 'approved').forEach((leave) => {
            const start = new Date(leave.from_date);
            const end = new Date(leave.to_date);
            if (end >= today) {
                const loopStart = start < today ? new Date(today) : new Date(start);
                for (let d = new Date(loopStart); d <= end; d.setDate(d.getDate() + 1)) {
                    if (d >= today) {
                        if (leave.is_half_day === "1") {
                            employeeLeavesData.push({
                                title: '',
                                start: d.toISOString().split("T")[0],
                                className: "half-day-leave-event",
                                allDay: true,
                            });
                        } else {
                            employeeLeavesData.push({
                                title: '',
                                start: d.toISOString().split("T")[0],
                                className: "leave-event",
                                allDay: true,
                            });
                        }
                    }
                }
            }
        });

        while (formatDate(currentDate) < formatDate(today) && formatDate(currentDate) <= formatDate(endDate)) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const hasReport = reportsForMissing.some((report) => report.created_at?.split(" ")[0] === dateStr);
            if (!hasReport) {
                missingReportEvents.push({
                    start: dateStr,
                    display: 'background',
                    color: '#ff6b6b',
                    allDay: true,
                    className: 'missing-report-day',
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Merge all events
        const calendarEvents = [
            ...totalWorkingHours,
            ...employeeLeavesData,
            ...missingReportEvents,
        ];
        return calendarEvents;
    }

    getAlternateSaturday = async () => {
        const now = localStorage.getItem('startDate') ? new Date(localStorage.getItem('startDate')) : new Date();
        try {
            const res = await getService.getCall('alternate_saturdays.php', {
                action: 'view',
                year: now.getFullYear()
            });
            this.setState({
                alternateSatudays: res && res.data ? res.data : []
            });

        } catch (error) {
            console.error("Failed to fetch saved Saturdays:", error);
        }
    }

    loadEmployeeData = () => {
        let employeeId = this.props.employeeId;

        if (!employeeId) {
            employeeId = localStorage.getItem('empId');
        }
        let startDate = localStorage.getItem('startDate');
        let endDate = localStorage.getItem('endDate');

        if (!startDate || !endDate) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
            const tformatDate = (date) => date.toISOString().split('T')[0];
            startDate = tformatDate(firstDay);
            endDate = tformatDate(lastDay);
        }
        const currentEmployeeId = employeeId;

        if (currentEmployeeId) {
            getService.getCall('reports.php', {
                        action: 'view',
                        user_id: currentEmployeeId,
                        from_date:startDate,
                        to_date:endDate,
                    })
                .then(data => {
                    if (data.status === 'success') {
                        const reports = data.data;
                        this.setState({ reports }, () => {
                            // Generate calendar events after reports and leaves are fetched and state is updated
                            const { reports, leaves } = this.state;
                            const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                            this.setState({ calendarEventsData });
                        });
                    } else {
                        this.setState({ errorMessage: data.message, reports: [] });
                        // Still generate events even if reports fetch fails, to show leaves/closures
                        const { reports, leaves } = this.state;
                        const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                        this.setState({ calendarEventsData });
                    }
                })
                .catch(err => {
                    this.setState({ error: 'Failed to fetch reports', reports: [] });
                    // Still generate events even if reports fetch fails, to show leaves/closures
                    const { reports, leaves } = this.state;
                    const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                    this.setState({ calendarEventsData });
                });
               
            getService.getCall('employee_leaves.php', {
                action: 'view',
                from_date:startDate,
                to_date:endDate,
                employee_id: currentEmployeeId
            })
                .then(data => {
                    if (data.status === 'success') {
                        const leaves = data.data;
                        this.setState({ leaves }, () => {
                            // Generate calendar events after reports and leaves are fetched and state is updated
                            const { reports, leaves } = this.state;
                            const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                            this.setState({ calendarEventsData });
                        });
                    } else {
                        this.setState({ errorMessage: data.message, leaves: [] });
                        // Still generate events even if leaves fetch fails, to show reports/closures
                        const { reports, leaves } = this.state;
                        const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                        this.setState({ calendarEventsData });
                    }
                })
                .catch(err => {
                    this.setState({ error: 'Failed to fetch leaves', leaves: [] });
                    // Still generate events even if leaves fetch fails, to show reports/closures
                    const { reports, leaves } = this.state;
                    const calendarEventsData = this.generateCalendarEvents(reports, leaves);
                    this.setState({ calendarEventsData });
                });
        }
    }

    fetchEmployeeDetails = (employeeId) => {
        getService.getCall('get_employees.php', {
                    action: 'view',
                    user_id:employeeId,
                })
        
            .then((data) => {
                if (data.status === "success") {
                     const { password, ...employeeData } = data.data;

                    this.setState(prevState => ({
                        employee: { ...prevState.employee, ...employeeData }, // Merge new data excluding password
                        previewImage: employeeData.profile ? `${process.env.REACT_APP_API_URL}/${employeeData.profile}` : prevState.previewImage
                    }));
                    
                    const skillsFrontend = this.parseSkills(this.state.employee.frontend_skills);
                    const skillsBackend = this.parseSkills(this.state.employee.backend_skills);

                    // Remove duplicates between frontend and backend
                    const uniqueFrontendSkills = skillsFrontend.filter(skill => !skillsBackend.includes(skill));
                    const uniqueBackendSkills = skillsBackend.filter(skill => !skillsFrontend.includes(skill));
                    this.setState({
                        skillsFrontend: uniqueFrontendSkills,
                        skillsBackend: uniqueBackendSkills,
                    });

                    const isAdmin = data.data.role === 'super_admin' || data.data.role === 'admin';
                    if (!isAdmin) {
                        this.loadEmployeeData();
                        this.getAlternateSaturday();
                    }
                } else {
                    console.error("Failed to fetch employee details:", data.message);
                }
            })
            .catch((error) => console.error("Error fetching employee details:", error));
    };

    /**
     * Parses skills data from string or array.
     */
    parseSkills(skills) {
        if (typeof skills === 'string') {
            return skills.replace(/["[\]]/g, '').split(',').map(skill => skill.trim());
        }
        return Array.isArray(skills) ? skills : [];
    }

    handleSkillChange = (event, fieldName) => {
        const { value, checked } = event.target;

        // Check which field we're updating (frontend or backend)
        this.setState((prevState) => {
            let updatedSkills = fieldName === 'frontend'
                ? [...prevState.skillsFrontend]
                : [...prevState.skillsBackend];

            if (checked) {
                // Add the skill if not already in the array
                if (!updatedSkills.includes(value)) {
                    updatedSkills.push(value);
                }
            } else {
                // Remove the skill if checkbox is unchecked
                updatedSkills = updatedSkills.filter((skill) => skill !== value);
            }

            // Return the updatdepartmented state for the specific field
            return {
                [fieldName === 'frontend' ? 'skillsFrontend' : 'skillsBackend']: updatedSkills,
            };
        });
    };


    fetchWorkingHoursReports = (employeeId) => {
        if (!employeeId) {
            employeeId = localStorage.getItem('empId');
        }
        let startDate = localStorage.getItem('startDate');
        let endDate = localStorage.getItem('endDate');

        if (!startDate || !endDate) {
            const now = new Date();

            // First day of the current month
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

            // Last day of the current month
            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

            // Format as YYYY-MM-DD
            const tformatDate = (date) =>
                date.toISOString().split('T')[0];

            startDate = tformatDate(firstDay);
            endDate = tformatDate(lastDay);
        }

        getService.getCall('reports.php', {
            action: 'view',
            user_id:employeeId,
            from_date:startDate,
            to_date:endDate
        })
            .then((data) => {
                if (data.status === "success") {
                    if (employeeId === '') {
                        this.setState({
                            workingHoursReports: []
                        });
                    } else {
                        this.setState({
                            workingHoursReports: data.data,
                            loading: false
                        });
                    }
                } else {
                    this.setState({
                        workingHoursReports: [],
                        error: data.message || "Failed to load reports",
                        loading: false
                    });
                }
            })
            .catch((err) => {
                console.error("Error fetching working hours:", err);
                this.setState({
                    workingHoursReports: [],
                    error: "Failed to fetch working hours",
                    loading: false
                });
            });
    };

    // Update profile
    handleProfileChange = (event) => {
        const { name, value } = event.target;

        // Update state for the selected user
        this.setState((prevState) => ({
            employee: {
                ...prevState.employee,
                [name]: value,
            },
            passwordCleared: name === 'password' ? (value === '' ? true : prevState.passwordCleared) : prevState.passwordCleared
        }));
    };

    updateProfile = () => {
        const { employee, skillsFrontend, skillsBackend } = this.state;

        // Validation using validateFields
        const validationSchema = [
            { name: 'first_name', value: employee.first_name, type: 'name', required: true, messageName: 'First Name' },
            { name: 'last_name', value: employee.last_name, type: 'name', required: true, messageName: 'Last Name' },
            { name: 'email', value: employee.email, type: 'email', required: true, messageName: 'Email' },
            { name: 'gender', value: employee.gender, required: true, messageName: 'Gender' },
            { name: 'department_id', value: employee.department_id, required: true, messageName: 'Department' },
            { name: 'dob', value: employee.dob, type: 'date', required: true, messageName: 'Date of Birth'},
            { name: 'joining_date', value: employee.joining_date, type: 'date', required: true, messageName: 'Joining Date' },
            { name: 'mobile_no1', value: employee.mobile_no1, type: 'mobile', required: true, messageName: 'Mobile Number' },
            { name: 'mobile_no2', value: employee.mobile_no2, type: 'mobile', messageName: 'Mobile Number' },
            { name: 'emergency_contact1', value: employee.emergency_contact1, type: 'mobile', messageName: 'Mobile Number' },
            { name: 'emergency_contact2', value: employee.emergency_contact2, type: 'mobile', messageName: 'Mobile Number' },
            { name: 'emergency_contact3', value: employee.emergency_contact3, type: 'mobile', messageName: 'Mobile Number' },
            { name: 'password', value: employee.password, required: false, messageName: 'Password' },
        ];

        const errors = validateFields(validationSchema);

        if (Object.keys(errors).length > 0) {
            this.setState({ errors }, () => {
                const firstErrorField = Object.keys(errors)[0];
                const ref = this.fieldRefs[firstErrorField];
                if (ref && ref.current) {
                    ref.current.focus();
                    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                } else {
                    console.warn('No ref found for field:', firstErrorField);
                }
            });
            return;
        } else {
            this.setState({ errors: {} });
        }

        // Get the logged-in user from localStorage
        const storedUser = window.user || JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
            console.warn("User data missing from localStorage");
            return;
        }

        const { id, role } = storedUser;
        // Create a new FormData object
        const updatedProfileData = new FormData();

        // Helper function to ensure blank values are stored as empty strings
        const appendField = (key, value) => {
            updatedProfileData.append(key, value !== undefined && value !== null ? value : "");
        };

        appendField("id", employee.id);
        appendField("logged_in_employee_id", id);
        appendField("logged_in_employee_role", role);
        appendField("first_name", employee.first_name);
        appendField("last_name", employee.last_name);
        appendField("email", employee.email);
        appendField("gender", employee.gender);
        appendField("department_id", employee.department_id);
        appendField("joining_date", employee.joining_date);
        appendField("mobile_no1", employee.mobile_no1);
        appendField('mobile_no2', employee.mobile_no2);
        if (typeof employee.password === 'string' && employee.password.trim() !== "" && employee.password !== PASSWORD_STRING) {
            appendField("password", employee.password);
        }
        appendField("dob", employee.dob);
        appendField("address_line1", employee.address_line1);
        appendField("address_line2", employee.address_line2);
        appendField('emergency_contact1', employee.emergency_contact1);
        appendField('emergency_contact2', employee.emergency_contact2);
        appendField('emergency_contact3', employee.emergency_contact3);
        appendField('frontend_skills', JSON.stringify(skillsFrontend));
        appendField('backend_skills', JSON.stringify(skillsBackend));
        appendField("about_me", employee.about_me);

        // Preserve social media URLs even if not updated
        appendField("facebook_url", employee.facebook_url);
        appendField("twitter_url", employee.twitter_url);

        getService.editCall('get_employees.php','edit', updatedProfileData, null, employee.id )
            .then(data => {
                if (data.status === "success") {
                    const updatedUser = data.data;

                    // Only update the logged-in user's data
                    if (employee.id === id) {
                        const mergedUserData = { ...storedUser, ...updatedUser };

                        // Store updated data in local storage
                        localStorage.setItem("user", JSON.stringify(mergedUserData));
                        window.user = mergedUserData;

                        // Update state to re-render UI with new data
                        this.setState({ employee: mergedUserData });
                    } else {
                        // If updating another user from the listing, just update the state
                        this.setState({ employee: updatedUser });
                    }

                    this.setState((prevState) => ({
                        successMessage: "Profile updated successfully!",
                        showSuccess: true,
                        errorMessage: "",
                        showError: false
                    }));

                    this.props.history.push('/');
                    // Auto-hide success message after 5 seconds
                    setTimeout(this.dismissMessages, 5000);
                } else {
                    this.setState({
                        errorMessage: "Failed to update profile.",
                        showError: true,
                        showSuccess: false
                    });

                    // setTimeout(this.dismissMessages, 3000);
                }
            })
            .catch(error => {
                console.error("Error updating profile:", error);
                this.setState({
                    errorMessage: "An error occurred while updating the profile.",
                    showError: true,
                    showSuccess: false,
                });

                // setTimeout(this.dismissMessages, 3000);
            });
    };

    handleEventClick = (eventInfo) => {
        // The event data is directly in the eventInfo object
        const report = eventInfo.report;
        if (report) {
            this.setState({
                selectedReport: report,
                showReportModal: true
            });
        }
    };

    closeReportModal = () => {
        this.setState({
            showReportModal: false,
            selectedReport: null
        });
    };

    handleApplyFilter = async () => {
        this.setState({ loading: true });
        const { filterFromDate, filterToDate } = this.state;  
            getService.getCall('activities.php', {
                action: 'view',
                user_id:this.props.employeeId,
                from_date: filterFromDate,
                to_date:filterToDate,
                is_timeline:true
            }).then(data => {
                if (data.status === "success") {
                    this.setState({ activities: data.data, loading: false });
                } else {
                    this.setState({ activities: [], loading: false, error: data.message });
                }
            })       
    };

    handleDateChange = (date, type) => {
        if (date) {
            const newDate = formatDate(new Date(date));
            if (type === 'fromDate') {
                this.setState({ filterFromDate: newDate });
               
            } else if (type === 'toDate') {
                this.setState({ filterToDate: newDate });
            }
         
        } else {
            this.setState({ [type]: null });
        }
    };

    render() {
        const { activities, employee, calendarEventsData, skillsFrontend, skillsBackend, showSuccess,successMessage,showError, errorMessage, col, errors } = this.state;
        const frontendSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue"];
        const backendSkills = ["PHP", "Laravel", "Python", "Node.js", "Symfony", "Django", "Ruby on Rails"];
        // Handle case where employee data is not available
        if (!employee) {
            return <p>Loading employee details...</p>;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const defaultDate = localStorage.getItem('startDate') ?? formatDate(today);
        const defaultView = localStorage.getItem('defaultView') ?? 'month';

        // Use calendarEventsData from state, default to empty array if not yet loaded
        const finalCalendarEvents = calendarEventsData || [];

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

                {this.state.showReportModal && this.state.selectedReport && (
                    <ReportModal
                        show={this.state.showReportModal}
                        report={this.state.selectedReport}
                        onClose={this.closeReportModal}
                        userRole={this.state.logged_in_employee_role}
                    />
                )}

                <div className="section-body py-4">
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-12">
                                <ul className="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                                    {(employee.role === "employee") && (
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${this.state.activeTab === "calendar" ? "active" : ""}`}
                                                id="pills-calendar-tab"
                                                data-toggle="pill"
                                                href="#pills-calendar"
                                                role="tab"
                                                aria-controls="pills-calendar"
                                                aria-selected={this.state.activeTab === "calendar"}
                                                onClick={() => {
                                                    this.props.history.push(`/view-employee/${this.props.employeeId}/calendar`);
                                                    this.setState({ activeTab: "calendar" });
                                                }}
                                            >
                                                Calendar
                                            </a>
                                        </li>
                                    )}
                                    {(employee.role === "employee") && (
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${this.state.activeTab === "timeline" ? "active" : ""}`}
                                                id="pills-timeline-tab"
                                                data-toggle="pill"
                                                href="#pills-timeline"
                                                role="tab"
                                                aria-controls="pills-timeline"
                                                aria-selected={this.state.activeTab === "timeline"}
                                                onClick={() => {
                                                    this.props.history.push(`/view-employee/${this.props.employeeId}/timeline`);
                                                    this.setState({ activeTab: "timeline" });
                                                }}
                                            >
                                                Timeline
                                            </a>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "profile" ? "active" : ""}`}
                                            id="pills-profile-tab"
                                            data-toggle="pill"
                                            href="#pills-profile"
                                            role="tab"
                                            aria-controls="pills-profile"
                                            aria-selected={this.state.activeTab === "profile"}
                                            onClick={() => {
                                                this.props.history.push(`/view-employee/${this.props.employeeId}/profile`);
                                                this.setState({ activeTab: "profile" });
                                            }}
                                        >
                                            Profile
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="tab-content" id="pills-tabContent">
                                    <div className={`tab-pane fade ${this.state.activeTab === "calendar" ? "show active" : ""}`} id="pills-calendar" role="tabpanel" aria-labelledby="pills-calendar-tab">
                                        <div className="card">
                                            <div className="card-header bline">
                                                <h3 className="card-title">Calendar</h3>
                                            </div>
                                            <div className="card-body">
                                                <Fullcalender
                                                    alternateSatudays={this.state.alternateSatudays}
                                                    defaultDate={defaultDate}
                                                    defaultView={defaultView}
                                                    key={`calendar-${this.state.activeTab}`}
                                                    events={finalCalendarEvents}
                                                    eventClick={this.handleEventClick}
                                                    selectable={true}
                                                    selectMirror={true}
                                                    dayMaxEvents={true}
                                                    eventDisplay="block"
                                                    headerToolbar={{
                                                        left: 'prev,next today',
                                                        center: 'title',
                                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                                    }}
                                                    buttonText={{
                                                        today: 'Today',
                                                        month: 'Month',
                                                        week: 'Week',
                                                        day: 'Day'
                                                    }}
                                                    height="auto"
                                                    onAction={this.loadEmployeeData}
                                                    eventTimeFormat={{
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        meridiem: false,
                                                        hour12: false
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "timeline" ? "show active" : ""}`} id="pills-timeline" role="tabpanel" aria-labelledby="pills-timeline-tab">
                                        {/* <div className='container-fluid'> */}
                                            <div className="card mb-3">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <DateFilterForm
                                                            fromDate={this.state.filterFromDate}
                                                            toDate={this.state.filterToDate}
                                                            ButtonLoading={this.state.ButtonLoading}
                                                            handleDateChange={this.handleDateChange}
                                                            handleApplyFilters={this.handleApplyFilter}
                                                            col={col}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                                            
                                        <ActivitiesTime activities = { activities } employeeId={this.state.employeeId || this.props.employeeId} fromDate={this.state.filterFromDate} toDate={this.state.filterToDate} />
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "profile" ? "show active" : ""}`} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Edit Profile</h3>
                                            </div>
                                            <div className="card-body">
                                                <div className="row clearfix">
                                                    <div className="col-sm-6 col-md-6">
                                                        <InputField
                                                            label="First Name"
                                                            name="first_name"
                                                            value={employee.first_name}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="First Name"
                                                            error={errors.first_name}
                                                            refInput={this.fieldRefs.first_name}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <InputField
                                                            label="Last Name"
                                                            name="last_name"
                                                            value={employee.last_name}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Last Name"
                                                            error={errors.last_name}
                                                            refInput={this.fieldRefs.last_name}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <InputField
                                                            label="Email Address"
                                                            name="email"
                                                            value={employee.email}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Email"
                                                            error={errors.email}
                                                            refInput={this.fieldRefs.email}
                                                            type="email"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <InputField
                                                            label="Gender"
                                                            name="gender"
                                                            value={employee.gender}
                                                            onChange={this.handleProfileChange}
                                                            error={errors.gender}
                                                            refInput={this.fieldRefs.gender}
                                                            type="select"
                                                            options={[
                                                            { value: 'male', label: 'Male' },
                                                            { value: 'female', label: 'Female' }
                                                            ]}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4 col-sm-12">
                                                        <InputField
                                                            label="DOB"
                                                            name="dob"
                                                            value={employee.dob}
                                                            onChange={this.handleProfileChange}
                                                            error={errors.dob}
                                                            refInput={this.fieldRefs.dob}
                                                            type="date"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <InputField
                                                            label="Select Department"
                                                            name="department_id"
                                                            value={employee.department_id}
                                                            onChange={this.handleProfileChange}
                                                            error={errors.department_id}
                                                            refInput={this.fieldRefs.department_id}
                                                            type="select"
                                                            options={this.state.departments.map(dept => ({
                                                            value: dept.id,
                                                            label: dept.department_name
                                                            }))}
                                                            disabled={window.user && window.user.role === 'employee'}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <InputField
                                                            label="Joining Date"
                                                            name="joining_date"
                                                            value={employee.joining_date}
                                                            onChange={this.handleProfileChange}
                                                            error={errors.joining_date}
                                                            refInput={this.fieldRefs.joining_date}
                                                            type="date"
                                                            disabled={window.user && (window.user.role === 'employee')}
                                                        />
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <InputField
                                                            label="Mobile No (1)"
                                                            name="mobile_no1"
                                                            value={employee.mobile_no1}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Mobile No"
                                                            error={errors.mobile_no1}
                                                            refInput={this.fieldRefs.mobile_no1}
                                                            type="tel"
                                                            maxLength="10"
                                                            onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <InputField
                                                            label="Mobile No (2)"
                                                            name="mobile_no2"
                                                            value={employee.mobile_no2}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Mobile No"
                                                            error={errors.mobile_no2}
                                                            refInput={this.fieldRefs.mobile_no2}
                                                            type="tel"
                                                            maxLength="10"
                                                            onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, ''); // Allow only numbers
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-4 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label" htmlFor="password">Password</label>
                                                            <div className="input-group">
                                                                <input
                                                                    id="password"
                                                                    type={this.state.showPassword ? 'text' : 'password'}
                                                                    name="password"
                                                                    className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                                                    value={employee.password}
                                                                    onChange={this.handleProfileChange}
                                                                    placeholder="Enter password"
                                                                    autoComplete="new-password"
                                                                    required
                                                                    ref={this.fieldRefs.password}
                                                                />
                                                                {this.state.passwordCleared && String(employee.password || '') !== '' && (
                                                                <div className="input-group-append">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={this.onTogglePassword}
                                                                        title={this.state.showPassword ? 'Hide' : 'Show'}
                                                                    >
                                                                        <i className={`fe ${this.state.showPassword ? 'fe-eye-off' : 'fe-eye'}`}></i>
                                                                    </button>
                                                                </div>
                                                                )}
                                                            </div>
                                                            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                    <InputField
                                                        label="Address Line 1"
                                                        name="address_line1"
                                                        value={employee.address_line1}
                                                        onChange={this.handleProfileChange}
                                                        placeholder="Enter Address Line 1"
                                                        refInput={this.fieldRefs.address_line1}
                                                    />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <InputField
                                                            label="Address Line 2"
                                                            name="address_line2"
                                                            value={employee.address_line2}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Address Line 2"
                                                            refInput={this.fieldRefs.address_line2}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-4 mb-4">
                                                        <InputField
                                                            label="Emergency Contact 1"
                                                            name="emergency_contact1"
                                                            value={employee.emergency_contact1}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Emergency Contact"
                                                            error={errors.emergency_contact1}
                                                            refInput={this.fieldRefs.emergency_contact1}
                                                            type="tel"
                                                            maxLength="10"
                                                            onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');  // Allow only numbers
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-4 mb-4">
                                                        <InputField
                                                            label="Emergency Contact 2"
                                                            name="emergency_contact2"
                                                            value={employee.emergency_contact2}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Emergency Contact"
                                                            error={errors.emergency_contact2}
                                                            refInput={this.fieldRefs.emergency_contact2}
                                                            type="tel"
                                                            maxLength="10"
                                                            onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');  // Allow only numbers
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 col-md-4 mb-4">
                                                        <InputField
                                                            label="Emergency Contact 3"
                                                            name="emergency_contact3"
                                                            value={employee.emergency_contact3}
                                                            onChange={this.handleProfileChange}
                                                            placeholder="Enter Emergency Contact"
                                                            error={errors.emergency_contact3}
                                                            refInput={this.fieldRefs.emergency_contact3}
                                                            type="tel"
                                                            maxLength="10"
                                                            onInput={(e) => {
                                                            e.target.value = e.target.value.replace(/\D/g, '');  // Allow only numbers
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="row mb-4">
                                                        <h5 className="w-100">Skills</h5>
                                                        <CheckboxGroup
                                                            label="Frontend"
                                                            options={frontendSkills}
                                                            selected={skillsFrontend}
                                                            onChange={(e) => this.handleSkillChange(e, 'frontend')}
                                                        />

                                                        <CheckboxGroup
                                                            label="Backend"
                                                            options={backendSkills}
                                                            selected={skillsBackend}
                                                            onChange={(e) => this.handleSkillChange(e, 'backend')}
                                                        />
                                                    </div>

                                                    <div className="col-md-12">
                                                       <InputField
                                                            label="About Me"
                                                            name="about_me"
                                                            type="textarea"
                                                            placeholder="Here can be your description"
                                                            value={employee.about_me || ""}
                                                            onChange={this.handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer text-right">
                                                <Button
                                                    label="Update Profile"
                                                    onClick={this.updateProfile}
                                                    className="btn-primary"
                                                    type="submit"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CalendarWithTabs));