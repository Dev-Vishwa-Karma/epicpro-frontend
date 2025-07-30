import React, { Component } from 'react';
import ClientCard from './ClientCard';
import BlankState from '../../common/BlankState';

class ClientCards extends Component {
    render() {
        const {
            clients,
            loading,
            onViewProfile,
            onEditClient,
            onDeleteClient
        } = this.props;

        if (loading) {
            return (
                <div className="col-12">
                    <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                        <div className="dimmer active">
                            <div className="loader" />
                        </div>
                    </div>
                </div>
            );
        }

        if (!clients || clients.length === 0) {
            return (
                <div className="col-12">
                    <BlankState message="No clients available" />
                </div>
            );
        }

        return (
            <>
                {clients.map((client, index) => (
                    <ClientCard
                        key={client.client_id || index}
                        client={client}
                        onViewProfile={onViewProfile}
                        onEditClient={onEditClient}
                        onDeleteClient={onDeleteClient}
                    />
                ))}
            </>
        );
    }
}

export default ClientCards; 