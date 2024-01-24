import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const PlayerInput = () => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState([]);
  const [isEvenError, setIsEvenError] = useState(false);
  const [isNameMissing, setIsNameMissing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const count = parseInt(playerCount, 10);
    if (!isNaN(count) && count > 0) {
      setPlayerNames(new Array(count).fill(''));
    } else {
      setPlayerNames([]);
    }
  }, [playerCount]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const allNamesFilled = playerNames.length === parseInt(playerCount, 10) &&
      playerNames.every(name => name.trim() !== '');
    setIsNameMissing(!allNamesFilled);
    if (allNamesFilled) {
      navigate('/match-input', { state: { playerNames } });
    }
  };

  const handlePlayerCountChange = (e) => {
    const value = e.target.value;
    const count = parseInt(value, 10);

    if (!isNaN(count) && count > 0) {
      setPlayerCount(value);
      setIsEvenError(count % 2 !== 0);
    } else {
      setPlayerCount('');
      setIsEvenError(false);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const styles = {
    form: {
      marginTop: '20px',
    },
    input: {
      margin: '10px',
      height: '30px',
      fontSize: '20px',
    },
    hint: {
      color: 'red',
      fontSize: '15px',
      marginTop: '0px',
    },
    submit: {
      margin: '10px',
      height: '40px',
      fontSize: '15px',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    playerInputContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      maxWidth: '900px',
    },
    playerInput: {
      margin: '5px',
      height: '30px',
      fontSize: '20px',
      width: '200px',
      animation: 'fadeIn 0.5s forwards',
    },
  };

  return (
    <div style={styles.formContainer}>
    <form style={styles.form} onSubmit={handleSubmit}>
      <label>
        Enter number of players:
        <input
          type="number"
          value={playerCount}
          onChange={handlePlayerCountChange}
          min="2"
          style={styles.input}
        />
      </label>
    </form>
      {isEvenError && <p style={styles.hint}>Please enter a positive even number.</p>}
      <p>Please enter players' names:</p>
      <div style={styles.playerInputContainer}>
        {!isEvenError && playerNames.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
            style={styles.playerInput}
          />
        ))}
      </div>
      {isNameMissing && <p style={{ color: 'red' }}>Please fill in all player names.</p>}
      <button type="submit" style={styles.submit} onClick={handleSubmit}>Submit</button>
      </div>
  );
};

export default PlayerInput;

