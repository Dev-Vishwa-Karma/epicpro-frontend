import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TimeSkeleton = () => {
    return (
        <span style={{ display: "inline-flex", gap: "2px", alignItems: "center", verticalAlign: "middle" }}>
            <Skeleton 
                width={10}
                style={{ 
                    backgroundColor: "#7B7493",
                }}
            />
            <div style={{ width: "3px" }}>:</div>
            <Skeleton 
                width={10} 
                style={{ 
                    backgroundColor: "#7B7493",
                }}
            />
            <div style={{ width: "3px" }}>:</div>
            <Skeleton 
                width={10} 
                  style={{ 
                    backgroundColor: "#7B7493",
                }} 
            />
        </span>
    );
};

export default TimeSkeleton; 