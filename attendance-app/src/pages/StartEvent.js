import React, {useState} from 'react';
import axios from 'axios';
import {Container, TextField, Button, Typography} from '@mui/material';


function StartEvent() {
    const [eventId, setEventId] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

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
        try {
            const response = await axios.post('http://localhost:3001/operator/wallets', {
                eventId: eventId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setResponseMessage(`Creating wallet for event '${eventId}'`);
        } catch (error) {
            console.error('Error starting event:', error);
            if (error.response && error.response.data && error.response.data.error === `Wallet for event '${eventId}' already exists`) {
                setResponseMessage("Wallet for this event already exists.");
            } else {
                setResponseMessage('Failed to start the event. Please try again.');
            }
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
                onChange={(e) => setEventId(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleStartEventAndGetCoin}
                fullWidth
                style={{marginTop: '16px'}}
            >
                Start Event
            </Button>
            {responseMessage && (
                <Typography
                    variant="body1"
                    style={{marginTop: '16px', color: responseMessage.includes('successfully') ? 'green' : 'red'}}
                >
                    {responseMessage}
                </Typography>
            )}
        </Container>
    );
}

export default StartEvent;