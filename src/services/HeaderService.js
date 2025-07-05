import api from "../api/axios";

const HeaderService = {
  punchIn: (employee_id) => {
    const formData = new FormData();
    formData.append("employee_id", employee_id);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "active");
    return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, formData)
      .then(response => response.data);
  },

  punchOut: (employee_id) => {
    const formData = new FormData();
    formData.append("employee_id", employee_id);
    formData.append("activity_type", "Punch");
    formData.append("description", null);
    formData.append("status", "completed");
    return api.post(`${process.env.REACT_APP_API_URL}/activities.php?action=add-by-user`, formData)
      .then(response => response.data);
  },

  addReport: ({ employee_id, report, start_time, break_duration_in_minutes, end_time, todays_working_hours, todays_total_hours }) => {
    const formData = new FormData();
    formData.append("employee_id", employee_id);
    formData.append("report", report);
    formData.append("start_time", start_time);
    formData.append("break_duration_in_minutes", break_duration_in_minutes);
    formData.append("end_time", end_time);
    formData.append("todays_working_hours", todays_working_hours);
    formData.append("todays_total_hours", todays_total_hours);
    return api.post(`${process.env.REACT_APP_API_URL}/reports.php?action=add-report-by-user`, formData)
      .then(response => response.data);
  },

  getPunchInStatus: (user_id) => {
    return api.get(`${process.env.REACT_APP_API_URL}/activities.php?action=get_punch_status&user_id=${user_id}`)
      .then(response => response.data);
  },

  getActivities: (user_id) => {
    return api.get(`${process.env.REACT_APP_API_URL}/activities.php?action=break_calculation&user_id=${user_id}`)
      .then(response => response.data);
  },

  autoCloseActivities: (user_id, date) => {
    return api.get(`${process.env.REACT_APP_API_URL}/auto_close_breaks.php?user_id=${user_id}&date=${date}`)
      .then(response => response.data);
  },

  fetchNotifications: (user_id, limit = 5) => {
    return api.get(`${process.env.REACT_APP_API_URL}/notifications.php?action=get_notifications&user_id=${user_id}&limit=${limit}`)
      .then(response => response.data);
  },
  checkBirthdays: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/notifications.php?action=birthday_notify`)
      .then(response => response.data);
  },
  markAsRead: (user_id, notification_id = null) => {
    let apiUrl = `${process.env.REACT_APP_API_URL}/notifications.php?action=mark_read&user_id=${user_id}`;
    if (notification_id) {
      apiUrl += `&notification_id=${notification_id}`;
    }
    return api.get(apiUrl).then(response => response.data);
  },
};

export default HeaderService;