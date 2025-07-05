import api from "../api/axios";

const HolidaysService = {
  // Fetch holidays (GET)
  getHolidays: () => {
    return api.get(`${process.env.REACT_APP_API_URL}/events.php?action=view&event_type=holiday`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Add a new holiday (POST)
  addHoliday: (formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/events.php?action=add`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Update/Edit a holiday (POST)
  updateHoliday: (event_id, formData) => {
    return api.post(`${process.env.REACT_APP_API_URL}/events.php?action=edit&event_id=${event_id}`, formData)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Delete a holiday (DELETE)
  deleteHoliday: (event_id) => {
    return api.delete(`${process.env.REACT_APP_API_URL}/events.php?action=delete&event_id=${event_id}`)
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default HolidaysService;
