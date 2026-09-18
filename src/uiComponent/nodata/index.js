import React from 'react'
import './style.css'
export default function Nodata() {
  return (
    <div className="flex-container-nodata">
    <div className="icon-container">
      <img src="https://averybit.grovehr.com/static/svg/empty_state_time_off_colored.svg" alt="Time Off Icon"/>
    </div>
    {/* <h3 className="title">Title here</h3> */}
    <span className="subtext" title="">Look like your team is hard working.</span>      
  </div>
  
  )
}
