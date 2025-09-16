import React from 'react';
import TableSkeleton from '../../../common/skeletons/TableSkeleton';
import NoDataRow from '../../../common/NoDataRow';
import Avatar from '../../../common/Avatar';
import Button from '../../../common/formInputs/Button';
import { formatDueLabel } from '../../../../utils';

const TodoTable = ({
    todos,
    loading,
    currentTodos,
    logged_in_employee_role,
    handleCheckboxClick,
    handleEditTodo,
    handleDeleteClick
}) => {
    return (
        <div className="table-responsive todo_list">
            <table className="table table-hover table-striped table-vcenter mb-0">
                <thead>
                    <tr>
                        <th><p className="w150">Task</p></th>
                        <th className="w150 text-right">Due</th>
                        <th className="w100">Priority</th>
                        {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                            <>
                                <th className="w80"><i className="icon-user" /></th>
                                <th className="w150">Action</th>
                            </>
                        )}
                    </tr>
                </thead>
                {loading ? (
                    <tbody>
                        <tr>
                            <td colSpan="5">
                                <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                                    <TableSkeleton columns={4} rows={currentTodos.length} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {currentTodos && currentTodos.length > 0 ? (
                            currentTodos.map((todo, index) => (
                                <tr key={index} style={
                                    (logged_in_employee_role !== 'employee' && todo.hidden_for_employee)
                                        ? { textDecoration: 'line-through', opacity: 0.6 }
                                        : {}
                                }>
                                    <td>
                                        <label className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                checked={todo.todoStatus === 'completed'}
                                                onChange={() => handleCheckboxClick(todo)}
                                            />
                                            <span className="custom-control-label">{todo.title}</span>
                                        </label>
                                    </td>
                                    <td className="text-right">
                                        {formatDueLabel(todo.due_date)}
                                    </td>
                                    <td>
                                        <span className={`tag ml-0 mr-0 ${
                                            todo.priority === "high" ? "tag-danger"
                                            : todo.priority === "medium" ? "tag-warning"
                                            : "tag-success"
                                        }`}>
                                            {todo.priority.toUpperCase()}
                                        </span>
                                    </td>
                                    {(logged_in_employee_role === "admin" || logged_in_employee_role === "super_admin") && (
                                        <>
                                            <td>
                                                <Avatar
                                                    profile={todo.profile}
                                                    first_name={todo.first_name}
                                                    last_name={todo.last_name}
                                                    size={40}
                                                    className="avatar avatar-blue add-space"
                                                    style={{ objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = '/assets/images/sm/avatar2.jpg';
                                                    }}
                                                    data-toggle="tooltip"
                                                    data-placement="top"
                                                    title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Button
                                                    icon="fa fa-edit"
                                                    onClick={() => handleEditTodo(todo)}
                                                    className="btn-icon"
                                                    title="Edit"
                                                    />

                                                    <Button
                                                    icon="fa fa-trash-o text-danger"
                                                    onClick={() => handleDeleteClick(todo)}
                                                    className="btn-icon btn-sm js-sweetalert"
                                                    title="Delete"
                                                    />
                                                </div>
                                            </td>
                                        </>
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
    );
};

export default TodoTable;
