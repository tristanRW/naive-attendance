// src/pages/SubmitAttendance.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import axios from 'axios';
// POST create_transaction 
async function create_transaction(create_body,wallet_id,password){
  const dest = `/operator/wallets/${wallet_id}/transactions`; // destination 
  //set up header
  const create_header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'password': password
  };
  //perform post
  axios.post(dest, create_body, { headers: create_header }) 
    .then(response => {
      alert('You have successfully create a transaction, attendance will be taken');
      console.log(JSON.stringify(response.data))
    })
    .catch(error => {

      console.error('Error occured when createing transaction:',error);
    });
}
//fetch wallet address by wallet
async function GetWalletAddress(wallet_id) {
  const dest = `/operator/wallets/${wallet_id}`;
  try {
    const response = await axios.get(dest);
    return response.data.addresses[0];
  } catch (error) {
    alert('Error fetching wallet address:', error);
    return null;
  }
}
//get some coins
async function get_coin(create_body){
  const dest = '/miner/mine'; // destination 
  //set up header
  const create_header = {
    'Content-Type': 'application/json',
    'Accept': 'Accept: text/html',

  };
  //perform post
  axios.post(dest, create_body, { headers: create_header }) 
    .then(response => {
      alert('You have successfully get some coins:');
      console.log(JSON.stringify(response.data))
    })
    .catch(error => {
      console.error('Error occured when getting coins:',error);
    });
}
function SubmitAttendance() {
  //get input 
  const [SID, setSID] = useState('');
  const [WalletPWD, setWalletPWD] = useState('');
  const [eventID, setEventID] = useState('');
  const [getcoin, setGetcoin] = useState('');
  //find the targeted address. return when no wallet is found
  const handleSubmit = async () => {
    const fromAddress = await GetWalletAddress(SID);
    if (!fromAddress) {
      console.error('Failed to fetch wallet address');
      alert('Unable to fetch wallet address. Please try again later.');
      return;
    }

    //create POST method body
    const create_body = {
      fromAddress: fromAddress,
      toAddress: eventID,
      amount: 1,
      studentId: SID,
      eventId: eventID,
      changeAddress: fromAddress,
      type: "regular"
    };

    //create the transaction
    create_transaction(create_body,SID,WalletPWD)
  };

  
  const submitSID = async () => {
    const fromAddress = await GetWalletAddress(getcoin);
    if (!fromAddress) {
      console.error('Failed to fetch wallet address');
      alert('Unable to fetch wallet address. Please try again later.');
      return;
    }
    const create_body = {
      rewardAddress: fromAddress,
      feeAddress: fromAddress
    }
    get_coin(create_body);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Submit Attendance
      </Typography>
      <TextField
        label="Student ID"
        value={SID}
        onChange={(e) => setSID(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />     
      <TextField
        label="Wallet Password"
        value={WalletPWD}
        onChange={(e) => setWalletPWD(e.target.value)}
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
      >
        Submit
      </Button>
      <TextField
        label="Student ID for getting coin"
        value={getcoin}
        onChange={(e) => setGetcoin(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={submitSID}
        fullWidth
      >
        Get some coins
      </Button>
    </Container>
  );
}

export default SubmitAttendance;
