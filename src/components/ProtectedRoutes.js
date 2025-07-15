import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

class ProtectedRoute extends Component {
  // Method to check if the user is authorized
  isAuthorized = (routeProps) => {
    const { roles, path } = this.props;
    const currentUser = window.user;

    // General role check
    const hasRole = roles?.length === 0 || roles?.includes(currentUser?.role);

    // Additional check: employee can't view others' profiles
    if (path.startsWith("/view-employee")) {
      const { match } = routeProps;
      const idFromUrl = match.params.id;

      const isAdmin = ['admin', 'super_admin'].includes(currentUser?.role);
      const isSelf = currentUser?.id?.toString() === idFromUrl;

      return isAdmin || isSelf;
    }

    return hasRole;
  };

  render() {
    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          this.isAuthorized(props) ? (
            <Component {...props} />
          ) : (
            <Redirect to="/" />
          )
        }
      />
    );
  }
}

export default ProtectedRoute;
