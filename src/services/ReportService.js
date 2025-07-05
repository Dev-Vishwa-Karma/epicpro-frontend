import api from "../api/axios";

const ReportService = {
  getEmployees: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  fetchReports: (params) => {
    let url = `${process.env.REACT_APP_API_URL}/reports.php?action=view&user_id=${params.user_id}`;
    if (params.from_date) url += `&from_date=${params.from_date}`;
    if (params.to_date) url += `&to_date=${params.to_date}`;
    return api.get(url)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  addReportByAdmin: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-admin`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  editReportByAdmin: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=edit-report-by-admin`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  updateReport: (report_id, formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/reports.php?action=update-report-by-user&report_id=${report_id}`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  deleteReport: (activityId, userId) => {
    return api.delete(`${process.env.REACT_APP_API_URL}/activities.php?action=delete&id=${activityId}&user_id=${userId}`)
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default ReportService;
