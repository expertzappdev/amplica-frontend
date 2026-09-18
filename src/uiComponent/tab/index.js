import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import  {formatDate}  from 'utils/utils';
import { useSelector } from 'react-redux';
import { convertFractionalTime } from 'utils/utils';
function Row(props) {
    const rows = props.row;
    const attnLastDate = props.attnLastDate
    console.log("TT0123 rows",rows)
    console.log("TT0123 attnLastDate",attnLastDate)
    const [openRows, setOpenRows] = React.useState([]);
    const firstSessionData = useSelector((state) => state.filterattendace.firstSessionData);
    console.log("TT0123 firstSessionData",firstSessionData)
    // Function to toggle the open state for a specific row
    const toggleRow = (index) => {
      const newOpenRows = [...openRows];
      newOpenRows[index] = !newOpenRows[index];
      setOpenRows(newOpenRows);
    };
  
    return (
      <React.Fragment>
        {rows &&
          rows.map((row, index) => (
            <React.Fragment key={index}>
              <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => toggleRow(index)}
                  >
                    {openRows[index] ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                {formatDate(row.date)}
                </TableCell>
                <TableCell >{new Date(row.sessions[0].eventInTime).toLocaleTimeString()}</TableCell>
                <TableCell >{firstSessionData.isClockInGeofence?"Headquater":"Outside"}</TableCell>
                <TableCell >{row.sessions[row.sessions.length-1].type===0?new Date(row.sessions[row.sessions.length-1].eventOutTime ).toLocaleTimeString():'-'}</TableCell>
               { row.sessions[row.sessions.length-1].type === 0 ?<TableCell >{ row.sessions[row.sessions.length-1].isClockOutGeofence?"Headquater":"Outside"}</TableCell>:<TableCell>-</TableCell>}
                <TableCell >{row.hoursPerDay}</TableCell>
                <TableCell >{convertFractionalTime(row.totalLoggedTime)}</TableCell>
                <TableCell >{convertFractionalTime(row.paidTime)}</TableCell>
                <TableCell >{convertFractionalTime(row.deficitTime)}</TableCell>
                <TableCell >{convertFractionalTime(row.overtime)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                  <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                    <Box>
                      {/* <Typography variant="h6" gutterBottom component="div">
                        History
                      </Typography> */}
                      <Table size="large" aria-label="purchases">
                      <TableHead>
                  <TableRow>
                    <TableCell>Clock In </TableCell>
                    <TableCell>Clock In Location</TableCell>
                    <TableCell >Clock Out</TableCell>
                    <TableCell >Clock Out Location</TableCell>
                  </TableRow>
                </TableHead>
                        <TableBody>
                        {row.sessions &&
                          row.sessions.map((session, sessionIndex) => (
                            <TableRow key={sessionIndex}>
                     
                              <TableCell>{new Date(session.eventInTime).toLocaleTimeString()}</TableCell>
                              <TableCell>{session.isClockInGeofence?"Headquater":"Outside"}</TableCell>
                              <TableCell>{new Date(session.eventOutTime).toLocaleTimeString()}</TableCell>
                              <TableCell>{session.isClockOutGeofence?"Headquater":"Outside"}</TableCell>
                             
                                
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
      </React.Fragment>
    );
  }
  
  // ... (rest of the component remains unchanged)
  

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      }),
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
};



export default function CollapsibleTable({data,attnLastDate}) {
  console.log("TT0!",data)
  return (
    <TableContainer component={Paper} >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Date</TableCell>
            <TableCell >CLock In</TableCell>
            <TableCell >Clock In Location</TableCell>
            <TableCell >Clock Out</TableCell>
            <TableCell >Clock Out Location</TableCell>
            <TableCell >Work Schedule</TableCell>
            <TableCell >Logged Time</TableCell>
            <TableCell >Paid Time</TableCell>
            <TableCell >Deficit</TableCell>
            <TableCell >Over Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
      
            <Row  row={data} attnLastDate={attnLastDate} />
       
        </TableBody>
      </Table>
    </TableContainer>
  );
}
