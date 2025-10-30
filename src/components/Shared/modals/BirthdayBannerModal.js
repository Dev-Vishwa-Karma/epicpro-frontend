// BirthdayBanner.js
import React, { Component } from 'react';
import Avatar from '../../common/Avatar';

const messages = [
    "Wishing you an incredible year filled with success, happiness, and health!",
    "May your day be as amazing as you are!",
    "Cheers to another year of greatness!",
    "Enjoy your special day to the fullest!",
    "May your birthday be filled with laughter and love!"
];

class BirthdayBannerModal extends Component {
    state = {
        dontShowAgain: false,
        message: '',
        defaultProfileUrl: '',
        user: null
    };

    componentDidMount() {
        // Get user from props or localStorage
        let user = this.props.user;
        if (!user) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            user = JSON.parse(userStr);
          }
        }
        if (!user) return;

        // Set default avatar based on gender
        const isMale = user.gender === 'male';
        const defaultUrl = isMale
          ? '../../assets/images/sm/avatar2.jpg'
          : '../../assets/images/sm/avatar1.jpg';

        // Pick a random birthday message once
        const message = messages[Math.floor(Math.random() * messages.length)];

        this.setState({ defaultProfileUrl: defaultUrl, message, user });
    }

    onCheckboxChange = e => this.setState({ dontShowAgain: e.target.checked });

    onClose = () => {
        if (this.state.dontShowAgain) {
          localStorage.setItem('isBirthdayBannerVisible', 'false');
        }
        this.props.onClose();
    };

    render() {
        const { visible } = this.props;
        const { message, defaultProfileUrl, user } = this.state;
        if (!visible || !user) return null;

        return (
          <div
              className="modal fade show d-block"
              id="birthdayBannerModal"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
              <div className="modal-dialog modal-dialog-centered" role="document">
                  <div
                      className="modal-content text-center p-4"
                      style={{
                        borderRadius: '15px',
                        background: 'linear-gradient(to right, #ffecd2, #fcb69f)',
                      }}>
                    <div className="modal-header border-0">
                        <h5 className="modal-title w-100 text-dark display-6 fw-bold">
                          <span role="img" aria-label="party popper">🎉</span> Happy Birthday! <span role="img" aria-label="birthday cake">🎂</span>
                        </h5>
                    </div>
                    <div className="modal-body">
                        <Avatar
                            profile={user.profile || defaultProfileUrl}
                            first_name={user.first_name}
                            last_name={user.last_name}
                            size={130}
                            className="rounded-circle shadow mb-3"
                            onError={e => { e.target.onerror = null; e.target.src = defaultProfileUrl; }}/>
                        <h3 className="fw-bold text-dark mb-2">
                            {user.first_name} {user.last_name}
                        </h3>
                        <p className="lead text-dark">{message}</p>
                        <p className="text-muted small mt-3">
                          — From all of us at <strong>Profilics Systems PVT. LTD.</strong>
                        </p>
                        <div className="form-check mt-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="dontShowAgain"
                                onChange={this.onCheckboxChange}
                                checked={this.state.dontShowAgain}/>
                            <label className="form-check-label" htmlFor="dontShowAgain">
                              Don’t show this again
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer border-0 justify-content-center">
                        <button
                            type="button"
                            className="btn btn-outline-dark px-4"
                            onClick={this.onClose}>
                          Thank You
                        </button>
                    </div>
                </div>
              </div>
          </div>
        );
    }
}

export default BirthdayBannerModal;