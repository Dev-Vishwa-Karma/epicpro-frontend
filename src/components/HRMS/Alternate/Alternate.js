import React, { Component } from "react";
import { connect } from "react-redux";

class Alternate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: new Date().getFullYear(),
      months: [],
      selectedSaturdays: {},
      isAlternateSelected: false,
      successMessage: "",
      showSuccess: false,
      errorMessage: "",
      showError: false,
    };
  }

    // Function to dismiss messages
    dismissMessages = () => {
    this.setState({
        showSuccess: false,
        successMessage: "",
        showError: false,
        errorMessage: "",
    });
};

  componentDidMount() {
    this.generateMonthsAndSaturdays();
  }

  getSaturdaysOfMonth(year, month) {
    const saturdays = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    for (
      let date = new Date(firstDayOfMonth);
      date <= lastDayOfMonth;
      date.setDate(date.getDate() + 1)
    ) {
      if (date.getDay() === 6) {
        saturdays.push(new Date(date));
      }
    }
    return saturdays;
  }

  generateMonthsAndSaturdays() {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const saturdays = this.getSaturdaysOfMonth(this.state.selectedYear, month);
      months.push({ month, saturdays });
    }
    this.setState({ months });
  }

  handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value);
    this.setState({ selectedYear }, this.generateMonthsAndSaturdays);
  };

  handleSaturdayChange = (month, saturdayDate, checked) => {
    this.setState((prevState) => {
      const selectedSaturdays = { ...prevState.selectedSaturdays };
      const key = `${month}-${saturdayDate.toISOString()}`;
      if (checked) {
        selectedSaturdays[key] = saturdayDate;
      } else {
        delete selectedSaturdays[key];
      }
      return { selectedSaturdays };
    });
  };

  handleToggleAlternateSaturdays = (e) => {
    const isAlternateSelected = e.target.checked;
    this.setState((prevState) => {
      const selectedSaturdays = {};

      prevState.months.forEach(({ month, saturdays }) => {
        saturdays.forEach((saturday, index) => {
          if (isAlternateSelected && index % 2 === 0) {
            selectedSaturdays[`${month}-${saturday.toISOString()}`] = saturday;
          }
        });
      });

      return {
        isAlternateSelected,
        selectedSaturdays,
      };
    });
  };

  handleSubmit = async () => {
    const { selectedSaturdays, selectedYear } = this.state;
    console.log("Selected Saturdays:", selectedSaturdays);
  
    // Function to format the date to yyyy-mm-dd
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns 0-11
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;  // Change format to yyyy-mm-dd
    };
  
    // Prepare the Saturdays in yyyy-mm-dd format
    const formattedSaturdays = Object.values(selectedSaturdays)
      .map(date => formatDate(date));
  
    // Prepare FormData
    const formData = new FormData();
    formData.append('year', selectedYear);
    formattedSaturdays.forEach((saturday, index) => {
      formData.append(`saturdays[${index}]`, saturday);
    });
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/save_saturdays.php`, {
        method: 'POST',
        body: formData, // Send FormData instead of JSON
      });
  
        var result = await response.json();
        console.log("Saved successfully:", result);
        if (result && result.status === "success") {
            this.setState(() => {
                return {
                    showSuccess: true,
                    successMessage: "Saturdays added successfully.",
                    errorMessage: "",
                    showError: false,
                };
            });

            setTimeout(this.dismissMessages, 5000);
        } else {
         
            this.setState({
                errorMessage: result.message || "Failed to added Saturdays.",
                showError: true,
                showSuccess: false,
            });
        }
    } catch (error) {
        this.setState({
            errorMessage: result.message || "Network error while saving Saturdays",
            showError: true,
            showSuccess: false,
        });
    }
  };
  

      // Render function for Bootstrap toast messages
      renderAlertMessages = () => {
        return (
            
            <>
                {/* Add the alert for success messages */}
                <div 
                    className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-circle-check me-2"></i>
                    {this.state.successMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showSuccess: false })}
                    >
                    </button>
                </div>

                {/* Add the alert for error messages */}
                <div 
                    className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {this.state.errorMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showError: false })}
                    >
                    </button>
                </div>
            </>
        );
    };

  render() {
    const { fixNavbar } = this.props;
    const {
      selectedYear,
      months,
      selectedSaturdays,
      isAlternateSelected,
    } = this.state;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1;
    const endYear = currentYear + 10;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    return (
        <>
        {/* Show success and error Messages */}
        {this.renderAlertMessages()}
      <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
        <div className="container-fluid">
          {/* Top controls: Year selector and toggle */}
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <label htmlFor="year-selector" className="mr-2 mb-0">
                Year:
              </label>
              <select
                id="year-selector"
                className="custom-select w-auto"
                value={selectedYear}
                onChange={this.handleYearChange}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex align-items-center">
              <label className="custom-switch mb-0">
                <span className="custom-switch-description mr-2">
                  Select Alternate Saturdays
                </span>
                <input
                  type="checkbox"
                  className="custom-switch-input"
                  checked={isAlternateSelected}
                  onChange={this.handleToggleAlternateSaturdays}
                />
                <span className="custom-switch-indicator"></span>
              </label>
            </div>
          </div>

          {/* Monthly Saturday selection UI */}
          <div className="row">
            {months.map(({ month, saturdays }) => (
              <div className="col-lg-3 col-md-6 mb-4" key={month}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {new Date(0, month).toLocaleString("default", {
                        month: "long",
                      })}
                    </h5>
                    <ul className="list-unstyled">
                      {saturdays.map((saturday) => (
                        <li key={saturday.toISOString()}>
                          <label className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              checked={
                                !!selectedSaturdays[
                                  `${month}-${saturday.toISOString()}`
                                ]
                              }
                              onChange={(e) =>
                                this.handleSaturdayChange(
                                  month,
                                  saturday,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="custom-control-label">
                              {saturday.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
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

      </>
    );
  }
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps)(Alternate);
