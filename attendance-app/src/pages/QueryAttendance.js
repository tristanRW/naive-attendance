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
import { set } from 'ramda';

let attendancelist = [];


async function setTime(startTime, endTime) {  
  if (startTime == '') {
    startTime = '0';
    return startTime, endTime;
    //startTime = 0;
  } 
  if (endTime == '') {
    endTime = '0';
    return startTime, endTime;
    //endTime = 0;
  } 
  if (startTime == '' && endTime == '') {
    endTime = '0';
    startTime = '0';
    return startTime, endTime;
    //startTime = 0;
    //endTime = 0;
  }

} 

async function getAllBlock() {
  const dest = `/blockchain/blocks`;
  try {
    const response = await axios.get(dest);
    //return response.data.addresses[0];
    console.log(response);
    //alert('You have sccuessfully get all block:');
    return response.data;
  } catch (error) {
    alert('Error fetching all block:', error);
    return null;
  }
}


async function query_studentId(studentId, startTime, endTime) {  //query about a specific student's attendance
  

  const jsonObject = await getAllBlock();

  console.log(studentId, startTime = 0, endTime = 0);

  //[startTime, endTime] = await setTime(startTime, endTime);

  console.log("query record with studentID12");
  console.log(jsonObject.length);  
  console.log(634451);
  console.log(startTime);
  console.log(endTime);


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
              console.log(1111);  
      
              if (message_studentId === null || message_eventId === null || message_timestamp === null) {
                  break;
              }

              let sameData = false;
              for (let k=0; k < attendancelist.length; k++) {
                if (attendancelist[k].studentID == message_studentId && attendancelist[k].eventID == message_eventId && attendancelist[k].timestamp == message_timestamp) {
                  sameData = true;
                  break;
                }
              } 

              if (sameData) {
                console.log("sameData found, breaking out of the loop");
                break;
              }             

              console.log(message_studentId);
              console.log(7);

              console.log(studentId);

              if (message_studentId == studentId) { // match the studentID


                  console.log(startTime);
                  console.log(endTime);
                  console.log(7778);

                  if (startTime != '' && endTime != '') {  // have time range
                      if (message_timestamp >= startTime && message_timestamp <= endTime) {
                          console.log("have time range");   
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime != '' && endTime == '') {   // accept record after startTime
                      if (message_timestamp >= startTime) {
                          console.log("only have startTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime == '' && endTime != '') {  // accept record before endTime
                      if (message_timestamp <= endTime) {
                          console.log("only have endTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime == '' && endTime == '') {   // no time parameter input
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
  console.log("query record with studentID2");
  printAttendance();
  console.log(attendancelist.length);
}



async function query_eventId(eventId, startTime = 0, endTime = 0) {  //query about class attendance
  //const jsonObject = JSON.parse(all_block_info);
  
  console.log("query record with eventID");
  const jsonObject = await getAllBlock();

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



                  if (startTime != '' && endTime != '') {  // have time range
                      if (message_timestamp >= startTime && message_timestamp <= endTime) {
                          console.log("have time range"); 
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime != '' && endTime == '') {   // accept record after startTime
                      if (message_timestamp >= startTime) {
                          console.log("only have startTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime == '' && endTime != '') {  // accept record before endTime
                      if (message_timestamp <= endTime) {
                          console.log("only have endTime");  
                          attendancelist.push({
                              "studentID": message_studentId,
                              "eventID": message_eventId,
                              "timestamp": message_timestamp
                          });
                      }
                  }else if (startTime == '' && endTime == '') {   // no time parameter input
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




function printAttendance(){
  if (attendancelist.length !== 0){
      console.log("start of attendance list:");
      for (let i = 0; i < attendancelist.length; i++){
          console.log(attendancelist[i]);
          console.log(attendancelist[i].studentID);

      }
      console.log("end of attendance list");
  }
  console.log("88");
  console.log(attendancelist);

}


function QueryAttendance() {
  const [studentID, setStudentID] = useState('');
  const [eventID, setEventID] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');





  const handleQuery = async () => {
    console.log(963258441);
    console.log(startTime);
    console.log(endTime);

    //console.log(studentID);
    console.log(startTime);
    console.log(endTime);

    //clear old data
    setAttendanceRecords([]); 
    attendancelist = []; 

    if (studentID != null) {
      try {
        console.log(studentID);
        console.log(startTime);
        console.log(endTime);

        const response = await query_studentId(studentID, startTime, endTime);
        //setAttendanceRecords(response.data);

        
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } 
      console.log(studentID);
      console.log(eventID);
      console.log(1);

    } else if (eventID != null) {
      try {
        const response = await query_eventId(eventID, startTime, endTime);
        //setAttendanceRecords(response.data);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } 

    } else {
      alert('Please input student ID or event ID');
    }




    console.log(2);
    console.log(attendancelist);
    console.log(3);
    console.log(attendancelist);

    setAttendanceRecords(attendancelist);
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
        disabled={!!eventID}
      />

      <TextField
        label="Event ID"
        value={eventID}
        onChange={(e) => setEventID(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        disabled={!!studentID}
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
        disabled={!studentID && !eventID}
      >
        Search
      </Button>

      {attendanceRecords.length > 0 && (
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
        {attendanceRecords.map((record, index) => (
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
