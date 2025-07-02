import React, { Component } from 'react';
import ActivitiesTime from './ActivitiesTime';

class Activities extends Component {
  render() {
    return (
		<div className={`section-body ${this.props.fixNavbar ? "marginTop" : ""} mt-3`}>
      		<ActivitiesTime />
	    </div>
    );
  }
}

export default Activities;