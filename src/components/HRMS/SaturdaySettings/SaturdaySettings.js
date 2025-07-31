import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../common/AlertMessages";
import { getService } from "../../../services/getService";
import YearSelector from "../../common/YearSelector";
class SaturdaySettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: new Date().getFullYear(),
      toggle: true,
      checkedDates: {}, // Local state for user-selected dates
      databaseCheckedDates: {}, // State to store the dates fetched from the database
    };
    this.years = [2025, 2026, 2027, 2028, 2029];
    this.currentDate = new Date();
  }

  componentDidMount() {
    this.fetchSavedSaturdays();
  }

  // Function to fetch all saturdays of a specific year
  getAllSaturdaysInYear = (year) => {
    const saturdays = [];
    const date = new Date(year, 0, 1);
    while (date.getFullYear() === year) {
      if (date.getDay() === 6) {
        saturdays.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return saturdays;
  };

  // Function to fetch all saturdays of a specific month
  getSaturdaysInMonth = (year, month) => {
    const saturdays = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === 6) {
        saturdays.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return saturdays;
  };

  // Handle checkbox change (both for individual selection and toggle select)
  handleCheckboxChange = (clickedMonth, clickedDateStr) => {
    this.setState((prevState) => {
      const { toggle, selectedYear, checkedDates, databaseCheckedDates } =
        prevState;
      let newChecked = { ...checkedDates };

      if (toggle) {
        // Clear previous selections if toggle is true
        newChecked = {};
        this.removeFutureDates(databaseCheckedDates);
        const saturdays = this.getAllSaturdaysInYear(selectedYear);
        let startIndex = saturdays.findIndex(
          (date) => date.toDateString().split("T")[0] === clickedDateStr
        );

        if (startIndex !== -1) {
          for (let i = startIndex; i < saturdays.length; i += 2) {
            const date = saturdays[i];
            const dStr = date.toDateString().split("T")[0];
            const monthKey = `${selectedYear}-${date.getMonth()}`;
            if (!newChecked[monthKey]) newChecked[monthKey] = {};
            newChecked[monthKey][dStr] = true;
          }
        }
      } else {
        // If toggle is false, allow individual checkbox selection without clearing
        const monthKey = `${selectedYear}-${clickedMonth}`;
        if (databaseCheckedDates[monthKey]?.hasOwnProperty(clickedDateStr)) {
          databaseCheckedDates[monthKey][clickedDateStr] =
            !databaseCheckedDates[monthKey][clickedDateStr];
        } else if (newChecked[monthKey]?.hasOwnProperty(clickedDateStr)) {
          newChecked[monthKey][clickedDateStr] =
            !newChecked[monthKey][clickedDateStr];
        } else {
          if (!newChecked[monthKey]) newChecked[monthKey] = {};
          newChecked[monthKey][clickedDateStr] = true;
        }
      }

      return { checkedDates: newChecked };
    });
  };

  removeFutureDates = (datesObject) => {
    const currentDate = new Date();

    // Loop through each year-month key in the object
    Object.keys(datesObject).forEach((yearMonthKey) => {
      const monthDates = datesObject[yearMonthKey];

      // Loop through each date in the month's dates
      Object.keys(monthDates).forEach((dateStr) => {
        const date = new Date(dateStr);

        // If the date is in the future, delete it from the object
        if (date > currentDate) {
          delete monthDates[dateStr];
        }
      });

      // If the month has no dates left after removing future dates, delete the entire month key
      if (Object.keys(monthDates).length === 0) {
        delete datesObject[yearMonthKey];
      }
    });

    return datesObject;
  };

  // Check if a date is selected
  isChecked = (month, dateStr) => {
    const { selectedYear, checkedDates, databaseCheckedDates } = this.state;
    const monthKey = `${selectedYear}-${month}`;
    // Prioritize local checkedDates over databaseCheckedDates
    return (
      checkedDates[monthKey]?.[dateStr] ||
      databaseCheckedDates[monthKey]?.[dateStr] ||
      false
    );
  };

  // Handle year change and refetch saved saturdays
  handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    this.setState({ selectedYear: newYear }, () => {
      // Fetch saved saturdays for the new year after updating the state
      this.fetchSavedSaturdays();
    });
  };

  // Handle toggle change
  handleToggleChange = (e) => {
    this.setState({ toggle: e.target.checked });
  };

  // Fetch saved saturdays for the selected year from the database
  fetchSavedSaturdays = async () => {
    const { selectedYear } = this.state;

    try {
      const data = await getService.getCall('alternate_saturdays.php', {
        action: 'view',
        year:selectedYear
      })


      if (data.status === "success" && Array.isArray(data.data)) {
        const savedSaturdays = data.data;
        const newDatabaseCheckedDates = {};

        savedSaturdays.forEach((saturday) => {
          // Parse the stringified date array into a real array of dates
          const saturdayDates = JSON.parse(saturday.date); // Convert the string to an actual array

          saturdayDates.forEach((dateStr) => {
            const date = new Date(dateStr);
            const dateStrFormatted = date.toDateString(); // Getting the string format for comparison
            const month = date.getMonth(); // Get month index (0 for Jan, 1 for Feb, etc.)
            const monthKey = `${selectedYear}-${month}`;

            if (!newDatabaseCheckedDates[monthKey]) {
              newDatabaseCheckedDates[monthKey] = {};
            }
            newDatabaseCheckedDates[monthKey][dateStrFormatted] = true; // Mark the date as checked
          });
        });

        this.setState({ databaseCheckedDates: newDatabaseCheckedDates });
      }
    } catch (error) {
      console.error("Failed to fetch saved Saturdays:", error);
    }
  };

  handleSubmit = async () => {
    const { checkedDates, databaseCheckedDates } = this.state;

    // Function to format the date to "Sat Nov 01 2025" format
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toDateString(); // Formats to "Sat Nov 01 2025"
    };

    // Function to clean and transform the dates into the desired structure
    const transformDates = (datesObj) => {
      return Object.keys(datesObj).reduce((acc, monthKey) => {
        const year = parseInt(monthKey.slice(0, 4)); // Extract year from the key
        const month = parseInt(monthKey.slice(5)) + 1; // Extract month from the key

        const datesArray = Object.keys(datesObj[monthKey]).reduce(
          (dateAcc, date) => {
            if (datesObj[monthKey][date] === true) {
              dateAcc.push(formatDate(date)); // Add date to array if it's true
            }
            return dateAcc;
          },
          []
        );

        if (datesArray.length > 0) {
          acc.push({
            year: year,
            month: month,
            dates: datesArray,
          });
        }
        return acc;
      }, []);
    };

    // Transform both checkedDates and databaseCheckedDates
    const cleanCheckedDates = transformDates(checkedDates);
    const cleanDatabaseCheckedDates = transformDates(databaseCheckedDates);

    // Merge cleaned checkedDates and databaseCheckedDates
    const saturdaysToSave = [
      ...cleanCheckedDates,
      ...cleanDatabaseCheckedDates,
    ];

    // Merge entries with the same year and month
    const mergedData = saturdaysToSave.reduce((acc, curr) => {
      // Find if the current year and month combination already exists
      const existing = acc.find(
        (item) => item.year === curr.year && item.month === curr.month
      );

      if (existing) {
        // If it exists, merge the dates (and remove duplicates)
        existing.dates = [...new Set([...existing.dates, ...curr.dates])];
      } else {
        // If it doesn't exist, add a new entry
        acc.push({ ...curr });
      }

      return acc;
    }, []);

    if (mergedData.length === 0) {
      // If no Saturdays are selected or fetched, display an alert and return
      this.setState({
        errorMessage: "Please select at least one Saturday.",
        showError: true,
        showSuccess: false,
      });
      return;
    }

    try {
      const result = await getService.addCall('alternate_saturdays.php','add',JSON.stringify({
            saturdays: mergedData,
          }) )

      if (result && result.status === "success") {
        this.setState({
          showSuccess: true,
          successMessage: "Saturdays added successfully.",
          errorMessage: "",
          showError: false,
        });
        this.fetchSavedSaturdays();
        // Optionally, clear the checked dates after saving
        this.setState({ checkedDates: {}, databaseCheckedDates: {} });

        setTimeout(this.dismissMessages, 5000);
      } else {
        this.setState({
          errorMessage: result.message || "Failed to add Saturdays.",
          showError: true,
          showSuccess: false,
        });
      }
    } catch (error) {
      this.setState({
        errorMessage: "Network error while saving Saturdays.",
        showError: true,
        showSuccess: false,
      });
    }
  };

  render() {
    const { fixNavbar } = this.props;
    const { selectedYear, toggle, showSuccess, successMessage, showError, errorMessage } =
      this.state;

    return (
      <>
        <AlertMessages
            showSuccess={showSuccess}
            successMessage={successMessage}
            showError={showError}
            errorMessage={errorMessage}
            setShowSuccess={(val) => this.setState({ showSuccess: val })}
            setShowError={(val) => this.setState({ showError: val })}
        />
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <YearSelector
                  selectedYear={selectedYear}
                  handleYearChange={this.handleYearChange}
                  labelClass='mr-2 mb-0'
                  selectClass='custom-select w-auto'
                />
              </div>

              <div className="d-flex align-items-center">
                <label className="custom-switch mb-0">
                  <span className="custom-switch-description mr-2">
                    Select Alternate Saturdays
                  </span>
                  <input
                    className="custom-switch-input"
                    type="checkbox"
                    checked={toggle}
                    onChange={this.handleToggleChange}
                  />{" "}
                  <span className="custom-switch-indicator"></span>
                </label>
              </div>

              {/* Monthly Saturday selection UI */}
              <div className="row mt-2">
                {Array.from({ length: 12 }, (_, monthIndex) => {
                  const monthName = new Date(
                    selectedYear,
                    monthIndex
                  ).toLocaleString("default", {
                    month: "long",
                  });
                  const saturdays = this.getSaturdaysInMonth(
                    selectedYear,
                    monthIndex
                  );

                  return (
                    <div className="col-lg-3 col-md-6 mb-4" key={monthIndex}>
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{monthName}</h5>
                          <ul className="list-unstyled">
                            {saturdays.map((date) => {
                              const dateStr = date.toDateString().split("T")[0];
                              const isPast = date < this.currentDate;
                              return (
                                <li key={dateStr}>
                                  <label className="custom-control custom-checkbox">
                                    <input
                                      className="custom-control-input"
                                      type="checkbox"
                                      disabled={isPast}
                                      checked={this.isChecked(
                                        monthIndex,
                                        dateStr
                                      )}
                                      onChange={() =>
                                        this.handleCheckboxChange(
                                          monthIndex,
                                          dateStr
                                        )
                                      }
                                    />
                                    <span className="custom-control-label">
                                      {date.getDate()} {monthName}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={this.handleSubmit}
                  type="button"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps)(SaturdaySettings);
