import React, { Component } from 'react';
import Menu from './Menu/Menu';
import ChatWidget from './ChatWidget';

export default class Layout extends Component {
	render() {
		return (
			<div id="main_content">
				<Menu {...this.props} />
				<ChatWidget />
			</div>
		);
	}
}
