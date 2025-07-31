import React from "react";
import ListSkeleton from "../../common/skeletons/ListSkeleton";

const EventList = ({ loading, uniqueFilteredEvents2, logged_in_employee_role, formatDate, openDeleteModal }) => {
  return (
    <div>
      {loading ? (
        <div className="dimmer active mb-4 p-3 px-3">
          <ListSkeleton rows={5} />
        </div>
      ) : (
        <div
          id="event-list"
          className="fc event_list"
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
          {uniqueFilteredEvents2.length > 0 ? (
            uniqueFilteredEvents2.map((event) => {
              let key = "";
              if (event.event_type === "event") {
                key = event.event_name + "_" + event.event_date;
              } else if (event.event_type === "birthday") {
                key = "birthday_" + event.id;
              } else if (event.event_type === "holiday") {
                key = "holiday_" + event.id;
              } else {
                key = event.id || event.event_name || Math.random();
              }

              return formatDate(event.event_date) >= formatDate(new Date()) ? (
                <div key={key} className="event-card card mb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      className={`fc-event ${
                        event.event_type === "holiday"
                          ? "holiday-event"
                          : event.event_type === "event"
                          ? "regular-event"
                          : event.event_type === "birthday"
                          ? "birthday-event"
                          : "other-event"
                      }`}
                      data-class={
                        event.event_type === "holiday"
                          ? "bg-danger"
                          : event.event_type === "event"
                          ? "bg-info"
                          : event.event_type === "birthday"
                          ? "bg-success"
                          : "bg-primary"
                      }
                      style={{ flex: 1 }}
                    >
                      {/* Show trash icon only for 'event' type and for admin/super_admin */}
                      {event.event_type === "event" &&
                        (logged_in_employee_role === "admin" ||
                          logged_in_employee_role === "super_admin") && (
                          <button
                            className="btn btn-link text-danger position-absolute"
                            title="Delete Event"
                            onClick={() => openDeleteModal(event.id)}
                            style={{
                              top: "2px",
                              right: "2px",
                              padding: "2px 6px",
                              fontSize: "0.75rem",
                              lineHeight: 1,
                            }}
                          >
                            <i
                              className="fa fa-trash"
                              aria-hidden="true"
                              style={{ color: "red" }}
                            ></i>
                          </button>
                        )}

                      <strong className="d-block">{event.event_name}</strong>
                      <small>
                        {event.event_date
                          ? new Date(event.event_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "No Date"}
                      </small>
                    </div>
                  </div>
                </div>
              ) : null;
            })
          ) : (
            <div className="fc-event bg-info" data-class="bg-info">
              No events found for this year.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;
