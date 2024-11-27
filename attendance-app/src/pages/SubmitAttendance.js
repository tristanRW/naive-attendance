// src/pages/SubmitAttendance.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import axios from 'axios';

// POST create_transaction 
async function create_transaction(create_body, wallet_id, password) {
  const dest = `/operator/wallets/${wallet_id}/transactions`; // destination 
  const create_header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'password': password
  };

  try {
    const response = await axios.post(dest, create_body, { headers: create_header });
    alert('You have successfully created a transaction, attendance will be taken:');
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error occurred when creating transaction:', error);
  }
}

// Fetch wallet address by wallet
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

// Get some coins
async function get_coin(create_body) {
  const dest = '/miner/mine'; // destination 
  const create_header = {
    'Content-Type': 'application/json',
    'Accept': 'text/html',
  };

  try {
    const response = await axios.post(dest, create_body, { headers: create_header });
    alert('You have successfully got some coins:');
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error occurred when getting coins:', error);
  }
}

function SubmitAttendance() {
  const [SID, setSID] = useState('');
  const [WalletPWD, setWalletPWD] = useState('');
  const [eventID, setEventID] = useState('');

  const handleSubmit = async () => {
    const fromAddress = await GetWalletAddress(SID);
    const toAddress = await GetWalletAddress(eventID);

    if (!fromAddress || !toAddress) {
      alert('Unable to fetch wallet address. Please try again later.');
      return;
    }

    const create_body_mine = {
      rewardAddress: fromAddress,
      feeAddress: fromAddress
    };

    // Wait for get_coin to finish
    await get_coin(create_body_mine);

    const create_body = {
      fromAddress: fromAddress,
      toAddress: eventID,
      amount: 1,
      studentId: SID,
      eventId: eventID,
      changeAddress: fromAddress,
      type: "regular"
    };

    // Wait for create_transaction to finish
    await create_transaction(create_body, SID, WalletPWD);
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
    </Container>
  );
}

export default SubmitAttendance;