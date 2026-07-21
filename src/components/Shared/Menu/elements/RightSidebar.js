import React, { Component } from 'react';
import { getToday } from '../../../../utils';
import { getService } from '../../../../services/getService';
import BlankState from '../../../common/BlankState';
import AlertMessages from '../../../common/AlertMessages';
import ConfigModal from './ConfigModal';

class RightSidebar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activities: [],
			loading: false,
			show_todo: true,
			show_project: true,
			global_show_todo: true,
			global_show_project: true,
			enable_cloud_storage: false,
			showSuccess: false,
			successMessage: '',
			showError: false,
			errorMessage: '',
			showCloudModal: false,
			showNewConfigModal: false,
		};
	}

	componentDidMount() {
		this.getTodayActivity();
		this.getDashboardPreferences();
		this.getGlobalDashboardPreferences();
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.isOpenRightSidebar && this.props.isOpenRightSidebar) {
			this.getTodayActivity();
			this.getDashboardPreferences();
			this.getGlobalDashboardPreferences();
		}
	}

	getTodayActivity = () => {
		if (window.user.role === 'employee') {
			this.setState({ loading: true });
			getService.getCall('activities.php', {
				action: 'view',
				user_id: window.user.id,
				from_date: getToday(),
				to_date: getToday(),
				is_timeline: true
			})
				.then((data) => {
					if (data.status === "success") {
						this.setState({ activities: data.data, loading: false });
					} else {
						this.setState({ activities: [], loading: false, error: data.message });
					}
				})
				.catch((err) => {
					console.error(err);
					this.setState({ loading: false, error: err && err.message ? err.message : 'Failed to fetch activities' });
				});
		}
	};

	getDashboardPreferences = () => {
		getService.getCall('Settings.php', {
			action: 'get-dashboard-preferences',
			user_id: window.user.id
		})
			.then((data) => {
				if (data.status === "success") {
					this.setState({
						show_todo: data.data.show_todo,
						show_project: data.data.show_project
					});
				}
			})
			.catch((err) => {
				console.error('Failed to fetch preferences:', err);
			});
	};

	getGlobalDashboardPreferences = () => {
		getService.getCall('Settings.php', {
			action: 'get-global-dashboard-preferences'
		})
			.then((data) => {
				if (data.status === "success") {
					this.setState({
						global_show_todo: data.data.show_todo,
						global_show_project: data.data.show_project,
						enable_cloud_storage: data.data.enable_cloud_storage
					});
				}
			})
			.catch((err) => {
				console.error('Failed to fetch global preferences:', err);
			});
	};

	handlePreferenceChange = (preferenceType, value) => {
		this.setState({ [preferenceType]: value }, () => {
			// Update preference on server
			getService.editCall('Settings.php', 'update-dashboard-preferences', { [preferenceType]: value, user_id: window.user.id })
				.then((data) => {
					if (data.status === "success") {
						this.setState({
							showSuccess: true,
							successMessage: 'Preference updated successfully!',
						});
						setTimeout(() => this.setState({ showSuccess: false }), 3000);
						// Dispatch custom event to update dashboard
						window.dispatchEvent(new CustomEvent('dashboardPrefsChanged', {
							detail: {
								show_todo: this.state.show_todo,
								show_project: this.state.show_project
							}
						}));
					} else {
						this.setState({
							showError: true,
							errorMessage: data.message || 'Failed to update preference.',
						});
						setTimeout(() => this.setState({ showError: false }), 3000);
					}
				})
				.catch((err) => {
					this.setState({
						showError: true,
						errorMessage: 'Failed to update preference.',
					});
					setTimeout(() => this.setState({ showError: false }), 3000);
				});
		});
	};

	handleGlobalPreferenceChange = (preferenceType, value) => {
		if (preferenceType === 'enable_cloud_storage' && value === true) {
			getService.getCall('config_setting.php', { action: 'get', service: 'cloudinary' })
				.then(data => {
					if (data.status === 'success' && data.data && data.data.service === 'cloudinary') {
						// Configuration exists, just enable
						this.setState({ enable_cloud_storage: true }, () => {
							getService.editCall('Settings.php', 'update-global-dashboard-preferences', { enable_cloud_storage: true })
								.then((res) => {
									if (res.status === "success") {
										window.dispatchEvent(new CustomEvent('globalDashboardPrefsChanged', {
											detail: {
												show_todo: this.state.global_show_todo,
												show_project: this.state.global_show_project,
												enable_cloud_storage: true
											}
										}));
									}
								});
						});
					} else {
						// No configuration, open modal
						this.setState({ showCloudModal: true });
					}
				});
			return;
		}

		this.setState({ [preferenceType]: value }, () => {
			// Update global preference on server
			getService.editCall('Settings.php', 'update-global-dashboard-preferences', { [preferenceType.replace('global_', '')]: value })
				.then((data) => {
					if (data.status === "success") {
						console.log('Global preference updated successfully');
						// Dispatch custom event to update dashboard
						window.dispatchEvent(new CustomEvent('globalDashboardPrefsChanged', {
							detail: {
								show_todo: this.state.global_show_todo,
								show_project: this.state.global_show_project,
								enable_cloud_storage: this.state.enable_cloud_storage
							}
						}));
					} else {
						console.error('Failed to update global preference:', data.message);
					}
				})
				.catch((err) => {
					console.error('Failed to update global preference:', err);
				});
		});
	};

	render() {
		const {
			isOpenRightSidebar,
			toggleRightSidebar,
			handleFont,
			handleMenuIcon,
			handleSubMenuIcon,
			handleDarkMode,
			handleFixNavbar,
			handleDarkHeader,
			handleMinSidebar,
			handleSidebar,
			handleGradientColor,
		} = this.props;
		const { activities, loading, show_todo, show_project, global_show_todo, global_show_project, enable_cloud_storage, showCloudModal, showNewConfigModal } = this.state;

		return (
			<>
				<AlertMessages
					showSuccess={this.state.showSuccess}
					successMessage={this.state.successMessage}
					showError={this.state.showError}
					errorMessage={this.state.errorMessage}
					setShowSuccess={(v) => this.setState({ showSuccess: v })}
					setShowError={(v) => this.setState({ showError: v })}
				/>
				<div id="rightsidebar" className={`right_sidebar ${isOpenRightSidebar ? 'open' : ''}`}>
					<span className="p-3 settingbar float-right" onClick={() => { toggleRightSidebar(); this.getTodayActivity(); }}>
						<i className="fa fa-close" />
					</span>
					<ul className="nav nav-tabs" role="tablist">
						<li className="nav-item">
							<a className="nav-link active" data-toggle="tab" href="#Settings" aria-expanded="true">
								Settings
							</a>
						</li>
						{(window.user.role === 'employee') && (
							<li className="nav-item">
								<a className="nav-link" data-toggle="tab" href="#activity" aria-expanded="false">
									Today Activity
								</a>
							</li>
						)}
					</ul>
					<div className="tab-content">
						<div role="tabpanel" className="tab-pane vivify fadeIn active" id="Settings" aria-expanded="true">
							{/* Dashboard Setting */}
							<div className="mb-4">
								<h6 className="font-14 font-weight-bold text-muted">Dashboard Setting</h6>
								<div className="setting-list list-unstyled mt-1 setting_switch">
									<li>
										<label className="custom-checkbox">
											<input
												type="checkbox"
												checked={show_todo}
												onChange={(e) => this.handlePreferenceChange('show_todo', e.target.checked)}
											/>
											<span className="checkmark"></span>
											<span className="custom-checkbox-description">Show Todos</span>
										</label>
									</li>
									<li>
										<label className="custom-checkbox">
											<input
												type="checkbox"
												checked={show_project}
												onChange={(e) => this.handlePreferenceChange('show_project', e.target.checked)}
											/>
											<span className="checkmark"></span>
											<span className="custom-checkbox-description">Show Projects</span>
										</label>
									</li>
									{/* Global Hide  and show Todos and Projects */}
									{(window.user.role === 'admin' || window.user.role === 'super_admin') && (
										<>
											{/* <li>
												<label className="custom-checkbox">
													<input
														type="checkbox"
														checked={global_show_todo}
														onChange={(e) => this.handleGlobalPreferenceChange('global_show_todo', e.target.checked)}
													/>
													<span className="checkmark"></span>
													<span className="custom-checkbox-description">Global Show Todos</span>
												</label>
											</li>
											<li>
												<label className="custom-checkbox">
													<input
														type="checkbox"
														checked={global_show_project}
														onChange={(e) => this.handleGlobalPreferenceChange('global_show_project', e.target.checked)}
													/>
													<span className="checkmark"></span>
													<span className="custom-checkbox-description">Global Show Projects</span>
												</label>
											</li> */}
										</>
									)}
								</div>
							</div>

							{(window.user.role === 'admin' || window.user.role === 'super_admin') && (
								<div>
									<div>
										<div className="mb-4">
											<h6 className="font-14 font-weight-bold text-muted">Font Style</h6>
											<div className="custom-controls-stacked font_setting">
												{['font-opensans', 'font-montserrat', 'font-roboto'].map(font => (
													<label className="custom-control custom-radio custom-control-inline" key={font}>
														<input
															type="radio"
															className="custom-control-input"
															name="font"
															defaultValue={font}
															onChange={() => handleFont(font)}
														/>
														<span className="custom-control-label">{font.replace('font-', '').replace('-', ' ').toUpperCase()}</span>
													</label>
												))}
											</div>
										</div>
									</div>

									<div>
										<h6 className="font-14 font-weight-bold mt-4 text-muted">General Settings</h6>
										<ul className="setting-list list-unstyled mt-1 setting_switch">
											{[
												{ label: 'Night Mode', onChange: handleDarkMode },
												{ label: 'Fix Navbar top', onChange: handleFixNavbar },
												{ label: 'Header Dark', onChange: handleDarkHeader },
												{ label: 'Min Sidebar Dark', onChange: handleMinSidebar },
												{ label: 'Sidebar Dark', onChange: handleSidebar },
												{ label: 'Gradient Color', onChange: handleGradientColor },
												//{ label: 'RTL Support', onChange: handleRtl }
											].map((setting, index) => (
												<li key={index}>
													<label className="custom-switch">
														<span className="custom-switch-description">{setting.label}</span>
														<input
															type="checkbox"
															name="custom-switch-checkbox"
															className="custom-switch-input"
															onChange={setting.onChange}
														/>
														<span className="custom-switch-indicator" />
													</label>
												</li>
											))}
										</ul>
									</div>
									<div>
										<h6 className="font-14 font-weight-bold mt-4 text-muted">Configuration Setting</h6>
										<div className="setting-list list-unstyled mt-1 mb-4 setting_switch">
											{/* Global Hide  and show Todos and Projects */}
											<>
												<li className="d-flex align-items-center justify-content-between">
													<label className="custom-checkbox mb-0">
														<input
															type="checkbox"
															checked={enable_cloud_storage}
															onChange={(e) => { this.handleGlobalPreferenceChange('enable_cloud_storage', e.target.checked); this.setState({ showCloudModal: e.target.checked ?? true }); }}
														/>
														<span className="checkmark"></span>
														<span onClick={(e) => { e.preventDefault(); this.setState({ showCloudModal: true }); }} className="custom-checkbox-description cursor-pointer" title="Enable this option to store images, videos, PDFs, and other files securely on cloud storage">Enable Cloud Storage</span>
													</label>
												</li>
											</>
										</div>
										{/* <div className="mb-4">
										<button
											className="btn btn-sm btn-outline-primary w-100"
											onClick={() => this.setState({ showNewConfigModal: true })}
										>
											<i className="icon-plus"></i> Add New Configuration
										</button>
									</div> */}
									</div>
								</div>
							)}
						</div>
						{(window.user.role === 'employee') && (
							<div role="tabpanel" className="tab-pane vivify fadeIn" id="activity" aria-expanded="false">
								<ul className="new_timeline mt-3">
									{this.state.loading && (
										<li>
											<div className="desc">
												<h4>Loading...</h4>
											</div>
										</li>
									)}
									{!this.state.loading && this.state.activities.length === 0 && (
										<li>
											<div className="desc">
												<BlankState message="No activities found" />
											</div>
										</li>
									)}
									{this.state.activities.map((activity, idx) => {
										const type = activity.type;
										const bullet = (type === 'Punch_in' || type === 'Break_in') ? 'green' : (type === 'Punch_out' || type === 'Break_out') ? 'pink' : '';
										const label = (type === 'Punch_in') ? 'Punch In' : (type === 'Punch_out') ? 'Punch Out' : (type === 'Break_in') ? 'Break In' : 'Break Out';
										const time = (type === 'Punch_in' || type === 'Break_in') ? activity.in_time : activity.out_time;
										return (
											<li key={activity.id || idx}>
												<div className={`bullet ${bullet}`} />
												<div className="time">{time}</div>
												<div className="desc">
													<h3>{label}</h3>
												</div>
											</li>
										);
									})}
								</ul>
							</div>
						)}
					</div>
				</div>
				<ConfigModal
					show={showCloudModal}
					onClose={() => this.setState({ showCloudModal: false })}
					onSaveSuccess={() => {
						if (!this.state.enable_cloud_storage) {
							this.setState({ enable_cloud_storage: true }, () => {
								getService.editCall('Settings.php', 'update-global-dashboard-preferences', { enable_cloud_storage: true })
									.then((data) => {
										if (data.status === "success") {
											window.dispatchEvent(new CustomEvent('globalDashboardPrefsChanged', {
												detail: {
													show_todo: this.state.global_show_todo,
													show_project: this.state.global_show_project,
													enable_cloud_storage: true
												}
											}));
										}
									});
							});
						}
					}}
					onDeleteSuccess={() => {
						if (this.state.enable_cloud_storage) {
							this.setState({ enable_cloud_storage: false }, () => {
								getService.editCall('Settings.php', 'update-global-dashboard-preferences', { enable_cloud_storage: false })
									.then((data) => {
										if (data.status === "success") {
											window.dispatchEvent(new CustomEvent('globalDashboardPrefsChanged', {
												detail: {
													show_todo: this.state.global_show_todo,
													show_project: this.state.global_show_project,
													enable_cloud_storage: false
												}
											}));
										}
									});
							});
						}
					}}
					showSuccess={(msg) => {
						this.setState({ showSuccess: true, successMessage: msg });
						setTimeout(() => this.setState({ showSuccess: false }), 3000);
					}}
					showError={(msg) => {
						this.setState({ showError: true, errorMessage: msg });
						setTimeout(() => this.setState({ showError: false }), 3000);
					}}
					title="Cloud Storage Configuration"
					serviceName="cloudinary"
				/>
				<ConfigModal
					show={showNewConfigModal}
					onClose={() => this.setState({ showNewConfigModal: false })}
					showSuccess={(msg) => {
						this.setState({ showSuccess: true, successMessage: msg });
						setTimeout(() => this.setState({ showSuccess: false }), 3000);
					}}
					showError={(msg) => {
						this.setState({ showError: true, errorMessage: msg });
						setTimeout(() => this.setState({ showError: false }), 3000);
					}}
					title="Add New Configuration"
					serviceName=""
				/>
			</>
		);
	}
}

export default RightSidebar;
