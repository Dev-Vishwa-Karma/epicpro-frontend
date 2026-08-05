import React, { Component } from 'react';
import Menu from './Menu/Menu';
import api from '../../api/axios';
import authService from '../Authentication/authService';
import cryptoService from '../../services/cryptoService';
import E2EESetupModal from './E2EE/E2EESetupModal';

export default class Layout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showE2EESetupModal: false,
			e2eeSetupMode: 'generate',
			backupData: null
		};
	}

	componentDidMount() {
		this.checkE2EEStatus();
		window.addEventListener('openE2EESetupModal', this.handleOpenModal);
	}

	componentWillUnmount() {
		window.removeEventListener('openE2EESetupModal', this.handleOpenModal);
	}

	handleOpenModal = () => {
		this.checkE2EEStatus(true);
	};

	checkE2EEStatus = async (force = false) => {
		const user = authService.getUser();
		if (!user || !user.id) return;
		if (!force && !["super_admin", "admin"].includes(user?.role)) return;

		try {
			const res = await api.get("/get_employees.php?action=check-public-key");
			const publicKey = res.data?.data?.public_key;
			const encryptedBlob = res.data?.data?.encrypted_blob;
			const hasPrivateKey = await cryptoService.hasPrivateKey(user.id);

			if (!publicKey) {
				this.setState({
					showE2EESetupModal: true,
					e2eeSetupMode: 'generate',
				});
			} else if (!hasPrivateKey && encryptedBlob) {
				this.setState({
					showE2EESetupModal: true,
					e2eeSetupMode: 'restore',
					backupData: { encryptedBlob },
				});
			} else if (!hasPrivateKey && !encryptedBlob) {
				this.setState({
					showE2EESetupModal: true,
					e2eeSetupMode: 'generate',
				});
			}
		} catch (error) {
			console.error("Global E2EE status check failed:", error);
		}
	};

	render() {
		return (
			<div id="main_content">
				<Menu {...this.props} />
				<E2EESetupModal
					isOpen={this.state.showE2EESetupModal}
					onClose={() => this.setState({ showE2EESetupModal: false })}
					mode={this.state.e2eeSetupMode}
					backupData={this.state.backupData}
					onSuccess={() => this.setState({ showE2EESetupModal: false })}
				/>
			</div>
		);
	}
}
