import React from 'react';
import { NavLink } from 'react-router-dom';

const DueTasksAlert = ({ dueTasks, onClose }) => {
  if (!dueTasks || dueTasks.length === 0) return null;

  return (
    <NavLink
      to="/project-todo"
      className="alert alert-warning alert-dismissible fade show d-block text-decoration-none text-dark"
      role="alert"
      style={{
        margin: '33px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
    >
      <i className="fa-solid fa-circle-check me-2"></i>
      <strong>You have tasks that are due today:</strong>{' '}
      {dueTasks.map((duetask) => duetask.title).join(', ')}

      <button
        type="button"
        className="close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
      </button>
    </NavLink>
  );
};

export default DueTasksAlert;
