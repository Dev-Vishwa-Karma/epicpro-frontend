import * as React from "react";


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

export const Status = ({ status }) => {
    console.log("Rendering status:", status);
  const map = {
    unread: {
      tag: " tag-red",
      label: "unread"
    },
    read: {
      tag: "tag-blue",
      label: "read",
    },
    ready: {
      tag: "tag-warning",
      label: "ready_to_discuss",
    },
    complete: {
      tag: "tag-danger",
      label: "completed",
    }
  };

  const config = map[status] || {
    label: status,
    tag: "grey"
  };

  return (
    <span className={`ui ${config.tag} label`}>
      {config.label}
    </span>
  );
};

export const Receivers = (receivers) => {
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
                <span className="flex gap-2">
                    {visible.map((r, i) => {

                        return (
                            <span key={i} className="" style={{marginLeft:'4px'}}>
                                <span className="receiver">
                                    👤 {r.receiver_name}
                                </span>
                            </span>
                        );
                    })}

                    {extra > 0 && (
                        <span style={{marginLeft:'4px'}} className="more"><span style={{color: 'blue', cursor: 'pointer'}} >...+{extra}more</span></span>
                    )}
                </span>
            );
};

