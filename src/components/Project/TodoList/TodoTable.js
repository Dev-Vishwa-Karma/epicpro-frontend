import React, { Component } from 'react';
import NoDataRow from '../../common/NoDataRow';
import Pagination from '../../common/Pagination';

class TodoTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPageTodos: 1,
            dataPerPage: 10,
        };
    }

    componentDidMount() {
        // Initialize pagination state
        this.setState({
            currentPageTodos: 1
        });
    }

    // Handle Pagination of todos listing
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.props.todos.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPageTodos: newPage });
        }
    };

    render() {
        const {
            todos,
            loading,
            logged_in_employee_role,
            onCheckboxClick,
            onEditTodo,
            onDeleteTodo
        } = this.props;

        const { currentPageTodos, dataPerPage } = this.state;

        // Handle empty todos data safely
        const todoList = (todos || []).length > 0 ? todos : [];

        // Pagination Logic for Todos
        const indexOfLastTodo = currentPageTodos * dataPerPage;
        const indexOfFirstTodo = indexOfLastTodo - dataPerPage;
        const currentTodos = todoList.slice(indexOfFirstTodo, indexOfLastTodo);
        const totalPagesTodos = Math.ceil(todoList.length / dataPerPage);

        return (
            <>
                <div className="card-body">
                    <div className="table-responsive todo_list">
                        <table className="table table-hover table-striped table-vcenter mb-0">
                            <thead>
                                <tr>
                                    <th>
                                        <p className="w150">Task</p>
                                    </th>
                                    <th className="w150 text-right">Due</th>
                                    <th className="w100">Priority</th>
                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                        <th className="w80"><i className="icon-user" /></th>
                                    )}
                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                        <th className="w150">Action</th>
                                    )}
                                </tr>
                            </thead>
                            {loading ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="5">
                                            <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                                                <div className="loader" />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {currentTodos && currentTodos.length > 0 ? (
                                        currentTodos.map((todo, index) => (
                                            <tr key={index+1} style={
                                                (logged_in_employee_role !== 'employee' && todo.hidden_for_employee)
                                                    ? { textDecoration: 'line-through', opacity: 0.6 }
                                                    : {}
                                            }>
                                                <td>
                                                    <label className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="example-checkbox1"
                                                            checked={todo.todoStatus === 'completed'}
                                                            onChange={() => onCheckboxClick && onCheckboxClick(todo)}
                                                        />
                                                        <span className="custom-control-label">{todo.title}</span>
                                                    </label>
                                                </td>
                                                <td className="text-right">
                                                    {new Date(todo.due_date).toLocaleString("en-US", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }).replace(",", "")}
                                                </td>
                                                <td>
                                                    <span className={`tag ml-0 mr-0 ${
                                                        todo.priority === "high"
                                                            ? "tag-danger"
                                                            : todo.priority === "medium"
                                                            ? "tag-warning"
                                                            : "tag-success"
                                                        }`}
                                                    >
                                                        {todo.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                    <td>
                                                        {todo.profile && !todo.imageError ? (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL}/${todo.profile}`}
                                                                className="avatar avatar-blue add-space"
                                                                alt={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                data-toggle="tooltip"
                                                                data-placement="top"
                                                                title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                }}
                                                                onError={e => {
                                                                    e.target.src = '/assets/images/sm/avatar2.jpg';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                    className="avatar avatar-blue add-space"
                                                                    data-toggle="tooltip"
                                                                    data-placement="top"
                                                                    title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                                    style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    borderRadius: '50%',
                                                                }}
                                                            >
                                                                {(todo.first_name ? todo.first_name.charAt(0) : '').toUpperCase()}
                                                                {(todo.last_name ? todo.last_name.charAt(0) : '').toUpperCase()}
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-icon"
                                                                    title="Edit"
                                                                    onClick={() => onEditTodo && onEditTodo(todo)}
                                                                >
                                                                    <i className="fa fa-edit" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-icon btn-sm js-sweetalert"
                                                                    title="Delete"
                                                                    onClick={() => onDeleteTodo && onDeleteTodo(todo)}
                                                                >
                                                                    <i className="fa fa-trash-o text-danger" />
                                                                </button>
                                                            </>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <NoDataRow colSpan={7} message="Todo not available." />
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>

                {/* Only show pagination if there are todos */}
                {totalPagesTodos > 1 && (
                    <div className="mt-3">
                        <Pagination
                            currentPage={currentPageTodos}
                            totalPages={totalPagesTodos}
                            onPageChange={this.handlePageChange}
                        />
                    </div>
                )}
            </>
        );
    }
}

export default TodoTable;