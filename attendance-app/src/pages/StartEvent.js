import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

function StartEvent() {
    const [eventId, setEventId] = useState(''); // State to store event ID input
    const [studentIds, setStudentIds] = useState(''); // State to store student IDs input (comma-separated)
    const [responseMessage, setResponseMessage] = useState(''); // State for API response messages

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
                eventId,
                studentIds: studentIdArray, // Pass student ID array
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