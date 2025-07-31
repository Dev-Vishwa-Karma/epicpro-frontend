import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProjectCardSkeleton = () => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card h-100 d-flex flex-column ">
        <div className="card-header">
          <h3 className="card-title">
            <Skeleton width={150} />
          </h3>
          <div className="card-options">
            <label className="custom-switch m-0">
              <Skeleton width={30} />
            </label>
            <div className="dropdown d-flex">
              <a href="/#" className="nav-link icon d-none d-md-flex ml-1">
                <Skeleton width={30} />
              </a>
              <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                <button className="dropdown-item project-dropdown-item" type="button">
                  <Skeleton width={50} />
                </button>
                <button className="dropdown-item project-dropdown-item" type="button" style={{ color: "#d9534f" }}>
                  <Skeleton width={50} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body flex-grow-1">
          <span className="mb-3">
            <Skeleton width={100} />
          </span>
          <p
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Skeleton count={3} />
          </p>
          <div className="row">
            <div className="col-4 py-1">
              <strong><Skeleton width={50} /></strong>
            </div>
            <div className="col-8 py-1">
              <Skeleton width={100} />
            </div>
            <div className="col-4 py-1">
              <strong><Skeleton width={50} /></strong>
            </div>
            <div className="col-8 py-1">
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Display 3 skeleton placeholders for team members */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    circle
                    width={35}
                    height={35}
                    style={{
                      marginLeft: idx === 0 ? 0 : -14,
                      zIndex: 10 + idx,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
