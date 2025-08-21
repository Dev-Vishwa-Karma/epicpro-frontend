import React, { Component } from 'react';
import Menu from './Menu/Menu';

export default class Layout extends Component {
	render() {
		return (
			<div id="main_content">
				<Menu {...this.props} />
			</div>
		);
	}
}
