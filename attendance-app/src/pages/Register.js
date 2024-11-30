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
    console.log(JSON.stringify(response.data));
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    alert(`Error occurred when creating wallet: ${errorMessage}`);
  }
}

function Register() {
  const [studentID, setStudentID] = useState('');
  const [walletPWD, setWalletPWD] = useState('');

    async function get_coin(publicKey) {
        console.log('get_coin called with publicKey:', publicKey); // Add this line to verify the function call
        const create_body = {
            rewardAddress: publicKey,
            feeAddress: publicKey
        }
        const dest = 'http://localhost:3001/miner/mine'; // destination
        //set up header
        const create_header = {
            'Content-Type': 'application/json',
            'Accept': 'Accept: text/html',
        };
        /// Perform post
        try {
            console.log('Sending request to:', dest); // Add this line to verify the request
            const response = await axios.post(dest, create_body, {headers: create_header});
            console.log('student wallet created successfully on Blockchain.');
            console.log(JSON.stringify(response.data));
        } catch (error) {
            console.error('Error occurred when getting coins:', error);
        }
    }

  const handleRegister = async () => {
    // Implement registration logic here
    const create_body = {
      password: walletPWD,
      studentID: studentID
    }
    await create_wallet_with_address(create_body);
    await get_coin(studentID);
    alert('You have successfully created a wallet');
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
        onClick={handleRegister} // Trigger wallet creation on click
        fullWidth
      >
        Register
      </Button>
    </Container>
  );
}

export default Register;
