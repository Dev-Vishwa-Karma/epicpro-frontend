import api from "../api/axios";

const StatisticService = {
  getEmployees: ({ year, month }) => {
    const params = {
      action: 'view',
      role: 'employee',
      status: 1,
      year,
      month,
      statistics_visibility_status: 'statistics_visibility_status'
    };
    return api.get(`${process.env.REACT_APP_API_URL}/get_employees.php`, { params })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch reports for a date range
  getReports: ({ fromDate, toDate }) => {
    return api.get(`${process.env.REACT_APP_API_URL}/reports.php`, {
      params: { action: 'view', from_date: fromDate, to_date: toDate }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch approved leaves
  getLeaves: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=view&status=approved`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch alternate Saturdays for a year and month
  getAlternateSaturdays: ({ year, month }) => {
    return api.get(`${process.env.REACT_APP_API_URL}/alternate_saturdays.php`, {
      params: { action: 'view', year, month }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Fetch holidays
  getHolidays: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/events.php`, {
      params: { action: 'view', event_type: 'holiday' }
    })
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default StatisticService;
