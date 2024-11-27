import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Header() {
  return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Attendance Blockchain App
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Register
          </Button>
          <Button color="inherit" component={Link} to="/submit">
            Submit Attendance
          </Button>
          <Button color="inherit" component={Link} to="/query">
            Query Attendance
          </Button>
          <Button color="inherit" component={Link} to="/start-event">
            Start Event
          </Button>
        </Toolbar>
      </AppBar>
  );
}

export default Header;

