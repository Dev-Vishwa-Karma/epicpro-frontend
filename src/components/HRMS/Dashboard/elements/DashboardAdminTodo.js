import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import { withRouter } from 'react-router-dom';
import Avatar from '../../../common/Avatar';

class DashboardAdminTodo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			cards: [], // [{ employee: {id, first_name, last_name, profile}, todos: [...] }]
		};
	}

	componentDidMount() {
		if (!(window.user && (window.user.role === 'admin' || window.user.role === 'super_admin'))) {
			this.setState({ loading: false, cards: [] });
			return;
		}

		getService.getCall('project_todo.php', {
			action: 'view',
			status: 'pending',
			logged_in_employee_id: window.user.id,
			role: window.user.role
		})
		.then(res => {
			if (res.status === 'success') {
				const list = Array.isArray(res.data) ? res.data : [];
				const filtered = this.filterUpToTomorrow(list);
				const grouped = this.groupByEmployee(filtered);
				this.setState({ loading: false, cards: grouped });
			} else {
				this.setState({ loading: false, cards: [] });
			}
		})
		.catch(() => this.setState({ loading: false, cards: [] }));
	}

	stripDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

	groupByEmployee = (todos) => {
		const map = new Map();
		(todos || []).forEach(t => {
			const key = t.employee_id;
			if (!map.has(key)) {
				map.set(key, {
					employee: { id: t.employee_id, first_name: t.first_name, last_name: t.last_name, profile: t.profile },
					todos: []
				});
			}
			map.get(key).todos.push(t);
		});
		return Array.from(map.values()).sort((a,b) => (a.employee.first_name||'').localeCompare(b.employee.first_name||''));
	};

	formatFriendlyDate = (dateStr) => {
		const d = new Date(dateStr);
		const today = new Date();
		const strip = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
		const t = strip(today);
		const y = new Date(t); y.setDate(t.getDate() - 1);
		const tm = new Date(t); tm.setDate(t.getDate() + 1);
		const ds = strip(d).getTime();
		if (ds === t.getTime()) return 'Today';
		if (ds === y.getTime()) return 'Yesterday';
		if (ds === tm.getTime()) return 'Tomorrow';
		return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
	};

	isOverduePending = (todo) => {
		const status = (todo.todoStatus || todo.status || '').toString().toLowerCase();
		const dueStr = String(todo.due_date || '').slice(0, 10);
		if (!dueStr) return false;
		const today = new Date();
		const y = today.getFullYear();
		const m = String(today.getMonth() + 1).padStart(2, '0');
		const d = String(today.getDate()).padStart(2, '0');
		const todayStr = `${y}-${m}-${d}`;
		return status === 'pending' && dueStr < todayStr;
	};

	filterUpToTomorrow = (todos) => {
		const strip = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
		const today = strip(new Date());
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		const tomorrowTime = strip(tomorrow).getTime();
		return (todos || []).filter(t => {
			const due = new Date(t.due_date);
			if (isNaN(due)) return false;
			const dueTime = strip(due).getTime();
			return dueTime <= tomorrowTime;
		});
	};

	renderCard = (card) => {
		return (
			<div className="col-md-4" key={card.employee.id}>
				<div className="card admin-task-card" >
					<div className="card-header d-flex align-items-center">
						<Avatar
							profile={card.employee.profile}
							first_name={card.employee.first_name}
							last_name={card.employee.last_name}
							size={32}
							style={{ marginRight: 8 }}
						/>
						<h3 className="card-title mb-0">
							{card.employee.first_name} {card.employee.last_name}
						</h3>
					</div>
					<div className="card-body todo_list" style={{ overflowY: "auto", flexGrow: 1 }}>
						<ul className="list-unstyled mb-0">
							{this.filterUpToTomorrow(card.todos).sort((a,b) => new Date(a.due_date) - new Date(b.due_date)).map(t => (
								<li
									key={t.id}
									className="mb-2"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										const date = t.due_date.slice(0, 10);
										this.props.history.push(`/project-todo?employee_id=${t.employee_id}&status=${t.todoStatus}&date=${date}`);
									}}
								>
									<div className="d-flex align-items-center justify-content-between">
										<span
											className="ml-2 task-title-admin"
										>
											{t.title}
										</span>
										{/* <span className={`tag ml-2 ${String(t.priority).toLowerCase()==='high' ? 'tag-danger' : String(t.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(t.priority||'low').toUpperCase()}</span> */}
									</div>
									<small className="text-muted d-block">
										{this.formatFriendlyDate(t.due_date)}{' '}
										{this.isOverduePending(t) && (
											<span className="badge badge-danger text-uppercase">Overdue</span>
										)}
										<span className={`ml-2 badge ${String(t.priority).toLowerCase()==='high' ? 'tag-danger' : String(t.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(t.priority||'low').toUpperCase()}</span>
									</small>
								</li>
							))}
						</ul>
					</div>
					<div className="mt-2 mb-2 mr-4 text-right">
						<button
							type="button"
							className="btn p-0 view-all"
							onClick={() => this.props.history.push(`/project-todo?employee_id=${card.employee.id}&status=pending&day=all`)}
						>
							View All
							{/* <span className="arrow">&#8594;</span> */}
							<span className="arrow"><i className='fa fa-arrow-right'></i></span>
						</button>
					</div>
				</div>
			</div>
		);
	};

	render() {
		const { loading, cards } = this.state;
		if (!(window.user && (window.user.role === 'admin' || window.user.role === 'super_admin'))) return null;
		if (!loading && (!cards || cards.length === 0)) return null;

		return (
			<div className='container mt-2 mb-2'>
				<div className='card'>
					<div className="card-header">
						<h3 className="card-title">Employees Todos</h3>
					</div>
				</div>
				{loading ? (
					<div className='p-3'><TableSkeleton columns={3} rows={3} /></div>
				) : (
					<div className='row'>
						{cards.map(this.renderCard)}
					</div>
				)}
			</div>
		);
	}
}

export default withRouter(DashboardAdminTodo);