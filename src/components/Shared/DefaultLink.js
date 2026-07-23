import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleLeftMenuAction } from '../../actions/settingsAction';

class DefaultLink extends Component {
	constructor() {
		super();

		this.onClick = this.onClick.bind(this);
	}

	onClick(e) {
		if (this.props.itemProps.hasSubMenu) {
			this.props.itemProps.toggleSubMenu(e)
		} else {
			this.props.itemProps.activateMe({
				newLocation: this.props.to,
				selectedMenuLabel: this.props.label,
			});
			if (window.innerWidth <= 991 && this.props.toggleLeftMenuAction) {
				this.props.toggleLeftMenuAction(false);
			}
		}
	}
	render() {
		const { menuIcon, subMenuIcon, itemProps } = this.props
		if (itemProps.id === 'Directories' || itemProps.id === 'UiElements') {
			return (
				<span className="g_heading">
					{itemProps.label}
				</span>
			);
		} else {
			return (
				<span className={window.location.pathname === itemProps.to ? "active" : ""}>
					<NavLink to={`${itemProps.to}`} onClick={(e) => this.onClick(e)} className={window.location.pathname === itemProps.to ? menuIcon : subMenuIcon}>
						{itemProps.children[0].props.className ? itemProps.children : itemProps.label}
					</NavLink>
				</span>
			);
		}
	}
};
const mapStateToProps = state => ({
	subMenuIcon: state.settings.isSubMenuIcon,
	menuIcon: state.settings.isMenuIcon
})

const mapDispatchToProps = dispatch => ({
	toggleLeftMenuAction: (e) => dispatch(toggleLeftMenuAction(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(DefaultLink);