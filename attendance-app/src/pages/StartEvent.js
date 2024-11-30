import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

function StartEvent() {
    const [eventId, setEventId] = useState(''); // State to store event ID input
    const [studentIds, setStudentIds] = useState(''); // State to store student IDs input (comma-separated)
    const [responseMessage, setResponseMessage] = useState(''); // State for API response messages
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
            console.log('Event wallet created successfully on Blockchain.');
            console.log(JSON.stringify(response.data));
            setResponseMessage(`Event started successfully`);
        } catch (error) {
            console.error('Error occurred when getting coins:', error);
        }
    }
    const handleStartEventAndGetCoin = async () => {
        await handleStartEvent();
        await get_coin(eventId);
    };

    const handleStartEvent = async () => {
        if (!eventId) {
            setResponseMessage('Event ID cannot be empty.');
            return;
        }

        if (!studentIds) {
            setResponseMessage('Student IDs cannot be empty.');
            return;
        }

        // Convert comma-separated student IDs into an array
        const studentIdArray = studentIds.split(',').map((id) => id.trim());

        try {
            // Send POST request to the backend API
            const response = await axios.post('http://localhost:3001/operator/wallets', {
                eventID: eventId,
                studentIDList: studentIdArray, // Pass student ID array
            });

            // Update the response message on success
            setResponseMessage(`Event started successfully: ${response.data.message}`);
        } catch (error) {
            console.error('Error starting event:', error);
            // Update the response message on error
            setResponseMessage('Failed to start the event. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Start Event
            </Typography>
            <TextField
                label="Event ID"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)} // Update eventId state on input change
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <TextField
                label="Student IDs (comma-separated)"
                value={studentIds}
                onChange={(e) => setStudentIds(e.target.value)} // Update studentIds state on input change
                variant="outlined"
                fullWidth
                margin="normal"
                placeholder="e.g., 123, 456, 789"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleStartEvent} // Trigger wallet creation on click
                fullWidth
                style={{ marginTop: '16px' }}
            >
                Start Event
            </Button>
            {responseMessage && (
                <Typography
                    variant="body1"
                    style={{
                        marginTop: '16px',
                        color: responseMessage.includes('successfully') ? 'green' : 'red',
                    }}
                >
                    {responseMessage}
                </Typography>
            )}
        </Container>
    );
}

export default StartEvent;