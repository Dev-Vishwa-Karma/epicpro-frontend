import React, { Component } from 'react';
import NoDataRow from '../../common/NoDataRow';
import Pagination from '../../common/Pagination';

class UserTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            dataPerPage: 10,
        };
    }

    componentDidMount() {
        // Initialize pagination state
        this.setState({
            currentPage: 1
        });
    }

    // Handle Pagination of users listing
    handlePageChange = (newPage) => {
        const totalPages = Math.ceil(this.props.users.length / this.state.dataPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            this.setState({ currentPage: newPage });
        }
    };

    render() {
        const {
            users,
            loading,
            onEditUser,
            onDeleteUser,
            searchUser
        } = this.props;

        const { currentPage, dataPerPage } = this.state;

        // Handle empty users data safely
        const userList = (users || []).length > 0 ? users : [];

        // Pagination Logic for Users
        const indexOfLastUser = currentPage * dataPerPage;
        const indexOfFirstUser = indexOfLastUser - dataPerPage;
        const currentUsers = userList.slice(indexOfFirstUser, indexOfLastUser);
        const totalPages = Math.ceil(userList.length / dataPerPage);

        return (
            <>
                <div className="card-header">
                    <h3 className="card-title">User List</h3>
                    <div className="card-options">
                        <div className="input-icon ml-2">
                            <span className="input-icon-addon">
                                <i className="fe fe-search" />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search user..."
                                name="search"
                                value={searchUser}
                                onChange={this.props.onSearch}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? (
                            <div className="card-body">
                                <div className="dimmer active">
                                    <div className="loader" />
                                </div>
                            </div>
                        ) : (
                            <table className="table table-striped table-hover table-vcenter text-nowrap mb-0">
                                <thead>
                                    <tr>
                                        <th className="w60">Name</th>
                                        <th />
                                        <th>Role</th>
                                        <th>Created Date</th>
                                        <th>Position</th>
                                        <th className="w100">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map((user, index) => (
                                            <tr key={index}>
                                                <td className="width45">
                                                    {user.profile ? (
                                                        <img 
                                                            src={`${process.env.REACT_APP_API_URL}/${user.profile}`} 
                                                            className="avatar avatar-blue add-space" 
                                                            alt={`${user.first_name} ${user.last_name}`}
                                                            data-toggle="tooltip" 
                                                            data-placement="top" 
                                                            title={`${user.first_name} ${user.last_name}`}
                                                            style={{
                                                                width: '40px', 
                                                                height: '40px', 
                                                                borderRadius: '50%', 
                                                                objectFit: 'cover'
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
                                                            title={`${user.first_name} ${user.last_name}`}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <h6 className="mb-0">{`${user.first_name} ${user.last_name}`}</h6>
                                                    <span>{user.email}</span>
                                                </td>
                                                <td>
                                                    <span className={
                                                        `tag ${
                                                            user.role === 'super_admin'
                                                                ? 'tag-danger'
                                                                : user.role === 'admin'
                                                                ? 'tag-info' : user.role === null ? 'tag-default'
                                                                : 'tag-default'
                                                            }`}
                                                    >
                                                        {user.role 
                                                        ? user.role.split('_')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                            .join(' ')
                                                        : 'No Role'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {new Intl.DateTimeFormat('en-US', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    }).format(new Date(user.created_at))}
                                                </td>
                                                <td>{user.department_name}</td>
                                                <td>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-icon"
                                                        title="Edit"
                                                        data-toggle="modal"
                                                        data-target="#editUserModal"
                                                        onClick={() => onEditUser && onEditUser(user)}
                                                    >
                                                        <i className="fa fa-edit" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-icon js-sweetalert"
                                                        title="Delete"
                                                        data-type="confirm"
                                                        onClick={() => onDeleteUser && onDeleteUser(user.id)}
                                                        data-toggle="modal"
                                                        data-target="#deleteUserModal"
                                                    >
                                                        <i className="fa fa-trash-o text-danger" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <NoDataRow colSpan={6} message="User not found" />
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Only show pagination if there are users */}
                {totalPages > 1 && (
                    <div className="card-footer">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={this.handlePageChange}
                        />
                    </div>
                )}
            </>
        );
    }
}

export default UserTable;