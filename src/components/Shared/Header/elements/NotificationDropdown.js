import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import NotificationSkeleton from "../../../common/skeletons/NotificationSkeleton";

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

  render() {
    const { notifications, markAsRead, navigateToNotifications } = this.props;
    const { loadingMore, hasMore } = this.state;

    return (
      <div className="dropdown d-flex">
        {/* Notification Icon */}
        <a
          href="/#"
          className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1"
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

                    return (
                      <li
                        key={index}
                        style={{
                          backgroundColor:
                            Number(notification.read) === 0 ? "#E8E9E9" : "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                        }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="feeds-body">
                          <h4
                            className={`title text-danger ${
                              Number(notification.read) === 0 ? "font-weight-bold" : ""
                            }`}
                          >
                            {notification.title}
                            <small className="float-right text-muted">
                              {formattedDate}
                            </small>
                          </h4>
                          <small className="notification-body" dangerouslySetInnerHTML={{__html: notification.body}} >
                            
                          </small>
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
    );
  }
}

export default NotificationDropdown;
