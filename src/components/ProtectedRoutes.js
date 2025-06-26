import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

class ProtectedRoute extends Component {
  // Method to check if the user is authorized
  isAuthorized = () => {
      const { roles } = this.props;
      const currentUser = window.user
      console.log(
          roles
      );
      
    return roles?.length === 0 || roles?.includes(currentUser?.role);
  };

  // Render method
  render() {
    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          this.isAuthorized() ? (
            <Component {...props} />
          ) : (
            <Redirect to="/" /> // Or a custom "Unauthorized" page
          )
        }
      />
    );
  }
}

export default ProtectedRoute;