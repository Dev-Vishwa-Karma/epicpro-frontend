// EventListSkeleton.js
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ListSkeleton = ({ rows = 5 }) => {
  return (
    <div
      id="event-list"
      className="fc event_list"
      style={{ maxHeight: "600px", overflowY: "auto" }}
    >
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="event-card card mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="fc-event" style={{ flex: 1 }}>
              {/* Event Name Skeleton */}
              <Skeleton height={20} width="60%" />
              {/* Event Date Skeleton */}
              <Skeleton height={15} width="40%" />
              {/* Delete Button Skeleton */}
              {/* <div className="position-relative">
                <Skeleton
                  circle
                  height={24}
                  width={24}
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                  }}
                />
              </div> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
