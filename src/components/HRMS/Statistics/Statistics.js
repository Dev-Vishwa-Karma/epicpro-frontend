import React, { Component } from "react";
import { connect } from "react-redux";

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      attendanceData: [],
      showSuccess: false,
      showError: false,
      successMessage: "",
      errorMessage: "",
      employeesData: [],
      reportsData: [],
      leavesData: [],
      alternateSaturdayData: [],
      holidaysData:[],
      isLoading: true
    };
  }

  componentDidMount() {
    this.getEmployees();
    this.getReports();
    this.getleaves();
    this.getAlternateSaturdays();
    this.getHolidays();
  }

  getMonths = () => {
    return Array.from({ length: 12 }, (_, index) => {
      return new Date(2000, index, 1).toLocaleString('default', { month: 'long' });
    });
  };

  getEmployees = () => {
    fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&role=employee`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.setState({ employeesData: data.data, isLoading: false });
        } else {
          this.setState({ error: data.message, isLoading: false });
        }
      })
      .catch(err => {
        this.setState({ error: 'Failed to fetch employees data', isLoading: false });
        console.error(err);
      });
  }

  getReports = () => {
    const { selectedYear, selectedMonth } = this.state;
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const fromDate = firstDay.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    const toDate = lastDay.toISOString().split('T')[0]; 

    fetch(`${process.env.REACT_APP_API_URL}/reports.php?action=view&from_date=${fromDate}&to_date=${toDate}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.setState({ reportsData: data.data, isLoading: false });
        } else {
          this.setState({ error: data.message, isLoading: false });
        }
      })
      .catch(err => {
        this.setState({ error: 'Failed to fetch reports data', isLoading: false });
        console.error(err);
      });
  }

  getleaves = () => {
    fetch(`${process.env.REACT_APP_API_URL}/employee_leaves.php?action=view&status=approved`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.setState({ leavesData: data.data, isLoading: false });
        } else {
          this.setState({ error: data.message, isLoading: false });
        }
      })
      .catch(err => {
        this.setState({ error: 'Failed to fetch leaves data',isLoading: false });
        console.error(err);
      });
  }

  getAlternateSaturdays = async () => {
    const { selectedYear, selectedMonth } = this.state;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/alternate_saturdays.php?action=view&year=${selectedYear}&month=${selectedMonth}`
      );
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
        // The date is a stringified JSON array, so parse it
        const alternateDatesRaw = data.data[0].date; // e.g. '["Sat June 7 2025", "Sat June 21 2025"]'
        const parsedDates = JSON.parse(alternateDatesRaw);

        // Convert those strings to date keys like 'YYYY-MM-DD' for easy comparison
        const alternateSaturdayData = parsedDates.map(dateStr => {
          const d = new Date(dateStr);
          const yyyy = d.getFullYear();
          const mm = (d.getMonth() + 1).toString().padStart(2, "0");
          const dd = d.getDate().toString().padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        });

        this.setState({ alternateSaturdayData });
      } else {
        this.setState({ alternateSaturdayData: [] });
      }
    } catch (error) {
      console.error("Failed to fetch saved Saturdays:", error);
      this.setState({ alternateSaturdayData: [] });
    }
  };

  getHolidays = () => {
    this.setState({ isLoading: true })
    fetch(`${process.env.REACT_APP_API_URL}/events.php?action=view&event_type=holiday`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const holidayDates = data.data.map(item => item.event_date); // Using 'event_date' field directly
          this.setState({ holidaysData: holidayDates, isLoading: false });
        } else {
          this.setState({ error: data.message, isLoading: false });
        }
      })
      .catch(err => {
        this.setState({ error: 'Failed to fetch holidays data', isLoading: false });
        console.error(err);
      });
  };
  
  handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    this.setState({ selectedYear: year }, this.getAlternateSaturdays);
  };

  handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    
    this.setState({ selectedMonth: month }, () => {
      this.getAlternateSaturdays();  
      this.getReports();
    });
  };

  getAllDatesOfMonth = (year, month) => {
    const date = new Date(year, month - 1, 1);
    const days = [];

    while (date.getMonth() === month - 1) {
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("en-US", { month: "long" });
      const yearValue = date.getFullYear();

      days.push({
        display: `${weekday}, ${day} ${monthName}`,
        key: `${yearValue}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
      });

      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  prepareAttendanceFromReports = () => {
    const { reportsData } = this.state;
    const attendanceByDate = {};

    reportsData.forEach(report => {
      const date = report.created_at.split(' ')[0];
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {};
      }
      attendanceByDate[date][report.employee_id] = report.todays_working_hours || "";
    });

    return attendanceByDate;
  }

  countLeavesPerEmployee = (leavesData, selectedYear, selectedMonth) => {
    const counts = {};
  
    leavesData.forEach((leave) => {
      const { employee_id, from_date, to_date, is_half_day } = leave;
      const from = new Date(from_date);
      const to = new Date(to_date);
      const year = selectedYear;
      const month = selectedMonth;
  
      let current = new Date(from);
      while (current <= to) {
        if (current.getFullYear() === year && current.getMonth() + 1 === month) {
          const dateKey = current.toISOString().split('T')[0]; // "YYYY-MM-DD"
          if (is_half_day === "1" || is_half_day === 1) {
            counts[employee_id] = (counts[employee_id] || 0) + 0.5;
          } else {
            counts[employee_id] = (counts[employee_id] || 0) + 1;
          }
        }
        current.setDate(current.getDate() + 1);
      }
    });
  
    return counts;
  };
  

  calculateHalfLeaves = (attendanceByDate, employeesData, monthDays) => {
    const { holidaysData, alternateSaturdayData } = this.state;

    const halfLeaveCounts = {};

    monthDays.forEach(day => {
      const attendance = attendanceByDate[day.key] || {};


      employeesData.forEach(employee => {
        const rawHours = attendance[employee.id];
        const isAlternateSaturday = alternateSaturdayData.includes(day.key);

        const dateObj = new Date(day.key);
        const isSunday = dateObj.getDay() === 0;
        const isHoliday = holidaysData.includes(day.key);
  
        const workedOnSpecialDay = rawHours !== "" && (
          isSunday || isAlternateSaturday || isHoliday
        );

        if (rawHours && rawHours !== "" && rawHours.includes(":")) {
          const [hours, minutes] = rawHours.split(":").map(Number);
          const totalHours = hours + minutes / 60;

          if (!workedOnSpecialDay && totalHours > 4 && totalHours < 8) {
            halfLeaveCounts[employee.id] = (halfLeaveCounts[employee.id] || 0) + 0.5;
          }
        }
      });
    });

    return halfLeaveCounts;
  };

  calculateExtraWorkingDays = (attendanceByDate, employeesData, monthDays, alternateSaturdayData) => {
    const extraWorkCounts = {};
  
    monthDays.forEach(day => {
      const dateObj = new Date(day.key);
      const isSunday = dateObj.getDay() === 0;
      const isAlternateSaturday = alternateSaturdayData.includes(day.key);
  
      if (!isSunday && !isAlternateSaturday) return;
      const attendance = attendanceByDate[day.key] || {};
      employeesData.forEach(employee => {
        
        const rawHours = attendance[employee.id];
      
        if (rawHours && rawHours !== "" && rawHours.includes(":")) {
          const [hours, minutes] = rawHours.split(":").map(Number);
          const totalHours = hours + minutes / 60;
  
          if (totalHours >= 8) {
            extraWorkCounts[employee.id] = (extraWorkCounts[employee.id] || 0) + 1;
          } else if (totalHours > 0) {
            extraWorkCounts[employee.id] = (extraWorkCounts[employee.id] || 0) + 0.5;
          }
        }
      });
    });
    return extraWorkCounts;
  };
  

  
  renderAlertMessages = () => (
    <>
      <div className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`}
        role="alert"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "250px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <i className="fa-solid fa-circle-check me-2"></i>
        {this.state.successMessage}
        <button type="button" className="close" onClick={() => this.setState({ showSuccess: false })}></button>
      </div>

      <div className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`}
        role="alert"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "250px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <i className="fa-solid fa-triangle-exclamation me-2"></i>
        {this.state.errorMessage}
        <button type="button" className="close" onClick={() => this.setState({ showError: false })}></button>
      </div>
    </>
  );

  render() {
    const { fixNavbar } = this.props;
    const { selectedYear, selectedMonth, employeesData, leavesData, alternateSaturdayData, holidaysData, isLoading} = this.state;
    const monthDays = this.getAllDatesOfMonth(selectedYear, selectedMonth);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    const attendanceByDate = this.prepareAttendanceFromReports();
    const leaveCounts = this.countLeavesPerEmployee(leavesData, selectedYear, selectedMonth);
    const halfLeaveCounts = this.calculateHalfLeaves(attendanceByDate, employeesData, monthDays);
    const extraWorkingCounts = this.calculateExtraWorkingDays(attendanceByDate, employeesData, monthDays, alternateSaturdayData);
  
    // Sort employees alphabetically by first name
    const sortedEmployees = employeesData.sort((a, b) => a.first_name.localeCompare(b.first_name));
  
    return (
      <>
        {this.renderAlertMessages()}
  
        <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
          <div className="container-fluid">
  
            {/* Filters */}
            <div className="d-flex flex-wrap align-items-center mb-3">
              <div className="d-flex align-items-center mr-3 mb-2">
                <label htmlFor="year-selector" className="mr-2 mb-0">Year:</label>
                <select id="year-selector" className="custom-select" value={selectedYear} onChange={this.handleYearChange}>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
  
              <div className="d-flex align-items-center mb-2">
                <label htmlFor="month-selector" className="mr-2 mb-0">Month:</label>
                <select id="month-selector" className="custom-select" value={selectedMonth} onChange={this.handleMonthChange}>
                  {this.getMonths().map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <span style={{ backgroundColor: "#ff0000", color: "#fff", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Leave</span>
                <span style={{ backgroundColor: "#00ffff", color: "#000", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Half day</span>
                <span style={{ backgroundColor: "#28a745", color: "#000", padding: "4px 8px", borderRadius: "4px" }}>Extra working</span>
              </div>
            </div>  

            {isLoading ? (
            <div className="dimmer active p-5">
              <div className="loader" />
            </div>
							) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-bordered table-sm text-center" style={{ minWidth: '600px' }}>
                <thead style={{backgroundColor: "#a2c4c9"}}>
                  <tr>
                    <th style={{padding: "14px"}}>Date</th>
                    {sortedEmployees.map((employee) => (
                      <th style={{padding: "14px"}} key={employee.id}>{employee.first_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthDays.map((day, rowIndex) => {
  
                    const dayAttendance = attendanceByDate[day.key] || {};
                    const isAlternateSaturday = alternateSaturdayData.includes(day.key);
  
                    const dateObj = new Date(day.key);
                    const isSunday = dateObj.getDay() === 0;
                    const isHoliday = holidaysData.includes(day.key);
  
                    // Highlight entire row if Sunday or alternate Saturday
                    const highlightRow = isAlternateSaturday || isSunday || isHoliday;
  
                    return (
                      <tr key={rowIndex} style={highlightRow ? { backgroundColor: '#fff2cc' } : {}}>
                        <td style={{backgroundColor: "#b7e1cd"}}>{day.display}</td>
                        {sortedEmployees.map((employee, colIndex) => {
                          const value = dayAttendance[employee.id] || "";
                          const isMissingReport = value === "";
                          
                          let hoursNumber = 0;
                          let cellStyle = {};
  
                          const matchingLeave = leavesData.find((leave) =>
                            leave.employee_id === employee.id.toString() &&
                            day.key >= leave.from_date &&
                            day.key <= leave.to_date
                          );
                          const isOnLeave = !!matchingLeave;
                          const isHalfDayLeave = matchingLeave?.is_half_day === "1" || matchingLeave?.is_half_day === 1;
                          
  
                          const workedOnSpecialDay = !isMissingReport && (
                              isSunday || isAlternateSaturday || isHoliday
                          );
  
                          if (!isMissingReport && value.includes(":")) {
                            const parts = value.split(":").map(Number);
                           
                            hoursNumber = parts[0] + parts[1] / 60;
  
                            if (hoursNumber > 0 && hoursNumber < 4) {
                              if (!workedOnSpecialDay) {
                                leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) + 1;
                              }
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                            } else if (hoursNumber >= 4 && hoursNumber < 8) {
                              cellStyle = { backgroundColor: "#00ffff", color: "#000" };
                            }
                          }

                          const today = new Date();
                          const currentDate = new Date(day.key);
                          today.setHours(0, 0, 0, 0);
                          currentDate.setHours(0, 0, 0, 0);
                          if (workedOnSpecialDay) {
                            cellStyle = { backgroundColor: "#28a745", color: "#000" }; // Green for working on a special day
                          } else if (isOnLeave) {
                            if(!isMissingReport){
                              leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) - (isHalfDayLeave ? 0.5 : 1);
                            }else{
                              cellStyle = isHalfDayLeave
                              ? { backgroundColor: "#00ffff", color: "#000" } // Cyan for half-day
                              : { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                            }
                          } else if (isMissingReport && !highlightRow && currentDate < today) {
                            // Missing report and it is not alternae sat,sun or hoilday
                            cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Override red 
                            leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) + 1;
                          }
                          
                          let splitValue = dayAttendance[employee.id] || "";
                          if (splitValue && splitValue.split(":").length === 3) {
                            splitValue = splitValue.split(":").slice(0, 2).join(":");
                            
                            // Remove the leading 0 from the hour part (if it exists)
                            let parts = splitValue.split(":");
                            if (parts[0].startsWith('0')) {
                              parts[0] = parts[0].slice(1); 
                            }
                            splitValue = parts.join(":");
                          }
                         
                          return (
                            <td key={colIndex} style={cellStyle} >
                              {splitValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
  
                  {/* Summary Row 1: Leave Taken */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#999999' }}>Leave Taken(-)</td>
                    {sortedEmployees.map((emp) => {
                      const fullLeaves = leaveCounts[emp.id] || 0;
                      const halfLeaves = halfLeaveCounts[emp.id] || 0;
                      const total = Math.round((fullLeaves + halfLeaves) * 10) / 10; // Round to 1 decimal
                      return <td key={emp.id}>{total}</td>;
                    })}
                  </tr>
  
                  {/* Summary Row 2: Extra Working Days */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#b7e1cd' }}>Extra Working Days(+)</td>
                    {sortedEmployees.map((emp) => (
                      <td key={emp.id}>{extraWorkingCounts[emp.id] || 0}</td>
                    ))}
                  </tr>
  
                  {/* Summary Row 3: Paid Leaves */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#b7e1cd' }}>Paid Leave(+)</td>
                    {sortedEmployees.map((emp) => (
                      <td key={emp.id}>1</td>
                    ))}
                  </tr>
  
                  {/* Summary Row 4: Deduction/Paid */}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#a4c2f4' }}>
                    <td>Deduction/Paid</td>
                    {sortedEmployees.map((emp) => {
                      const fullLeaves = leaveCounts[emp.id] || 0;
                      const halfLeaves = halfLeaveCounts[emp.id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                      const totalDeduction =  (extraWorkCounts + 1) - (fullLeaves + halfLeaves); // Subtract 1 paid leave
                      return (
                        <td key={emp.id}>{totalDeduction}</td>
                      );
                    })}
                  </tr>
  
                  {/* Summary Row 5: No Of Days Salary To Be Credited */}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f4cccc' }}>
                    <td>No Of Days Salary To Be Credited</td>
                    {sortedEmployees.map((emp) => {
                      const fullLeaves = leaveCounts[emp.id] || 0;
                      const halfLeaves = halfLeaveCounts[emp.id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                      const deduction =  (extraWorkCounts + 1) - (fullLeaves + halfLeaves);
                      const salaryDays = deduction + 30;
                      return (
                        <td key={emp.id}>{salaryDays}</td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
              </div>
            )}
            
  
          </div>
        </div>
      </>
    );
  }
  
}

const mapStateToProps = (state) => ({
  fixNavbar: state.settings.isFixNavbar,
});

export default connect(mapStateToProps)(Statistics);


