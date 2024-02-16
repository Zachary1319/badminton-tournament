import React, { useState } from 'react';
import axios from 'axios';
import {useLocation} from "react-router-dom";

const MatchInput = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    roundContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    matchContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    matchRow: {
      marginBottom: '10px',
    },
    select: {
      marginRight: '5px',
      marginLeft: '5px',
    },
    input: {
      marginRight: '5px',
    },
    submit: {
      margin: '10px',
      height: '40px',
      fontSize: '15px',
    },
    resultContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '30px',
    },
    resultDetailContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '80vw',
    },
    rulesContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '60vw',
    }
  };

  const location = useLocation();
  const playerNames = location.state?.playerNames || [];
  const [isResultsIncomplete, setIsResultsIncomplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialRoundState = () => new Array(playerNames.length / 2).fill(null).map(() => ({
    player1: '',
    player2: '',
    score1: '',
    score2: ''
  }));



  const [resultsData, setResultsData] = useState({
    scores: {},
    rankings: [],
    pairings: []
  });


  const [matchResults, setMatchResults] = useState({
    round1: initialRoundState(),
    round2: initialRoundState()
  });

  const handleMatchChange = (round, index, field, value) => {
    setMatchResults(prevResults => {
      const newResults = { ...prevResults };
      if (!Array.isArray(newResults[round])) {
        newResults[round] = initialRoundState();
      }
      const newRoundResults = [...newResults[round]];
      newRoundResults[index] = { ...newRoundResults[index], [field]: value };
      newResults[round] = newRoundResults;
      return newResults;
    });
  };



  const renderMatchRow = (round, index) => (
    <div key={`${round}-${index}`} style={styles.matchRow}>
      <select style={styles.select} onChange={(e) => handleMatchChange(round, index, 'player1', e.target.value)}>
        <option value="">Select Player</option>
        {playerNames.map((name, i) => (
          <option key={i} value={name}>{name}</option>
        ))}
      </select>
      <input type="number" placeholder="Score" style={styles.input} onChange={(e) => handleMatchChange(round, index, 'score1', e.target.value)} />
      <span>vs</span>
      <select style={styles.select} onChange={(e) => handleMatchChange(round, index, 'player2', e.target.value)}>
        <option value="">Select Player</option>
        {playerNames.map((name, i) => (
          <option key={i} value={name}>{name}</option>
        ))}
      </select>
      <input type="number" placeholder="Score" style={styles.input} onChange={(e) => handleMatchChange(round, index, 'score2', e.target.value)} />
    </div>
  );

  const renderMatchInput = (round) => {
    const matchCount = playerNames.length / 2;
    const matches = [];

    for (let i = 0; i < matchCount; i++) {
      matches.push(renderMatchRow(round, i));
    }

    return <div style={styles.matchContainer}>{matches}</div>;
  };

  const postMatchResults = async () => {
    try {
      const response = await axios.post('http://localhost:3000/tournaments', matchResults);
      const tournamentId = response.data.data.tournamentId;
      await fetchRankings(tournamentId);
      await fetchPairings(tournamentId);
    } catch (error) {
      console.error('Error posting match results', error);
      setErrorMessage(error.response.data.message || "Error occurred while posting match results");
      throw error;
    }
  };

  const fetchRankings = async (tournamentId) => {
    try {
      const response = await axios.get(`http://localhost:3000/tournaments/${tournamentId}/rankings`);
      setResultsData(prevData => ({ ...prevData, scores: response.data.data.scores, rankings: response.data.data.rankings }));
    } catch (error) {
      console.error('Error fetching rankings', error);
      setErrorMessage(error.response.data.message || "Error occurred while fetching rankings");
    }
  };

  const fetchPairings = async (tournamentId) => {
    try {
      const response = await axios.get(`http://localhost:3000/tournaments/${tournamentId}/pairings`);
      setResultsData(prevData => ({ ...prevData, pairings: response.data.data.pairings }));
    } catch (error) {
      console.error('Error fetching pairings', error);
      setErrorMessage(error.response.data.message || "Error occurred while fetching pairings");
    }
  };

  const handleSubmit = async () => {
    setResultsData({ scores: {}, rankings: [], pairings: [] });
    setErrorMessage("");

    const allResultsFilled = Object.values(matchResults).every(round =>
      round.every(match => match.player1 && match.player2 && match.score1 && match.score2)
    );

    setIsResultsIncomplete(!allResultsFilled);
    if (allResultsFilled) {
      await postMatchResults();
    }
  };

  const DisplayResults = () => {
    const renderRankings = () => (
      <ul>
        {resultsData.rankings && resultsData.rankings.map((player, index) => (
          <li key={index}>
            {`${index + 1}. ${player}: Wins - ${resultsData.scores[player].primaryPoints}, Score Difference - ${resultsData.scores[player].secondaryPoints}`}
          </li>
        ))}
      </ul>
    );

    return (
      <div style={styles.resultContainer}>
        <h3>Match Results</h3>
        <div style={styles.resultDetailContainer}>
          <div>
            <h4>Rankings:</h4>
            {renderRankings()}
          </div>
          <div>
            <h4>Next Round Pairings:</h4>
            <ul>
              {resultsData.pairings && resultsData.pairings.map((pair, index) => (
                <li key={index}>{pair.join(' vs ')}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div style={styles.container}>
      <div style={styles.roundContainer}>
        <div>
          <h3>Round 1</h3>
          {renderMatchInput("round1")}
        </div>
        <div>
          <h3>Round 2</h3>
          {renderMatchInput("round2")}
        </div>
      </div>
      {isResultsIncomplete && <p style={{ color: 'red' }}>Please fill in all match results.</p>}
      <button onClick={handleSubmit} style={styles.submit}>Submit</button>
      <DisplayResults />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div style={styles.rulesContainer}>
        <h3>Rules Explanation</h3>
        <p><strong>Ranking Rules:</strong> Players are ranked based on the total number of wins (primary points). In case of a tie, the score difference (secondary points) is used as a tiebreaker.</p>
        <p><strong>Pairing Rules:</strong> For the next round, players are paired ensuring that the score difference is no more than 10 points and they have not previously faced each other in the tournament.</p>
      </div>
    </div>
  );
};

export default MatchInput;