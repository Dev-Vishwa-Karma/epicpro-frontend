import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import NotificationSkeleton from "../../../common/skeletons/NotificationSkeleton";
import { getService } from "../../../../services/getService";

class NotificationDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingMore: false,
      hasMore: true,
    };
  }

  handleLoadMore = () => {
    this.setState({ loadingMore: true });
    setTimeout(() => {
      this.props.fetchNotifications();
      this.setState({ loadingMore: false });
    }, 1000);
  };

  handleBulkNotificationClick = async (notification) => {
    this.props.markAsRead(notification.id, notification?.connect_id);

    let requesterId = notification?.created_by;
    let requesterPublicKey = null;
    let requesterName = "";
    try {
      const empRes = await getService.getCall("get_employees.php", {
        action: "view",
        user_id: requesterId,
      });

      const empData = empRes?.data ?? empRes;
      if (empData) {
        requesterPublicKey = empData.public_key;
        requesterName = empData?.first_name + ' ' + empData?.last_name;
      }
    } catch (_) { }

    if (this.props.onBulkApprovalRequest) {
      this.props.onBulkApprovalRequest(requesterId, requesterPublicKey, requesterName);
    } else {
      window.dispatchEvent(
        new CustomEvent("openBulkApprovalModal", {
          detail: { requesterId, requesterPublicKey, requesterName },
        })
      );
    }
  };

  render() {
    const { notifications, markAsRead, navigateToNotifications } = this.props;
    const { loadingMore, hasMore } = this.state;

    return (
      <>
        <div className="dropdown d-flex">
          {/* Notification Icon */}
          <a
            href="/#"
            className="nav-link icon d-flex btn btn-default btn-icon ml-1"
            data-toggle="dropdown"
          >
            <i className="fa fa-bell" />
            {notifications.filter((n) => Number(n.read) === 0).length > 0 && (
              <span className="badge badge-primary nav-unread" />
            )}
          </a>

          {/* Dropdown Content */}
          <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
            <div
              id="notificationScrollArea"
              style={{
                height: notifications.length > 4 ? "310px" : "auto",
                overflow: "auto",
              }}
            >
              <InfiniteScroll
                dataLength={notifications.length}
                next={this.handleLoadMore}
                hasMore={hasMore && notifications.length > 2}
                loader={loadingMore ? <NotificationSkeleton rows={5} /> : null}
                scrollableTarget="notificationScrollArea"
              >
                <ul className="list-unstyled feeds_widget">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => {
                      const createdAt = new Date(notification.created_at);
                      const formattedDate = createdAt.toLocaleDateString();
                      const nType = notification?.type || "";
                      const isBulkRequest = nType === "discussion_bulk_request"
                      const isBulkRecovered = nType === "discussion_bulk_recovered"

                      return (
                        <li
                          key={index}
                          style={{
                            backgroundColor:
                              Number(notification.read) === 0
                                ? "#E8E9E9"
                                : "transparent",
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd",
                          }}
                          onClick={() => {
                            if (isBulkRequest) {
                              this.handleBulkNotificationClick(notification);
                            } else {
                              markAsRead(
                                notification.id,
                                notification?.connect_id
                              );
                            }
                          }}
                        >
                          <div className="feeds-body">
                            <h4
                              className={`title ${isBulkRequest || isBulkRecovered ? "" : "text-danger"
                                } ${Number(notification.read) === 0
                                  ? "font-weight-bold"
                                  : ""
                                }`}
                              style={
                                isBulkRequest
                                  ? { color: "#7c3aed" }
                                  : isBulkRecovered
                                    ? { color: "#16a34a" }
                                    : {}
                              }
                            >
                              {notification.title}
                              <small className="float-right text-muted">
                                {formattedDate}
                              </small>
                            </h4>
                            <small
                              className="notification-body"
                              dangerouslySetInnerHTML={{
                                __html: notification.body,
                              }}
                            />
                            {isBulkRequest && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#7c3aed",
                                  fontWeight: "600",
                                  marginTop: "4px",
                                }}
                              >
                                <i className="fa fa-mouse-pointer mr-1" />
                                Click to review &amp; approve
                              </div>
                            )}
                            {isBulkRecovered && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#16a34a",
                                  fontWeight: "600",
                                  marginTop: "4px",
                                }}
                              >
                                <i className="fa fa-unlock mr-1" />
                                Your discussions are accessible again
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li>
                      <div className="feeds-body">
                        <h4 className="title text-danger">
                          Notification not found
                        </h4>
                      </div>
                    </li>
                  )}
                </ul>
              </InfiniteScroll>
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <>
                <div className="dropdown-divider" />
                <a
                  href="#"
                  className="dropdown-item text-center text-muted-dark readall"
                  onClick={() => {
                    markAsRead();
                    navigateToNotifications();
                  }}
                >
                  Mark all as read
                </a>
              </>
            )}
          </div>
        </div>

      </>
    );
  }
}

export default NotificationDropdown;