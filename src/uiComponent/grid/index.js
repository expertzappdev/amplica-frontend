import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { IconButton, Button } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import Nodata from 'uiComponent/nodata';
import {
  Avatar
} from '@mui/material';
import SizeAvatars from 'uiComponent/avatar/index';
import "./style.css"
function CollapsibleTable({ columns, data, handleclick, displayCount, handleSaveClick, openDeleteModal, timeoff, employeetimeoff, myattendance, Empattendance, document, documentdetail, candidate, jobdetail, jobId, template, handleOpenNewPopup, holiday,openEditModal ,handleOpenJobAssignDialog}) {
  // if (!data || data.length === 0) {
  //   return <Nodata />; // Render Nodata component if no data is available
  // }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.map((row, index) => (
            <TableRow key={index} className='employeeRow'>
              {displayCount && <TableCell>{index + 1}</TableCell>} {/* Display counting */}
              {displayCount && <TableCell onClick={() => handleclick(row.roleName, row.roleId)}>{row.roleName}</TableCell>} {/* Display role name */}
              {displayCount && <TableCell>{row.employeeCount}</TableCell>}{/* Display employee count */}
              {displayCount === false && <TableCell onClick={() => handleSaveClick(row.employeeId)}> <div className='employeeCell'>
                <Avatar
                  alt=''
                  src={row.featuredImageURL}
                  className="rounded-circle"
                  sx={{ width: 40, height: 40 }}
                />
                <div className='employeeName'>{row.fullName}</div>
              </div></TableCell>}
              {displayCount === false && <TableCell>{row.roleName}</TableCell>}
              {displayCount === false && <TableCell>{row.lineManagerName}</TableCell>}
              {displayCount === false && <TableCell>{row.companyName}</TableCell>}
              {displayCount === false && <TableCell align='right' onClick={() => openEditModal(row.employeeId, row.roleName)}><EditOutlinedIcon /></TableCell>}
              {displayCount === false && <TableCell onClick={() => openDeleteModal(row.employeeId)}><DeleteOutlineRoundedIcon style={{ color: 'red' }} /></TableCell>}
              {timeoff === true && <TableCell>{row.fromDate}</TableCell>}
              {timeoff === true && <TableCell>{row.toDate}</TableCell>}
              {timeoff === true && <TableCell>{row.leaveTypeName}</TableCell>}
              {timeoff === true && <TableCell>{row.status}</TableCell>}
              {employeetimeoff === true && <TableCell>{row.fullName}</TableCell>}
              {employeetimeoff === true && <TableCell>{row.fromDate}</TableCell>}
              {employeetimeoff === true && <TableCell>{row.toDate}</TableCell>}
              {employeetimeoff === true && <TableCell>{row.leaveTypeName}</TableCell>}
              {employeetimeoff === true && <TableCell>{row.statusName}</TableCell>}
              {employeetimeoff === true && <TableCell onClick={() => handleSaveClick(row.leaveId)}>  <MoreHorizIcon /></TableCell>}
              {myattendance === true && <TableCell>{row.date}</TableCell>}
              {myattendance === true && <TableCell>{row.clockInTime}</TableCell>}
              {myattendance === true && <TableCell>{row.clockinlocation}</TableCell>}
              {myattendance === true && <TableCell>{row.clockOutTime}</TableCell>}
              {myattendance === true && <TableCell>{row.clockoutlocation}</TableCell>}
              {myattendance === true && <TableCell>{row.workschedule}</TableCell>}
              {myattendance === true && <TableCell>{row.loggedTime}</TableCell>}
              {Empattendance === true && <TableCell onClick={() => handleSaveClick(row)}><div className='employeeCell'>
              <Avatar
                  alt=''
                  src={row.employeeImageURL}
                  className="rounded-circle"
                  sx={{ width: 40, height: 40 }}
                /> <div className='employeeName'>{row.employeeName}</div></div></TableCell>}
              {Empattendance === true && <TableCell>{row.monthlySummary.totalPaidTime}/{row.monthlySummary.totalWorkingHours}</TableCell>}
              {Empattendance === true && <TableCell>{row.monthlySummary.totalOvertime}</TableCell>}
              {Empattendance === true && <TableCell>{row.status}</TableCell>}
              {template === true && <TableCell onClick={() => handleSaveClick(row.templateId)}>{row.emailTemplate1}</TableCell>}
              {template === true && <TableCell>{row.subject}</TableCell>}
              {template === true && <TableCell>{row.stage}</TableCell>}
              {template === true && <TableCell>{row.lastModified}</TableCell>}
              {template === true && <TableCell> <Button onClick={() => openDeleteModal(row.templateId)}>
                <DeleteOutlineRoundedIcon style={{ color: 'red' }} />
              </Button></TableCell>}
              {document === true && <TableCell onClick={() => handleSaveClick(row.documentModuleId)} >{row.name}</TableCell>}
              {document === true && <TableCell>{row.createdBy}</TableCell>}
              {document === true && <TableCell>{row.createdDate}</TableCell>}
              {document === true && <TableCell>{row.description}</TableCell>}
              {document === true && <TableCell>{row.fileCount}</TableCell>}
              {document === true && <TableCell onClick={() => openDeleteModal(row.documentModuleId)}><DeleteOutlineRoundedIcon style={{ color: 'red' }} /></TableCell>}
              {documentdetail === true && <TableCell onClick={() => handleSaveClick(row.fileName)}>{row.fileName}</TableCell>}
              {documentdetail === true && <TableCell>{row.size}</TableCell>}
              {documentdetail === true && <TableCell onClick={() => openDeleteModal(row.documentFileId)}><DeleteOutlineRoundedIcon style={{ color: 'red' }} /></TableCell>}
              {candidate === true && <TableCell onClick={() => handleOpenNewPopup(row.candidateId, row.email)} >{row.fullname}</TableCell>}
              {candidate === true && <TableCell>{row.email}</TableCell>}
              {candidate === true && <TableCell>{row.mobileNo}</TableCell>}
              {candidate === true && (
                <TableCell>
                  {row.resume ? (
                    // Render download icon with a link to download the file
                    <IconButton
                      color="primary"
                      component="a"
                      href={row.resume}
                      download={row.resume}
                    >
                      <InsertDriveFileOutlinedIcon />
                    </IconButton>
                  ) : (
                    // Render hyphen if no data
                    '-'
                  )}
                </TableCell>
              )}
              {candidate === true && <TableCell>{row.fkJobName}</TableCell>}
              {candidate === true && <TableCell>{row.createdDate}</TableCell>}
              {candidate === true && <TableCell>{row.createdBy}</TableCell>}
              {candidate === true && <TableCell>{row.stagesName}</TableCell>}
              {candidate === true && <TableCell onClick={() => openDeleteModal(row.candidateId)}><DeleteOutlineRoundedIcon style={{ color: 'red' }} /></TableCell>}
              {candidate === true && <TableCell onClick={() => handleOpenJobAssignDialog(row.candidateId)}><MoreVertIcon /></TableCell>}
              {jobdetail === true && <TableCell>{row.fullname}</TableCell>}
              {jobdetail === true && <TableCell>{row.email}</TableCell>}
              {jobdetail === true && <TableCell>{row.mobileNo}</TableCell>}
              {jobdetail === true && <TableCell>
                {row.resume ? (
                  // Render download icon with a link to download the file
                  <IconButton
                    color="primary"
                    component="a"
                    href={row.resume}
                    download={row.resume}
                  >
                    <InsertDriveFileOutlinedIcon />
                  </IconButton>
                ) : (
                  // Render hyphen if no data
                  '-'
                )}
              </TableCell>}
              {jobdetail === true && <TableCell>{row.createdBy}</TableCell>}
              {jobdetail === true && <TableCell>{row.createdDate}</TableCell>}
              {jobdetail === true && <TableCell><SizeAvatars candidateId={row.candidateId} stage={row.stagesName} jobId={jobId} /></TableCell>}
              {holiday === true && <TableCell>{row.holidayName}</TableCell>}
              {holiday === true && <TableCell>{row.fromDate}</TableCell>}
              {holiday === true && <TableCell>{row.toDate}</TableCell>}
              {holiday === true && <TableCell onClick={() => openDeleteModal(row.holidayId)}><DeleteOutlineRoundedIcon style={{ color: 'red' }} /></TableCell>}
            </TableRow>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default CollapsibleTable
CollapsibleTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  handleclick: PropTypes.func.isRequired,
};
