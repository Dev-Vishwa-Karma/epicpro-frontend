import React, { Component } from "react";
import { connect } from "react-redux";
import AlertMessages from "../../common/AlertMessages";
import { getService } from "../../../services/getService";
import YearSelector from "../../common/YearSelector";
import MonthSelector from "../../common/MonthSelector";

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
      holidaysData: [],
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

  getEmployees = () => {
    const { selectedYear, selectedMonth } = this.state;
    getService.getCall('get_employees.php', {
      action: 'view',
      role: 'employee',
      year: selectedYear,
      status: 1,
      month: selectedMonth,
      statistics_visibility_status: 'statistics_visibility_status'
    })
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

    getService.getCall('reports.php', {
      action: 'view',
      from_date: fromDate,
      to_date: toDate
    })
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
    getService.getCall('employee_leaves.php', {
      action: 'view',
      status: 'approved'
    })
      .then(data => {
        if (data.status === 'success') {
          this.setState({ leavesData: data.data, isLoading: false });
        } else {
          this.setState({ error: data.message, isLoading: false });
        }
      })
      .catch(err => {
        this.setState({ error: 'Failed to fetch leaves data', isLoading: false });
        console.error(err);
      });
  }

  getAlternateSaturdays = async () => {
    const { selectedYear, selectedMonth } = this.state;

    try {
      const data = await getService.getCall('alternate_saturdays.php', {
        action: 'view',
        year: selectedYear,
        month: selectedMonth
      })

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
    getService.getCall('events.php', {
      action: 'view',
      event_type: 'holiday'
    })
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
    this.setState({ selectedYear: year }, this.getAlternateSaturdays, this.getEmployees());
  };

  handleMonthChange = (e) => {
    const month = parseInt(e.target.value);

    this.setState({ selectedMonth: month }, () => {
      this.getAlternateSaturdays();
      this.getReports();
      this.getEmployees();
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

  initalizeEmployeeData = (employeesData) => {
    const counts = {};
    employeesData.forEach(employee => {
      counts[employee.id] = 0;
    });

    return counts;
  };

  calculateWorking = (hours) => {
    if (hours >= 4 && hours < 8) {
      return 0.5;
    } else if (hours >= 8) {
      return 1;
    }

    return 0;
  }

  render() {
    const { fixNavbar } = this.props;
    const { selectedYear, selectedMonth, employeesData, leavesData, alternateSaturdayData, holidaysData, isLoading, showSuccess, successMessage, showError, errorMessage } = this.state;
    const monthDays = this.getAllDatesOfMonth(selectedYear, selectedMonth);
    const attendanceByDate = this.prepareAttendanceFromReports();
    const leaveCounts = this.initalizeEmployeeData(employeesData);
    // const halfLeaveCounts = this.initalizeEmployeeData(employeesData);
    const extraWorkingCounts = this.initalizeEmployeeData(employeesData);

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

            {/* Filters */}
            <div className="d-flex flex-wrap align-items-center mb-3">
              <div className="d-flex align-items-center mr-3 mb-2">
                <YearSelector
                  selectedYear={selectedYear}
                  handleYearChange={this.handleYearChange}
                  labelClass='mr-2 mb-0'
                  selectClass='custom-select w-auto'
                />
              </div>

              <div className="d-flex align-items-center mb-2">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  handleMonthChange={this.handleMonthChange}
                  labelClass="mr-2 mb-0"
                  selectClass="custom-select w-auto"
                />
              </div>

              <div className="ml-auto">
                <span className="leave">Leave</span>
                <span className="halfDay">Half day</span>
                <span className="extraWorking">Extra working</span>
                <span className="holiday">Holiday</span>
                <span className="alternateHoliday">Weekend</span>
              </div>
            </div>

            {isLoading ? (
              <div className="dimmer active p-5">
                <div className="loader" />
              </div>
            ) : (
              <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#a2c4c9 #ffffff',scrollBehavior: 'smooth' }}>
                <table className="table table-bordered table-sm text-center" style={{ minWidth: '600px' }}>
                  <thead style={{ backgroundColor: "#a2c4c9" }}>
                    <tr>
                      <th style={{ padding: "14px" }}>Date</th>
                      {employeesData.map((employee) => (
                        <th style={{ padding: "14px" }} key={employee.id}>{employee.first_name}</th>
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
                        <tr key={rowIndex} style={highlightRow ? { backgroundColor: isHoliday ? '#FAAA69' : '#fff2cc' } : {}}>
                          <td style={{ backgroundColor: "#b7e1cd" }}>{day.display}</td>
                          {employeesData.map((employee, colIndex) => {
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

                              if (workedOnSpecialDay) {
                                cellStyle = { backgroundColor: "#28a745", color: "#000" }; // Green for working on a special day
                                extraWorkingCounts[employee.id] = extraWorkingCounts[employee.id] + hoursNumber >= 8 ? 1 : 0.5;
                              }
                            }
                            const calculateDay = this.calculateWorking(hoursNumber);
                            const today = new Date();
                            const currentDate = new Date(day.key);
                            today.setHours(0, 0, 0, 0);
                            currentDate.setHours(0, 0, 0, 0);

                            if (isOnLeave) {
                              if (currentDate >= today && isMissingReport) {
                                if (isHalfDayLeave) {
                                  cellStyle = { backgroundColor: "#00ffff", color: "#000" }; // Cyan for half-day
                                  leaveCounts[employee.id] = leaveCounts[employee.id] + 0.5;
                                } else {
                                  cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                                  leaveCounts[employee.id] = leaveCounts[employee.id] + 1;
                                }
                              } else if (isMissingReport) {
                                cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                                leaveCounts[employee.id] = leaveCounts[employee.id] + 1;
                              } else {
                                if (calculateDay == '0.5') {
                                  cellStyle = { backgroundColor: "#00ffff", color: "#000" }; // Cyan for half-day
                                  leaveCounts[employee.id] = leaveCounts[employee.id] + calculateDay;
                                } else if (calculateDay == '0') {
                                  cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                                  leaveCounts[employee.id] = leaveCounts[employee.id] + 1;                                  
                                }
                              }
                            } else if (isMissingReport && !highlightRow && currentDate < today) {
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                              leaveCounts[employee.id] = leaveCounts[employee.id] + 1;
                            } else if (!isMissingReport) {
                              if (calculateDay == '0.5' && !workedOnSpecialDay) {
                                cellStyle = { backgroundColor: "#00ffff", color: "#000" }; // Cyan for half-day
                                leaveCounts[employee.id] = leaveCounts[employee.id] + calculateDay;
                              } else if (calculateDay == '0' && !workedOnSpecialDay) {
                                cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                                leaveCounts[employee.id] = leaveCounts[employee.id] + 1;
                              }
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
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp.id] || 0;
                        // const halfLeaves = halfLeaveCounts[emp.id] || 0;
                        const total = Math.round((fullLeaves) * 10) / 10; // Round to 1 decimal
                        return <td key={emp.id}>{total}</td>;
                      })}
                    </tr>

                    {/* Summary Row 2: Extra Working Days */}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td style={{ backgroundColor: '#b7e1cd' }}>Extra Working Days(+)</td>
                      {employeesData.map((emp) => (
                        <td key={emp.id}>{extraWorkingCounts[emp.id] || 0}</td>
                      ))}
                    </tr>

                    {/* Summary Row 3: Paid Leaves */}
                    <tr style={{ fontWeight: 'bold' }}>
                      <td style={{ backgroundColor: '#b7e1cd' }}>Paid Leave(+)</td>
                      {employeesData.map((emp) => (
                        <td key={emp.id}>1</td>
                      ))}
                    </tr>

                    {/* Summary Row 4: Deduction/Paid */}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#a4c2f4' }}>
                      <td>Deduction/Paid</td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp.id] || 0;
                        // const halfLeaves = halfLeaveCounts[emp.id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                        const totalDeduction = (extraWorkCounts + 1) - (fullLeaves); // Subtract 1 paid leave
                        return (
                          <td key={emp.id}>{totalDeduction}</td>
                        );
                      })}
                    </tr>

                    {/* Summary Row 5: No Of Days Salary To Be Credited */}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f4cccc' }}>
                      <td>No Of Days Salary To Be Credited</td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp.id] || 0;
                        // const halfLeaves = halfLeaveCounts[emp.id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                        const deduction = (extraWorkCounts + 1) - (fullLeaves);
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