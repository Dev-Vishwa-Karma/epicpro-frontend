import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TimeSkeleton = ({ width = "20px", height = "20px" }) => {
    return (
        <span style={{ display: "inline-flex", gap: "1px", alignItems: "center", verticalAlign: "middle" }}>
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <div style={{ width: "1px" }}></div>
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <div style={{ width: "1px" }}></div>
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <div style={{ width: "1px" }}></div>
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
            <Skeleton 
                width="3px" 
                height={height} 
                style={{ 
                    display: "inline-block",
                    borderRadius: "1px",
                    backgroundColor: "#7B7493",
                }} 
            />
        </span>
    );
};

export default TimeSkeleton; 