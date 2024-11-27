import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Register from './pages/Register';
import SubmitAttendance from './pages/SubmitAttendance';
import QueryAttendance from './pages/QueryAttendance';
import StartEvent from './pages/StartEvent';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/submit" element={<SubmitAttendance />} />
                <Route path="/query" element={<QueryAttendance />} />
                <Route path="/start-event" element={<StartEvent />} />
            </Routes>
        </Router>
    );
}

export default App;



