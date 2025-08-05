import React, { Component } from 'react'
import { connect } from 'react-redux';
import InputField from '../../common/formInputs/InputField';

class Applicant extends Component {

    render() {
        const { fixNavbar } = this.props;
        return (
            <>
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
                    <div className="container-fluid">

                        <div className="row clearfix row-deck">

                            <div className="card">
									<div className="card-body">
										<div className="row">
											<div className="col-lg-4 col-md-4 col-sm-6">
												<label>Search</label>
												<div className="input-group">
													<input
														type="text"
														className="form-control"
														placeholder="Search..."
													/>
												</div>
											</div>
											<div className="col-lg-3 col-md-4 col-sm-6">
												<label>Status</label>
												<div className="multiselect_div">
													<select className="custom-select">
														<option>None Selected</option>
														<option value="">All Status</option>
														<option value="pending">Pending</option>
														<option value="reviewed">Reviewed</option>
                                                        <option value="shortlisted">Shortlisted</option>
                                                        <option value="rejected">Rejected</option>
													</select>
												</div>
											</div>
											<div className="col-lg-3 col-md-4 col-sm-6">
												<label>Order</label>
												<div className="form-group">
													<select className="custom-select">
														<option>Newest first</option>
														<option value="0">Oldest first</option>
                                                        <option value="1">Newest first</option>
													</select>
												</div>
											</div>
											<div className="col-lg-2 col-md-4 col-sm-6">
												<label>&nbsp;</label>
												<a href="fake_url" className="btn btn-sm btn-primary btn-block">
													Filter
												</a>
											</div>
										</div>
									</div>
                            </div>
                            
                            
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Applicants</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped table-vcenter mb-0">
                                                <thead>
                                                    <tr>
                                                        <th />
                                                        <th>Name</th>
                                                        <th>Mobile</th>
                                                        <th>Applied On</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                        <th />
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="w60">
                                                            <img src="../assets/images/xs/avatar2.jpg" data-toggle="tooltip" data-placement="top" title="Avatar Name" alt="Avatar" className="w35 h35 rounded-circle" />
                                                        </td>
                                                        <td>
                                                            <div className="font-15">Marshall Nichols</div>
                                                            <span className="text-muted">marshall-n@gmail.com</span>
                                                        </td>
                                                        <td><span>9874745867</span></td>
                                                        <td>24 Jun, 2015</td>
                                                        <td>
                                                        <select className="custom-select">
														<option value="pending">Pending</option>
														<option value="reviewed">Reviewed</option>
                                                        <option value="hired">Hired</option>
                                                        <option value="rejected">Rejected</option>
													</select>
                                                        </td>
                                                        <td>
                                                            {/* <p>Resume Download</p> */}
                                                            <i className='fe fe-download'>Resume Download</i>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
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
    fixNavbar: state.settings.isFixNavbar,
})

const mapDispatchToProps = dispatch => ({

})
export default connect(mapStateToProps, mapDispatchToProps)(Applicant);