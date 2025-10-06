import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Avatar from '../../../common/Avatar';
import { isOverduePending, filterUpToTomorrow } from '../../../../utils';

class DashboardTodo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			todos: [],
		};
	}

	componentDidMount() {
		// Only fetch for employee role
		if (!(window.user && window.user.role === 'employee')) {
			this.setState({ loading: false, todos: [] });
			return;
		}

		getService.getCall('project_todo.php', {
			action: 'view',
			status: 'pending',
			logged_in_employee_id: window.user.id,
			role: 'employee',
			// day: 'upto_tomorrow'
		})
		.then(res => {
			if (res.status === 'success') {
				const list = Array.isArray(res.data) ? res.data : [];
				// Sort todos by due date (oldest first)
				// const sortedTodos = list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
				const filtered = filterUpToTomorrow(list);
				// Sort todos by due date (oldest first)
				const sortedTodos = filtered.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
				this.setState({ todos: sortedTodos, loading: false });
			} else {
				this.setState({ todos: [], loading: false });
			}
		})
		.catch(() => this.setState({ todos: [], loading: false }));
	}

	getSeparatorLabel = (dateStr) => {
		const dateObj = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		const tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		
		const strip = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
		const dateNoTime = strip(dateObj);
		const todayNoTime = strip(today);
		const yesterdayNoTime = strip(yesterday);
		const tomorrowNoTime = strip(tomorrow);
		
		if (dateNoTime.getTime() === todayNoTime.getTime()) {
			return 'Today';
		}
		if (dateNoTime.getTime() === yesterdayNoTime.getTime()) {
			return 'Yesterday';
		}
		if (dateNoTime.getTime() === tomorrowNoTime.getTime()) {
			return 'Tomorrow';
		}
		return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
	};

	renderTimeline = (todos) => {
		return (
			<div>
				{todos.map((item, index) => {
					let showSeparator = false;
					let displayDate = '';
					const currentDateStr = String(item.due_date).split('T')[0];
					
					if (index === 0) {
						showSeparator = true;
					} else {
						const prevDateStr = String(todos[index - 1].due_date).split('T')[0];
						if (currentDateStr !== prevDateStr) showSeparator = true;
					}
					
					if (showSeparator && currentDateStr) {
						displayDate = this.getSeparatorLabel(currentDateStr);
					}
					
					return (
						<React.Fragment key={item.id}>
							{showSeparator && displayDate && (
								<div className='date-seperator'>
									<div className='date-border'/>
									<div className='date-show'>
										<i className="fa fa-calendar-alt" style={{ marginRight: 6, color: '#9ca3af' }}></i>
										{displayDate}
									</div>
									<div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
								</div>
							)}
							<div className="timeline_item" style={{paddingTop: '10px', paddingBottom: '10px'}}>
								<Avatar
									profile={item.profile}
									first_name={item.first_name}
									last_name={item.last_name}
									size={35}
									className="avatar avatar-blue add-space tl_avatar employee-task-avtar"
									
								/>
								<span>
									<a href="#" style={{fontWeight:"800"}}>{item.first_name} {item.last_name}</a>
									<span className="mx-2">|</span>
									<span className={`tag ml-0 mr-2 ${String(item.priority).toLowerCase()==='high' ? 'tag-danger' : String(item.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(item.priority || 'low').toUpperCase()}</span>
									<span>
										{isOverduePending(item) && (
											<span className="tag over-due">Overdue</span>
										)}
									</span>
									<small className="float-right text-right">
										{new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
									</small> 
								</span>
								<h6 className="text-secondary" style={{marginTop: 4}}>
									<span className='task-title-employee'
									>
										{item.title}
									</span>
								</h6>
							</div>
						</React.Fragment>
					);
				})}
			</div>
		);
	};

	render() {
		const { loading, todos } = this.state;
		if (!(window.user && window.user.role === 'employee')) return null;

		// If no todos, hide entire section
		if (!loading && todos.length === 0) return null;

		return (
			<div className="card">
				<div className="card-header">
					<h3 className="card-title">My Pending Todos</h3>
				</div>
				<div className="card-body">
					{loading ? (
						<div className="dimmer active p-3">
							<TableSkeleton columns={3} rows={3} />
						</div>
					) : (
						<div>
							{todos.length > 0 ? (
								this.renderTimeline(todos)
							) : null}
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default DashboardTodo;