import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getService } from '../../../services/getService';
import NoDataRow from '../../common/NoDataRow';
import Pagination from '../../common/Pagination';
import DeleteModal from '../../common/DeleteModal';
import { validateFields } from '../../common/validations';
import HolidaysTable from './HolidaysTable';
import AddHolidayModal from './AddHolidayModal';
import EditHolidayModal from './EditHolidayModal';
import AlertMessages from '../../common/AlertMessages';
class Holidays extends Component {
	constructor(props) {
		super(props);
		this.state = {
			holidays: [],
			message: null,
			showAddHolidayModal: false,
			employee_id: null,
			logged_in_user_role: null,
			event_name: "",
			event_date: "",
			errors: {
				event_name: '',
        		event_date: '',
			},
			selectedHoliday: '',
			deleteHoliday: null,
			successMessage: "",
      		errorMessage: "",
			showSuccess: false,
      		showError: false,
			currentPage: 1,
			dataPerPage: 10,
			loading: true,
			ButtonLoading: false,
			showDeleteModal: false
		};
	}

	componentDidMount(prevProps, prevState) {
		const {role, id} = window.user;
		// Get the logged in user id
		this.setState({
			employee_id: id,
			logged_in_user_role: role
		});

		getService.getCall('events.php', {
			action: 'view',
			event_type:'holiday'
		})
		.then(data => {
			if (data.status === 'success') {
				const holidaysData = data.data;
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				const upcomingHolidays = holidaysData
				.filter(holiday => {
					if (holiday.event_type !== 'holiday') return false;
					const eventDate = new Date(holiday.event_date);
					eventDate.setHours(0, 0, 0, 0);
					return eventDate >= today;
				})
				.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));// Sort by ASC order
				
				this.setState(
					{ holidays: upcomingHolidays, loading: false}
				);
			} else {
				this.setState({ message: data.message, loading: false });
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data', loading: false });
			// console.error(err);
		});

		if (this.state.successMessage && this.state.successMessage !== prevState.successMessage) {
			this.setState({ showSuccess: true });
			setTimeout(() => this.setState({ showSuccess: false, successMessage: '' }), 5000); // Hide after 5 seconds
		}		
	  
