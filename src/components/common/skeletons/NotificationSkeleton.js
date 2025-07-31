import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const NotificationSkeleton = ({rows}) => {
    return (
        <ul className="list-unstyled feeds_widget">
            {Array.from({ length: rows }).map((_, index) => (
                <li key={index} style={{cursor: 'pointer', borderBottom: '1px solid #ddd'}} >
                <div className="feeds-body">
                    <h4 className="title text-danger">
                    <Skeleton width="50%" />
                    <small className="float-right text-muted"> <Skeleton width="20%"/></small>
                    </h4>
                    <small className="notification-body">
                    <Skeleton count={2} />
                    </small>
                </div>
                </li>
            ))}
        </ul>
  );
};

export default NotificationSkeleton;




