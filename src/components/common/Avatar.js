import React from 'react';

const Avatar = ({ 
  profile, 
  first_name, 
  last_name, 
  alt = '', 
  size = 35, 
  borderColor = '#fff', 
  borderRadius = '50%', 
  objectFit = 'cover', 
  onError, 
  onMouseEnter, 
  onMouseLeave, 
  style, 
  className 
}) => {
  // Fallback to initials if no profile image is available
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius,
    objectFit,
    border: `2px solid ${borderColor}`,
    transition: 'z-index 0.2s, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
    cursor: 'pointer',
    ...style
  };

  // Check if profile image is provided, else use initials
  const renderAvatar = profile ? (
    <img
      src={`${process.env.REACT_APP_API_URL}/${profile}`}
      alt={alt || `${first_name} ${last_name}`}
      title={alt || `${first_name} ${last_name}`}
      style={avatarStyle}
      className={className}
      onError={onError || (e => e.target.src = '/assets/images/sm/avatar2.jpg')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  ) : (
    <span
      className={className}
      style={{
        ...avatarStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C5C4C8',
        color: '#fff',
        fontWeight: '600',
        textTransform: 'uppercase',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={alt || `${first_name} ${last_name}`}
    >
      {getInitials(first_name, last_name)}
    </span>
  );

  return renderAvatar;
};

export default Avatar;
