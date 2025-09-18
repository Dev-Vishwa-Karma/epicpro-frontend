import React, { Component } from 'react';
import { getService } from '../../../../services/getService';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import { withRouter } from 'react-router-dom';

class DashboardAdminTodo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			cards: [], // [{ employee: {id, first_name, last_name}, todos: [...] }]
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
				const filtered = this.filterYesterdayAndThisWeek(list);
				const grouped = this.groupByEmployee(filtered);
				this.setState({ loading: false, cards: grouped });
			} else {
				this.setState({ loading: false, cards: [] });
			}
		})
		.catch(() => this.setState({ loading: false, cards: [] }));
	}

	stripDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

	filterYesterdayAndThisWeek = (todos) => {
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		const startOfWeek = (() => {
			const d = new Date(today);
			const day = d.getDay();
			const diffToMonday = (day === 0 ? -6 : 1) - day;
			d.setDate(d.getDate() + diffToMonday);
			d.setHours(0,0,0,0);
			return d;
		})();
		const endOfWeek = (() => {
			const e = new Date(startOfWeek);
			e.setDate(startOfWeek.getDate() + 6);
			e.setHours(23,59,59,999);
			return e;
		})();

		return (todos || []).filter(t => {
			const due = new Date(t.due_date);
			const dueDateOnly = this.stripDate(due).getTime();
			const yOnly = this.stripDate(yesterday).getTime();
			const isYesterday = dueDateOnly === yOnly;
			const isThisWeek = due >= startOfWeek && due <= endOfWeek;
			return isYesterday || isThisWeek;
		});
	};

	groupByEmployee = (todos) => {
		const map = new Map();
		(todos || []).forEach(t => {
			const key = t.employee_id;
			if (!map.has(key)) {
				map.set(key, {
					employee: { id: t.employee_id, first_name: t.first_name, last_name: t.last_name },
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
		return d.toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'short', year:'numeric' });
	};

	renderCard = (card) => {
		return (
			<div className="col-md-3" key={card.employee.id}>
				<div className="card shadow-lg" style={{borderTop:"5px solid blue", height: "300px", display: "flex", flexDirection: "column" }}>
					{/* <div className="card-status bg-primary" style={{ position: "sticky", top: 0, zIndex: 2, height: "4px" }} /> */}
					<div className="card-header">
						<h3 className="card-title">
							{card.employee.first_name} {card.employee.last_name}
						</h3>
					</div>
					<div className="card-body todo_list" style={{ overflowY: "auto", flexGrow: 1 }}>
						<ul className="list-unstyled mb-0">
							{card.todos.sort((a,b) => new Date(a.due_date) - new Date(b.due_date)).map(t => (
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
										<span className="ml-2">{t.title}</span>
										{/* <span className={`tag ml-2 ${String(t.priority).toLowerCase()==='high' ? 'tag-danger' : String(t.priority).toLowerCase()==='medium' ? 'tag-warning' : 'tag-success'}`}>{(t.priority||'low').toUpperCase()}</span> */}
									</div>
									<small className="text-muted d-block">
										{this.formatFriendlyDate(t.due_date)}
									</small>
								</li>
							))}
						</ul>
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