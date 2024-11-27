// src/pages/QueryAttendance.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import axios from 'axios';

const attendancelist = [];

async function getAllBlock() {
  const dest = `/blockchain/blocks`;
  try {
    const response = await axios.get(dest);
    //return response.data.addresses[0];
    return response.data;
  } catch (error) {
    alert('Error fetching all block:', error);
    return null;
  }
}


function query_studentId(studentId, startTime = 0, endTime = 0) {  //query about a specific student's attendance
  const jsonObject = getAllBlock();
  console.log("query record with studentID");


  for (let i = 0; i < jsonObject.length; i++) {
      //console.log(jsonObject[i].transactions[0].data.inputs[0].address);
      //console.log(jsonObject.length);
      for (let j=0; j < jsonObject[i].transactions.length; j++) {
          //console.log(jsonObject[i].transactions[j]);
          for (let k=0; k < jsonObject[i].transactions[j].data.inputs.length; k++) {

              //console.log(jsonObject[i].transactions[j].data.inputs);
              //console.log(jsonObject[i].transactions[j].data.inputs[k].signature);
              
      // get information
      let message_studentId = jsonObject[i].transactions[j].data.inputs[k].studentId
      let message_eventId = jsonObject[i].transactions[j].data.inputs[k].eventId
      let message_timestamp = jsonObject[i].transactions[j].data.inputs[k].timestamp

              console.log(message_studentId);
              console.log(message_eventId);
              console.log(message_timestamp);    
              //console.log(1);  
      
              if (message_studentId === null || message_eventId === null || message_timestamp === null) {
                  break;
              }

              if (message_studentId == studentId) { // match the studentID

                  console.log(message_studentId);
                  console.log(message_eventId);
                  console.log(message_timestamp);

                  if (startTime !== 0 && endTime !== 0) {  // have time range
                      if (message_timestamp >= startTime && message_timestamp <= endTime) {
                          console.log("have time range");   
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime !== 0 && endTime === 0) {   // accept record after startTime
                      if (message_timestamp >= startTime) {
                          console.log("only have startTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime === 0 && endTime !== 0) {  // accept record before endTime
                      if (message_timestamp <= endTime) {
                          console.log("only have endTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime === 0 && endTime === 0) {   // no time parameter input
                      console.log("not time limitation"); 
                      attendancelist.push({
                          "studentID": message_studentId,
                          "eventID": message_eventId,
                          "timestamp": message_timestamp
                      });
                  }else {
                      console.log("Error: startTime and endTime have problem");
                  }

      
              }
          }
      }            
  }

  // then, pass attendancelist[] to the web application (front end)
  printAttendance();
}

function query_eventId(eventId, startTime = 0, endTime = 0) {  //query about class attendance
  //const jsonObject = JSON.parse(all_block_info);
  
  console.log("query record with eventID");
  const jsonObject = getAllBlock();

  for (let i = 0; i < jsonObject.length; i++) {
      //console.log(jsonObject[i].transactions[0].data.inputs[0].address);
      //console.log(jsonObject.length);
      for (let j=0; j < jsonObject[i].transactions.length; j++) {
          //console.log(jsonObject[i].transactions[j]);
          for (let k=0; k < jsonObject[i].transactions[j].data.inputs.length; k++) {

              //console.log(jsonObject[i].transactions[j].data.inputs);
              //console.log(jsonObject[i].transactions[j].data.inputs[k].signature);
      // get information
      let message_studentId = jsonObject[i].transactions[j].data.inputs[k].studentId
      let message_eventId = jsonObject[i].transactions[j].data.inputs[k].eventId
      let message_timestamp = jsonObject[i].transactions[j].data.inputs[k].timestamp

              console.log(message_studentId);
              console.log(message_eventId);
              console.log(message_timestamp);    
              //console.log(1);
              
              
      
              if (message_studentId === null || message_eventId === null || message_timestamp === null) {
                  break;
              }

              if (message_eventId == eventId) { // match the studentID
                  
                  console.log(message_studentId);
                  console.log(message_eventId);
                  console.log(message_timestamp);  

                  if (startTime !== 0 && endTime !== 0) {  // have time range
                      if (message_timestamp >= startTime && message_timestamp <= endTime) {
                          console.log("have time range"); 
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime !== 0 && endTime === 0) {   // accept record after startTime
                      if (message_timestamp >= startTime) {
                          console.log("only have startTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime === 0 && endTime !== 0) {  // accept record before endTime
                      if (message_timestamp <= endTime) {
                          console.log("only have endTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime === 0 && endTime === 0) {   // no time parameter input
                      console.log("not time limitation"); 
                      attendancelist.push({
                          "studentID": message_studentId,
                          "eventID": message_eventId,
                          "timestamp": message_timestamp
                      });
                  }else {
                      console.log("Error: startTime and endTime have problem");
                  }

                  attendancelist.push({
                      "studentID": message_studentId,
                      "eventID": message_eventId,
                      "timestamp": message_timestamp
                  });

              }
          }
      }            
  }

  // then, pass attendancelist[] to the web application (front end)
  printAttendance();
}

function printAttendance(){
  if (attendancelist.length !== 0){
      console.log("start of attendance list:");
      for (let i = 0; i < attendancelist.length; i++){
          console.log(attendancelist[i]);
      }
      console.log("end of attendance list");
  }
}


function QueryAttendance() {
  const [studentID, setStudentID] = useState('');
  const [eventID, setEventID] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleQuery = async () => {
    if (startTime === null) {
      startTime = undefined;
    } 
    if (endTime === null) {
      endTime = undefined;
    } 
    if (studentID === null && eventID === null) {
      startTime = undefined;
      endTime = undefined;
    }


    if (studentID) {
      handleQuery1_studentId();
    } else if (eventID) {
      handleQuery2_eventId();
    } else {
      alert('Please input student ID or event ID');
    }

  };

  const handleQuery1_studentId = async () => {

    try {
      const response = await query_studentId(studentID, startTime, endTime);
      //setAttendanceRecords(response.data);
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } 
  };

  const handleQuery2_eventId = async () => {
    try {
      const response = await query_eventId(eventID, startTime, endTime);
      //setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } 
  };


  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Query Attendance Records
      </Typography>
      <TextField
        label="Student ID"
        value={studentID}
        onChange={(e) => setStudentID(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />

      <TextField
        label="Event ID"
        value={eventID}
        onChange={(e) => setEventID(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
     

      <TextField
        label="Start Time [optional]"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
      }}
      />
      <TextField
        label="End Time [optional]"
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />


      <Button
        variant="contained"
        color="primary"
        onClick={handleQuery}
        fullWidth
        style={{ marginTop: '16px' }}
      >
        Search
      </Button>

      {attendancelist.length > 0 && (
  <TableContainer component={Paper} style={{ marginTop: '32px' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Student ID</TableCell>
          <TableCell>Event ID</TableCell>
          <TableCell>Timestamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {attendancelist.map((record, index) => (
          <TableRow key={index}>
            <TableCell>{record.studentID}</TableCell>
            <TableCell>{record.eventID}</TableCell>
            <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}
    </Container>
  );
}

export default QueryAttendance;