		if (this.state.errorMessage && this.state.errorMessage !== prevState.errorMessage) {
			this.setState({ showError: true });
			setTimeout(() => this.setState({ showError: false, errorMessage: '' }), 5000); // Hide after 5 seconds
		}
	}

	handleClose = (messageType) => {
		if (messageType === 'success') {
		  this.setState({ showSuccess: false, successMessage: '' });
		} else if (messageType === 'error') {
		  this.setState({ showError: false, errorMessage: '' });
		}
	};	

	// Function for "Add" button based on active tab
    openAddHolidayModel = () => {
		this.setState({
			selectedHoliday: null,
			event_name: '',
			event_date: '',
			errors: {},
			showAddHolidayModal: true
		});
    };

	closeAddHolidayModal = () => {
        this.setState({
			showAddHolidayModal: false,
			event_name: '',
			event_date: '',
			errors: {},
		});
    };

	// Handle input changes for add event/holiday
	handleInputChangeForAddHoliday = (event) => {
        const { name, value } = event.target;
        this.setState({
			[name]: value,
			errors: { ...this.state.errors, [name]: "" }
		});
    };

	// Validate form inputs
	validateForm = (e) => {
		e.preventDefault();
		
		// Check if we're editing or adding an event
		const eventData = this.state.selectedHoliday || this.state;
		const { event_name, event_date } = eventData;

		// Apply Validation component
		const validationSchema = [
			{ name: 'event_name', value: event_name, type: 'name', required: true, messageName: 'Holiday name'},
			{ name: 'event_date', value: event_date, type: 'date', required: true, messageName: 'Holiday date'},
		];
		const errors = validateFields(validationSchema);
		
		this.setState({ errors });
		return Object.keys(errors).length === 0;
	};

	addHoliday = (e) => {
		// Prevent default form submission behavior
		e.preventDefault();

		// Reset selectedHoliday before adding a new event
		if (this.state.selectedHoliday) {
			this.setState({
				selectedHoliday: null,
			});
		}

		if (this.validateForm(e)) {
			this.setState({ ButtonLoading: true });
			const { employee_id, event_name, event_date} = this.state;
			const addHolidayData = new FormData();
			addHolidayData.append('employee_id', employee_id);
			addHolidayData.append('event_name', event_name);
			addHolidayData.append('event_date', event_date);
			addHolidayData.append('event_type', 'holiday');
			// API call to add employee leave
			 getService.addCall('events.php','add',addHolidayData )
			.then((data) => {
				this.setState({ ButtonLoading: false });
				if (data.status === "success") {
					this.setState((prevState) => {
						const updatedHolidayData = [data.data, ...(prevState.holidays || []) ];
						
						// Return the updated state
						return {
							holidays: updatedHolidayData,
							
							// Clear form fields after submission
							event_name: "",
							event_date: "",
							showAddHolidayModal: false,
							successMessage: 'Holiday added successfully',
							showSuccess: true,
							errors: {}, // Clear errors
						};
					});

					// Auto-hide success message after 3 seconds
					setTimeout(() => {
						this.setState({
							showSuccess: false, 
							successMessage: ''
						});
					}, 3000);
				} else {
					this.setState({
						errorMessage: "Failed to add holiday",
						showError: true
					});

					// Auto-hide error message after 3 seconds
					setTimeout(() => {
						this.setState({
							errorMessage: '',
							showError: false
						}); 
					}, 3000);
				}
			})
			.catch((error) => {
				this.setState({ ButtonLoading: false });
				console.error("Error:", error);
			});
		}
    };

	// Handle edit holiday
    handleEditClickForHoliday = (holiday) => {
		this.setState({
			selectedHoliday: holiday,
			errors: { event_name: "", event_date: "" }, // Reset errors
			errorMessage: "",
			showError: false
		});
    };

	handleInputChangeForEditHoliday = (event) => {
		const { name, value } = event.target;
		this.setState((prevState) => ({
            selectedHoliday: {
                ...prevState.selectedHoliday,
                [name]: value, // Dynamically update the field
				errors: { ...this.state.errors, [name]: "" }
            },
        }));
	}

	// Update/Edit Holiday (API Call)
	updateHoliday = (e) => {
		e.preventDefault();

		// Validate the form before proceeding
		if (!this.validateForm(e)) {
			return;
		}

        this.setState({ ButtonLoading: true });

        const { selectedHoliday } = this.state;
        if (!selectedHoliday) return;

		const updateHolidayData = new FormData();
        updateHolidayData.append('employee_id', selectedHoliday.employee_id);
		updateHolidayData.append('event_name', selectedHoliday.event_name);
		updateHolidayData.append('event_date', selectedHoliday.event_date);
		updateHolidayData.append('event_type', 'holiday');

        // update holiday API call
		getService.editCall('events.php', 'edit', updateHolidayData, selectedHoliday.id, null)
        .then((data) => {
            this.setState({ ButtonLoading: false });
            if (data.status === "success") {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedHolidayData = prevState.holidays.map((holiday) =>
                        holiday.id === selectedHoliday.id ? { ...holiday, ...data.data } : holiday
                    );
                
                    return {
                        holidays: updatedHolidayData,
						successMessage: 'Holiday updated successfully',
						showSuccess: true
                    };
                });

                document.querySelector("#editHolidayModal .close").click();

				// Auto-hide success message after 3 seconds
				setTimeout(() => {
					this.setState({
						showSuccess: false, 
						successMessage: ''
					});
				}, 3000);
            } else {
				document.querySelector("#editHolidayModal .close").click();

				this.setState({ 
					errorMessage: "Failed to update holiday",
					showError: true
				});

				// ✅ Auto-hide error message after 3 seconds
				setTimeout(() => {
					this.setState({
						showError: false,
						errorMessage: ''
					});
				}, 3000);
            }
        })
        .catch((error) => {
            this.setState({ ButtonLoading: false });
            console.error('Error updating holiday:', error);
        });
    };

	// Code for delete holidays
	openDeleteHolidayModal = (holidayId) => {
        this.setState({
            deleteHoliday: holidayId,
            showDeleteModal: true
        });
    };

	closeDeleteModal = () => {
        this.setState({
            showDeleteModal: false,
            deleteHoliday: null
        });
    };

	confirmDelete = () => {
        const { deleteHoliday, currentPage, holidays, dataPerPage } = this.state;
      
        if (!deleteHoliday) return;

		this.setState({ ButtonLoading: true });

		getService.deleteCall('events.php','delete', deleteHoliday, null, null, null)
        .then((data) => {
			if (data.status === "success") {
				// Update holidays state after deletion
				const updatedHolidays = holidays.filter((d) => d.id !== deleteHoliday);

				// Calculate the total pages after deletion
				const totalPages = Math.ceil(updatedHolidays.length / dataPerPage);
	
				// Adjust currentPage if necessary (if we're on a page that no longer has data)
				let newPage = currentPage;
				if (updatedHolidays.length === 0) {
					newPage = 1;
				} else if (currentPage > totalPages) {
					newPage = totalPages;
				}

				this.setState({
					holidays: updatedHolidays,
					successMessage: "Holiday deleted successfully",
					showSuccess: true,
					currentPage: newPage, // Update currentPage to the new page
					deleteHoliday: null,  // Clear the deleteHoliday state
					ButtonLoading: false,
					showDeleteModal: false
				});

				this.closeDeleteModal(); // Close the modal after successful delete

				setTimeout(() => {
					this.setState({
						showSuccess: false,
						successMessage: ''
					});
				}, 3000);
			} else {
				this.setState({
					errorMessage: "Failed to delete holiday",
					showError: true,
					ButtonLoading: false,
				});

				setTimeout(() => {
					this.setState({
						showError: false,
						errorMessage: ''
					});
				}, 3000);
			}
        })
        .catch((error) => {
			console.error("Error:", error);
			this.setState({
                ButtonLoading: false,
			});
		});
    };

	// Handle Pagination
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.state.holidays.length / this.state.dataPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

	render() {
		const { fixNavbar } = this.props;
		const { holidays, message, showAddHolidayModal, selectedHoliday, currentPage, dataPerPage, loading, logged_in_user_role, showSuccess, successMessage, showError, errorMessage,} = this.state;
		// Pagination Logic
        const indexOfLastHoliday = currentPage * dataPerPage;
        const indexOfFirstHoliday = indexOfLastHoliday - dataPerPage;
        const currentHolidays = holidays.slice(indexOfFirstHoliday, indexOfLastHoliday);
		const totalPages = Math.ceil(holidays.length / dataPerPage);
		return (
			<>
				<div>
					<AlertMessages
						showSuccess={showSuccess}
						successMessage={successMessage}
						showError={showError}
						errorMessage={errorMessage}
						setShowSuccess={(val) => this.setState({ showSuccess: val })}
						setShowError={(val) => this.setState({ showError: val })}
					/>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
						<div className="container-fluid">
							<div className="d-flex justify-content-end align-items-center mb-3 mt-3">
								{(logged_in_user_role === 'admin' || logged_in_user_role === 'super_admin') && (
									<div className="header-action">
										<button
											onClick={() => this.openAddHolidayModel()}
											type="button"
											className="btn btn-primary"
										>
											<i className="fe fe-plus mr-2" />Add Holiday
										</button>
									</div>
								)}
							</div>
							<div className="row">
								<div className="col-12">
									<div className="card">
										<div className='card-header'>
											<h3 className='card-title'>Holiday List</h3>	
										</div>
										<HolidaysTable
											loading={loading}
											holidays={holidays}
											message={message}
											logged_in_user_role={logged_in_user_role}
											currentHolidays={currentHolidays}
											handleEditClickForHoliday={this.handleEditClickForHoliday}
											openDeleteHolidayModal={this.openDeleteHolidayModal}
										/>
									</div>
									{/* Only show pagination if there are holidays */}
									{totalPages > 1 && (
										<Pagination
											currentPage={currentPage}
											totalPages={totalPages}
											onPageChange={this.handlePageChange}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Modal for Add Holiday */}
				<AddHolidayModal
					showAddHolidayModal={this.state.showAddHolidayModal}
					closeAddHolidayModal={this.closeAddHolidayModal}
					handleInputChangeForAddHoliday={this.handleInputChangeForAddHoliday}
					addHoliday={this.addHoliday}
					ButtonLoading={this.state.ButtonLoading}
					errors={this.state.errors}
					employee_id={this.state.employee_id}
					event_name={this.state.event_name}
					event_date={this.state.event_date}
				/>

				{/* Modal for Update/Edit Holiday */}
				<EditHolidayModal
					selectedHoliday={this.state.selectedHoliday}
					handleInputChangeForEditHoliday={this.handleInputChangeForEditHoliday}
					updateHoliday={this.updateHoliday}
					errors={this.state.errors}
					ButtonLoading={this.state.ButtonLoading}
				/>

				<DeleteModal
					show={this.state.showDeleteModal}
					onConfirm={this.confirmDelete}
					onClose={this.closeDeleteModal}
					isLoading={this.state.ButtonLoading}
					deleteBody='Are you sure you want to delete the holiday?'
					modalId="deleteHolidayModal"
				/>
			</>
		);
	}
}
const mapStateToProps = state => ({
	fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Holidays);