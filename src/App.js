import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlayerInput from './pages/PlayerInput';
import MatchInput from './pages/MatchInput';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerInput />} />
        <Route path="/match-input" element={<MatchInput />} />
      </Routes>
    </Router>
  );
}

export default App;
