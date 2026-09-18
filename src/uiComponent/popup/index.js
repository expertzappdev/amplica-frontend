// DisabledPortalPopup.js

import React from 'react';
import PropTypes from 'prop-types';
import './style.css'; 

export default function DisabledPortalPopup() {
  return (
    <div className="popup-container">
      <PopupWithTrigger id="popup-with-portal" buttonLabel="With a portal" />

      <PopupWithTrigger
        id="popup-without-portal-fixed"
        buttonLabel="No portal, 'fixed' strategy"
        disablePortal
        strategy="fixed"
      />
    </div>
  );
}

function PopupWithTrigger(props) {
  const { id, buttonLabel, ...other } = props;

  const [anchor, setAnchor] = React.useState(null);

  const handleClick = (event) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const open = Boolean(anchor);

  return (
    <div>
      <button className="popup-button" aria-describedby={id} type="button" onClick={handleClick}>
        {buttonLabel}
      </button>
      {open && (
        <div className="styled-popup" id={id} style={{ top: anchor.offsetTop, left: anchor.offsetLeft }} {...other}>
          <div className="popup-body">{buttonLabel}</div>
        </div>
      )}
    </div>
  );
}

PopupWithTrigger.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  id: PropTypes.string,
};
