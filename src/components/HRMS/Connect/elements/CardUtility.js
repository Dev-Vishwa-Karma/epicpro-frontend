import * as React from "react";
import Avatar from "../../../common/Avatar";


const STATUS_CONFIG = {
  unread: {
    tag: "tag-red",
    label: "Unread",
    color: "#ff4d4f",
  },
  read: {
    tag: "tag-blue",
    label: "Read",
    color: "#1890ff",
  },
  ready_to_discuss: {
    tag: "tag-warning",
    label: "Ready To Discuss",
    color: "#faad14",
  },
  completed: {
    tag: "tag-danger",
    label: "Completed",
    color: "#f5222d",
  },
};

const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || {
    tag: "tag-light",
    label: status || "Unknown",
    color: "#d9d9d9",
  };
};


export const Priority = ({ priority }) => {
  const map = {
    low: {
      tag: "tag-success",
      label: "Low"
    },
    medium: {
      tag: "tag-warning",
      label: "Medium"   
    },
    high: {
      tag: "tag-success",
        label: "High"
    }
  };

  const config = map[priority] || map.low;

  return (
     <span className={`tag mx-1 small 
            ${config.tag}`}
    >
        {config.label || priority}
    </span>
  );
};

export const Type = ({ type }) => {
  const map = {
    low: {
      tag: "tag-success",
      label: "todo"
    },
    medium: {
      tag: "tag-warning",
      label: "information"   
    },
    high: {
      tag: "tag-danger",
        label: "need_discussion"
    }
  };

  const config = map[type] || map.low;

  return (
     <span className={`tag mx-1 small 
            ${config.tag}`}
    >
        {config.label || type}
    </span>
  );
};

export const Status = ({ connect }) => {

  const config = getStatusConfig(connect.read);
  return (
    <div className="mt-2">
      <Avatar
          profile={connect.profile}
          size={35}
          alt={connect.sender ? JSON.parse(connect.sender).name: ''}
          className="avatar avatar-blue add-space me-2"
          borderColor={config.color}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          style={{
              objectFit: 'cover',
          }}
          onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
          title={JSON.parse(connect.sender).name || 'User'}
      />
    </div>
  );
};

export const Receivers = ({receivers, currentTab}) => {
    if (!receivers) return null;
    const raw = receivers.receivers || receivers;

    let parsed = [];

    try {
        parsed = typeof raw === "string"
            ? JSON.parse(raw)
            : raw;
    } catch {
        parsed = [];
    }

    const visible = parsed.slice(0, 2);
    const extra = parsed.length - visible.length;

    return (
            <div className="overflow-auto mt-2" style={{ display: 'flex', alignItems: 'center' }}>
                {visible.map((connect, i) => {
                    const config = getStatusConfig(connect.read);
                    return (
                          <Avatar
                              key={connect.employee_id || i} 
                              profile={connect.profile}
                              size={35}
                              alt={connect.receiver_name ?? ''}
                              className="avatar avatar-blue add-space me-2"
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                              borderColor={config.color}
                              style={{ marginLeft: i === 0 ? 0 : -14 }}
                              onError={(e) => e.target.src = '/assets/images/sm/avatar2.jpg'}
                              title={connect.receiver_name || 'User'}
                          />
                    );
                })}
            </div>
        );
};

