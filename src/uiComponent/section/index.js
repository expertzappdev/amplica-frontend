import React from 'react';
import './style.css';
// Sample JSON data with an array of work schedules

const Calculation = ({attsummary}) => {

  return (
    <div className="attendancecard">
      <div className="insidecard">
        <div className="cards">
          <h6 className="cardstitle">Work Schedules</h6>
          <p className="schedule">{attsummary?.totalWorkingHours}</p>

        </div>
        <div className="cards">
          <h6 className="cardstitle">Logged Time</h6>
          <p className="schedule">{attsummary?.totalLoggedTime}</p>

        </div>
        <div className="cards">
          <h6 className="cardstitle">Paid Time</h6>
          <p className="schedule">{attsummary?.totalPaidTime}</p>

        </div>
        <div className="cards">
          <h6 className="cardstitle">Deficit</h6>
          <p className="schedule">{attsummary?.totalDeficitTime}</p>

        </div>

        <div className="cards">
          <h6 className="cardstitle">Overtime</h6>
          <p className="schedule">{attsummary?.totalOvertime}</p>

        </div>
      </div>
    </div>
  );
};

export default Calculation;
