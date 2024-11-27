// src/pages/Register.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import axios from 'axios';

// POST create_transaction 
async function create_wallet_with_address(create_body) {
  const dest = `/operator/wallets`; // Use relative URL
  const create_header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  try {
    const response = await axios.post(dest, create_body, { headers: create_header });
    alert('You have successfully created a wallet');
    console.log(JSON.stringify(response.data));
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    alert(`Error occurred when creating wallet: ${errorMessage}`);
  }
}

function Register() {
  const [studentID, setStudentID] = useState('');
  const [walletPWD, setWalletPWD] = useState('');
  const handleRegister = async () => {
    // Implement registration logic here
    const create_body = {
      password: walletPWD,
      studentId: studentID
    }
    create_wallet_with_address(create_body);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Student Registration
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
        label="Wallet Password"
        value={walletPWD}
        onChange={(e) => setWalletPWD(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleRegister}
        fullWidth
      >
        Register
      </Button>
    </Container>
  );
}

export default Register;
