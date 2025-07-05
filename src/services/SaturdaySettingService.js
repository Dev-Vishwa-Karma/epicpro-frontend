import api from "../api/axios";

const SaturdaySettingService = {
  getAlternateSaturdays: (year) => {
    return api.get(`${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=view&year=${year}`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  saveAlternateSaturdays: (saturdays) => {
    return api.post(
      `${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=add`,
      { saturdays },
      { headers: { 'Content-Type': 'application/json' } }
    )
      .then(response => response.data)
      .catch(error => { throw error; });
  }
};

export default SaturdaySettingService;
