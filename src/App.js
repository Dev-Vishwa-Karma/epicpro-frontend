import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';
import Layout from './components/Shared/Layout';
import Login from './components/Authentication/login';
import authService from "./components/Authentication/authService";
import ForgotPassword from './components/Authentication/ForgotPassword';
import ResetPassword from './components/Authentication/ResetPassword';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Pusher from 'pusher-js';
import logo from "./logo.svg";
import emitter from "./emitter";

class App extends Component {
	pusher = null;
    channel = null;
	constructor(props) {
        super(props);
        this.state = {
            user: authService.getUser(),
        };
    }

	componentDidMount() {
        authService.subscribe((user) => {
            this.setState({ user });
        });
		if (this.state.user) {
			this.handlePusher();
		}
    }

	handlePusher = ()=>{

		// Request notification permission
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

		const {id, first_name} = window.user
        // Initialize Pusher
        Pusher.logToConsole = true;
		const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER,
		});
		const channel = pusher.subscribe(process.env.REACT_APP_PUSHER_CHANNEL);

		const events = [
				`new_notification${id}`,
				`update_status${id}`
			];

			events.forEach(eventName => {
				channel.bind(eventName, (data) => {
					showNotification(data, first_name);
				emitter.emit("notificationUpdated");
			});
		});

		const showNotification = (data, first_name) => {
				console.log('data=> under Push Notification=>')
			if (Notification.permission === "granted") {
				const notification = new Notification(`Hi ${first_name}`, {
					body: `${data.title} | ${data.message}`,
					icon: logo,
					requireInteraction: true,
				});
				emitter.emit("notificationUpdated");
				notification.onclick = function () {
					window.open(process.env.REACT_APP_NOTIFICATION_REDIRECT_URL, "_blank");
				};
			}
		};

        // Cleanup on unmount
        this.pusher = pusher;
        this.channel = channel;

	}

	componentWillUnmount() {
        if (this.channel) {
            this.channel.unbind_all();
            this.channel.unsubscribe();
        }
        if (this.pusher) {
            this.pusher.disconnect();
        }
    }

	handleLogin = (userData) => {
        authService.setUser(userData);  // Save user to localStorage
        this.setState({ user: userData });  // Update state
    };

    handleLogout = () => {
        authService.logout();  // Remove user from localStorage
        this.setState({ user: null });
    };

	render() {
		const { user } = this.state;
		const { darkMode, boxLayout, darkSidebar, iconColor, gradientColor, rtl, fontType } = this.props
		return (
			<div className={`${darkMode ? "dark-mode" : ""}${darkSidebar ? "sidebar_dark" : ""} ${iconColor ? "iconcolor" : ""} ${gradientColor ? "gradient" : ""} ${rtl ? "rtl" : ""} ${fontType ? fontType : ""}${boxLayout ? "boxlayout" : ""}`}>
				<Router>
					<Switch>
						<Route path="/login">
							{user ? <Redirect to="/" /> : <Login onLogin={this.handleLogin} />}
						</Route>
						<Route path="/forgot-password">
							{user ? <Redirect to="/" /> : <ForgotPassword />}
						</Route>
						<Route path="/reset-password">
							{user ? <Redirect to="/" /> : <ResetPassword />}
						</Route>
						<Route path="/">
							{user ? <Route component={Layout} /> : <Redirect to="/login" />}
						</Route>
					</Switch>
				</Router>
			</div>
		);
	}
}
const mapStateToProps = state => ({
	darkMode: state.settings.isDarkMode,
	darkSidebar: state.settings.isDarkSidebar,
	iconColor: state.settings.isIconColor,
	gradientColor: state.settings.isGradientColor,
	rtl: state.settings.isRtl,
	fontType: state.settings.isFont,
	boxLayout: state.settings.isBoxLayout
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(App)