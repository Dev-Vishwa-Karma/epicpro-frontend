import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import Avatar from '../../../common/Avatar';

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
			logged_in_employee_id: window.user.id,
			role: 'employee'
		})
		.then(res => {
			if (res.status === 'success') {
				const list = Array.isArray(res.data) ? res.data : [];
				const weekTodos = this.filterThisWeek(list);
				this.setState({ todos: weekTodos, loading: false });
			} else {
				this.setState({ todos: [], loading: false });
			}
		})
		.catch(() => this.setState({ todos: [], loading: false }));
	}

	getStartOfWeek = (date) => {
		const d = new Date(date);
		const day = d.getDay();
		const diffToMonday = (day === 0 ? -6 : 1) - day;
		d.setDate(d.getDate() + diffToMonday);
		d.setHours(0,0,0,0);
		return d;
	};

	getEndOfWeek = (date) => {
		const start = this.getStartOfWeek(date);
		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23,59,59,999);
		return end;
	};

	toYmd = (date) => {
		const d = new Date(date);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	};

	filterThisWeek = (todos) => {
		const today = new Date();
		const start = this.getStartOfWeek(today);
		const end = this.getEndOfWeek(today);
		return (todos || []).filter(t => {
			const due = new Date(t.due_date);
			return due >= start && due <= end;
		});
	};

	getGroups = () => {
		const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		const now = new Date();
		const todayStr = this.toYmd(now);
		const tomorrow = new Date(now);
		tomorrow.setDate(now.getDate() + 1);
		const tomorrowStr = this.toYmd(tomorrow);
		const groups = [
            { key: todayStr, label: `Today` },
			{ key: tomorrowStr, label: `Tomorrow` }
		];
		// Remaining weekdays of this week
		let cursor = new Date(tomorrow);
		const end = this.getEndOfWeek(now);
		while (true) {
			cursor.setDate(cursor.getDate() + 1);
			if (cursor > end) break;
			groups.push({ key: this.toYmd(cursor), label: days[cursor.getDay()] });
		}
		return groups;
	};

	getTodosForDay = (dateKey, todos) => {
		return (todos || []).filter(t => String(t.due_date).slice(0,10) === dateKey);
	};

	getInlineDayLabel = (dateStr) => {
		const d = new Date(dateStr);
		const today = new Date();
		const tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		const strip = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());
		const ds = strip(d), ts = strip(today), tms = strip(tomorrow);
		if (ds.getTime() === ts.getTime()) return 'Today';
		if (ds.getTime() === tms.getTime()) return 'Tomorrow';
		return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
	};

	getSeparatorLabel = (dateStr) => {
		const dateObj = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		const strip = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
		const dateNoTime = strip(dateObj);
		const todayNoTime = strip(today);
		const yesterdayNoTime = strip(yesterday);
		if (dateNoTime.getTime() === todayNoTime.getTime()) {
			return 'Today';
		}
		if (dateNoTime.getTime() === yesterdayNoTime.getTime()) {
			return 'Yesterday';
		}
		return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
	};

	renderTimeline = (todos) => {
		const sorted = (todos || []).slice().sort((a,b) => new Date(a.due_date) - new Date(b.due_date));
		return (
			<div>
				{sorted.map((item, index) => {
					let showSeparator = false;
					let displayDate = '';
					const currentDateStr = String(item.due_date).split('T')[0];
					if (index === 0) {
						showSeparator = true;
					} else {
						const prevDateStr = String(sorted[index - 1].due_date).split('T')[0];
						if (currentDateStr !== prevDateStr) showSeparator = true;
					}
					if (showSeparator && currentDateStr) {
						displayDate = this.getSeparatorLabel(currentDateStr);
					}
					return (
						<React.Fragment key={item.id}>
							{showSeparator && displayDate && (
								<div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', width: '100%' }}>
									<div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
									<div style={{ margin: '0 12px', padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '999px', background: '#fff', color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>
										<i className="fa fa-calendar-alt" style={{ marginRight: 6, color: '#9ca3af' }}></i>
										{this.getInlineDayLabel(item.due_date)}
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
									className="avatar avatar-blue add-space tl_avatar"
									style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f5' }}
								/>
								<span>
									<a href="#" style={{fontWeight:"800"}}>{item.first_name} {item.last_name}</a>
									<span className="mx-2">|</span>
									<span className={`tag ml-0 mr-2 ${String(item.priority).toLowerCase()==='high' ? 'tag-danger' : String(item.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(item.priority || 'low').toUpperCase()}</span>
									{/* <span className={`tag ml-0 mr-2 ${String(item.todoStatus).toLowerCase()==='Completed' ? 'tag-primary' : String(item.todoStatus).toLowerCase()==='pending' ? 'tag-danger' : 'tag-success'}`}>{(item.todoStatus).toUpperCase()}</span> */}
									<small className="float-right text-right">
										{new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
									</small> 
								</span>
								<h6 className="text-secondary" style={{marginTop: 4}}>
									{item.title}
								</h6>
							</div>
						</React.Fragment>
					);
				})}
			</div>
		);
	};

	renderListForDay = (dateKey, todos) => {
		const items = this.getTodosForDay(dateKey, todos);
		if (!items.length) return null;
		return (
			<div>
				{items.sort((a,b) => new Date(a.due_date) - new Date(b.due_date)).map(item => (
					<div key={item.id} className="timeline_item" style={{paddingTop: '10px', paddingBottom: '10px'}}>
						<Avatar
							profile={item.profile}
							first_name={item.first_name}
							last_name={item.last_name}
							size={35}
							className="avatar avatar-blue add-space tl_avatar"
							style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5f5f5' }}
						/>
						<span>
							<a href="#" style={{fontWeight:"800"}}>{item.first_name} {item.last_name}</a>
							<span className="mx-2">|</span>
							<span className={`tag ml-0 mr-2 ${String(item.priority).toLowerCase()==='high' ? 'tag-danger' : String(item.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(item.priority || 'low').toUpperCase()}</span>
							<span className="text-secondary">{this.getInlineDayLabel(item.due_date)}</span>
							<small className="float-right text-right">
								{new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
							</small>
							<small className="float-right text-right d-block" style={{ marginTop: 2 }}>
								{String(item.todoStatus).toLowerCase()==='completed' ? 'Completed' : 'Pending'}
							</small>
						</span>
						<h6 className="text-secondary" style={{marginTop: 4}}>
							{item.title}
						</h6>
					</div>
				))}
			</div>
		);
	};

	render() {
		const { loading, todos } = this.state;
		if (!(window.user && window.user.role === 'employee')) return null;

		const groups = this.getGroups();
		const anyThisWeek = (todos || []).length > 0;

		// If no todos for this week, hide entire section
		if (!loading && !anyThisWeek) return null;

		return (
			<div className="card">
				<div className="card-header">
					<h3 className="card-title">My Todos This Week</h3>
				</div>
				<div className="card-body">
					{loading ? (
						<div className="dimmer active p-3">
							<TableSkeleton columns={3} rows={3} />
						</div>
					) : (
						<div>
							{anyThisWeek ? (
								// Render as a single timeline with date separators like ActivitiesTime
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