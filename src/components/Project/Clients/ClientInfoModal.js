// import React from "react";

// const ClientInfoModal = ({ client, onClose }) => {
//   if (!client) return null;

//   return (
//     <div
//       className="modal fade show d-block"
//       tabIndex="-1"
//       role="dialog"
//       style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//     >
//       <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
//         <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px", overflow: "hidden" }}>
//           <div className="d-flex flex-row p-4">
//             {/* LEFT SECTION */}
//             <div className="text-center px-4" style={{ minWidth: "250px" }}>
//               <div
//                 className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
//                 style={{
//                   width: "120px",
//                   height: "120px",
//                   background: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
//                   padding: "5px",
//                 }}
//               >
//                 <img
//                   src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
//                   alt="Profile"
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                   }}
//                 />
//               </div>
//               <h5 className="mb-0">{client.client_name}</h5>
//               <small className="text-muted">{client.client_email}</small>

//               <ul className="list-unstyled text-start mt-4">
//                 <li><strong>Country:</strong> {client.client_country}</li>
//                 <li><strong>State:</strong> {client.client_state}</li>
//                 <li><strong>City:</strong> {client.client_city}</li>
//               </ul>
//             </div>

//             {/* RIGHT SECTION */}
//             <div className="flex-grow-1 px-4">
//               <h6 className="text-muted mb-3">About</h6>
//               <p className="text-muted">{client.client_about}</p>

//               <h6 className="text-muted mt-4 mb-2">Stats</h6>
//               <div className="d-flex flex-wrap gap-3">
//                 <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded">
//                   Project Count: {client.project_count}
//                 </div>
//                 <div className="badge bg-success-subtle text-success px-3 py-2 rounded">
//                   Employee Count: {client.employee_count}
//                 </div>
//                 <div className="badge bg-warning-subtle text-warning px-3 py-2 rounded">
//                   Status: {client.client_status}
//                 </div>
//               </div>

//               {/* Placeholder for "Works with" avatars */}
//              {/* <div className="mt-4">
//                 <h6 className="text-muted mb-2">Works Most With</h6>
//                 <div className="d-flex gap-2">
//                    <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded">
//                   Project Count: {client.project_count}
//                 </div>
//                 <div className="badge bg-success-subtle text-success px-3 py-2 rounded">
//                   Employee Count: {client.employee_count}
//                 </div>
//                 <div className="badge bg-warning-subtle text-warning px-3 py-2 rounded">
//                   Status: {client.client_status}
//                 </div>
//                 </div>
//               </div> */}

//             </div>
//           </div>

//           {/* Footer */}
//           <div className="modal-footer border-0 justify-content-center pb-4">
//             <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientInfoModal;

import React from "react";

const ClientInfoModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div
          className="modal-content border-0 shadow"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            paddingBottom: "20px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Gradient Header */}
          <div
            style={{
              background: "linear-gradient(135deg, grey 0%, #f2f2f2 100%)",
              height: "120px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "-50px",
                transform: "translateX(-50%)",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "5px solid white",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src={`${process.env.REACT_APP_API_URL}/${client.client_profile}`}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Card Body */}
          <div className="text-center mt-5 px-4">
            <h5 className="mb-1">{client.client_name}</h5>
            <small className="text-muted">{client.client_email}</small> <br/>
            <small className="text-muted">{client.client_city}, {client.client_state}, {client.client_country}</small>

            <div className="text-muted mt-2 mb-3" style={{ fontSize: "14px" }}>
              {client.client_about || "No description available."}
            </div>

            <div className="d-flex justify-content-around my-3">
              <div className="shadow-sm p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                <strong>{client.project_count}</strong><br />
                <small className="text-muted">Project Count</small>
              </div>
              <div className="shadow-sm p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                <strong>{client.employee_count}</strong><br />
                <small className="text-muted">Employee Count</small>
              </div>
              <div className="shadow-sm p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}> 
                <strong>{client.client_status}</strong><br />
                <small className="text-muted">Status</small>
              </div>
            </div>

            <button
              className="btn"
              style={{
                background: "linear-gradient(135deg, yellow 0%, pink 100%)",
                color: "#fff",
                borderRadius: "24px",
                padding: "10px 24px",
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientInfoModal;
