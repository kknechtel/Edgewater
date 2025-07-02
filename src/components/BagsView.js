import React, { useState } from 'react';
import { getMobileOptimizedStyles } from '../utils/mobileStyles';

const BagsView = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [winner, setWinner] = useState(null);
  const [round, setRound] = useState(1);
  const [currentThrower, setCurrentThrower] = useState('team1');

  const mobileStyles = getMobileOptimizedStyles();

  // Win condition - first to 21
  const TARGET_SCORE = 21;

  const addPoints = (team, points) => {
    if (winner) return;

    if (team === 'team1') {
      const newScore = team1Score + points;
      setTeam1Score(newScore);
      if (newScore >= TARGET_SCORE) {
        setWinner(team1Name);
      }
    } else {
      const newScore = team2Score + points;
      setTeam2Score(newScore);
      if (newScore >= TARGET_SCORE) {
        setWinner(team2Name);
      }
    }

    // Switch thrower after each turn
    setCurrentThrower(currentThrower === 'team1' ? 'team2' : 'team1');
    
    // Increment round every 2 turns
    if (currentThrower === 'team2') {
      setRound(round + 1);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setTeam1Score(0);
    setTeam2Score(0);
    setWinner(null);
    setRound(1);
    setCurrentThrower('team1');
  };

  const startGame = () => {
    if (!team1Name.trim() || !team2Name.trim()) {
      alert('Please enter team names!');
      return;
    }
    setGameStarted(true);
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f0f9ff',
    padding: mobileStyles.spacing.md,
    paddingBottom: '6rem'
  };

  const cardStyle = {
    ...mobileStyles.card,
    marginBottom: mobileStyles.spacing.lg,
    textAlign: 'center'
  };

  const bigButtonStyle = {
    width: '100%',
    minHeight: '80px',
    backgroundColor: '#0891b2',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.5rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: mobileStyles.spacing.md,
    boxShadow: '0 4px 16px rgba(8, 145, 178, 0.3)',
    transition: 'all 0.2s'
  };

  const scoreButtonStyle = {
    width: '48%',
    minHeight: '80px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    margin: '1%',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s'
  };

  const holeButtonStyle = {
    ...scoreButtonStyle,
    backgroundColor: '#f59e0b',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
  };

  if (!gameStarted) {
    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={cardStyle}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: mobileStyles.spacing.md
          }}>
            🎯 Bags Game
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: mobileStyles.spacing.lg
          }}>
            First to 21 wins!
          </p>
        </div>

        {/* Team Setup */}
        <div style={cardStyle}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#111827'
          }}>
            Set Up Teams
          </h2>
          
          <div style={{ marginBottom: mobileStyles.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              🔴 Team 1 Name
            </label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              style={{
                width: '100%',
                minHeight: '60px',
                padding: mobileStyles.spacing.md,
                fontSize: '1.125rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxSizing: 'border-box',
                textAlign: 'center',
                fontWeight: '600'
              }}
              placeholder="Enter team 1 name"
            />
          </div>

          <div style={{ marginBottom: mobileStyles.spacing.xl }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              🔵 Team 2 Name
            </label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              style={{
                width: '100%',
                minHeight: '60px',
                padding: mobileStyles.spacing.md,
                fontSize: '1.125rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxSizing: 'border-box',
                textAlign: 'center',
                fontWeight: '600'
              }}
              placeholder="Enter team 2 name"
            />
          </div>

          <button
            onClick={startGame}
            style={bigButtonStyle}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🚀 Start Game!
          </button>
        </div>

        {/* Quick Rules */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.md,
            color: '#111827'
          }}>
            📖 Quick Rules
          </h3>
          <div style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>In the hole:</strong> 3 points</p>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>On the board:</strong> 1 point</p>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>First to 21 wins!</strong></p>
            <p>• Teams take turns throwing bags</p>
          </div>
        </div>
      </div>
    );
  }

  if (winner) {
    return (
      <div style={containerStyle}>
        <div style={{
          ...cardStyle,
          backgroundColor: '#dcfce7',
          border: '3px solid #16a34a'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: mobileStyles.spacing.md }}>🏆</div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#15803d',
            marginBottom: mobileStyles.spacing.md
          }}>
            {winner} Wins!
          </h1>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#374151'
          }}>
            Final Score: {team1Score} - {team2Score}
          </div>
          <button
            onClick={resetGame}
            style={bigButtonStyle}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Game Status */}
      <div style={cardStyle}>
        <div style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#6b7280',
          marginBottom: mobileStyles.spacing.sm
        }}>
          Round {round} • {currentThrower === 'team1' ? team1Name : team2Name}'s Turn
        </div>
        
        {/* Scoreboard */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: mobileStyles.spacing.lg
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '0.25rem'
            }}>
              🔴 {team1Name}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#111827'
            }}>
              {team1Score}
            </div>
          </div>
          
          <div style={{
            fontSize: '2rem',
            color: '#6b7280',
            margin: '0 1rem'
          }}>
            VS
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#2563eb',
              marginBottom: '0.25rem'
            }}>
              🔵 {team2Name}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#111827'
            }}>
              {team2Score}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          First to {TARGET_SCORE} wins!
        </div>
      </div>

      {/* Current Thrower Highlight */}
      <div style={{
        ...cardStyle,
        backgroundColor: currentThrower === 'team1' ? '#fef2f2' : '#eff6ff',
        border: `3px solid ${currentThrower === 'team1' ? '#dc2626' : '#2563eb'}`
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: currentThrower === 'team1' ? '#dc2626' : '#2563eb',
          marginBottom: mobileStyles.spacing.lg
        }}>
          {currentThrower === 'team1' ? `🔴 ${team1Name}` : `🔵 ${team2Name}`}'s Turn
        </h2>
        
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          marginBottom: mobileStyles.spacing.lg
        }}>
          How did they score?
        </p>
        
        {/* Scoring Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: mobileStyles.spacing.md }}>
          <button
            onClick={() => addPoints(currentThrower, 1)}
            style={scoreButtonStyle}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📌 On Board<br />+1 Point
          </button>
          <button
            onClick={() => addPoints(currentThrower, 3)}
            style={holeButtonStyle}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🎯 In Hole<br />+3 Points
          </button>
        </div>

        <button
          onClick={() => {
            // Skip turn (no points)
            setCurrentThrower(currentThrower === 'team1' ? 'team2' : 'team1');
            if (currentThrower === 'team2') {
              setRound(round + 1);
            }
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ❌ Miss (Skip Turn)
        </button>
      </div>

      {/* Game Controls */}
      <div style={cardStyle}>
        <button
          onClick={resetGame}
          style={{
            width: '100%',
            minHeight: '60px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
};

export default BagsView;