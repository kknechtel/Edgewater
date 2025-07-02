import React, { useState } from 'react';
import { getMobileOptimizedStyles } from '../utils/mobileStyles';

const BagsView = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState({
    player1: '',
    player2: '',
    player3: '',
    player4: ''
  });
  const [teams, setTeams] = useState({
    team1: { players: [], score: 0 },
    team2: { players: [], score: 0 }
  });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0-3 for players 1-4
  const [currentBag, setCurrentBag] = useState(1); // 1-5 for bags per round
  const [roundScores, setRoundScores] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const mobileStyles = getMobileOptimizedStyles();
  const TARGET_SCORE = 21;

  const setupTeams = () => {
    if (!players.player1 || !players.player2 || !players.player3 || !players.player4) {
      alert('Please enter all 4 player names!');
      return;
    }

    const newTeams = {
      team1: {
        players: [players.player1, players.player2],
        score: 0
      },
      team2: {
        players: [players.player3, players.player4],
        score: 0
      }
    };

    setTeams(newTeams);
    setGameStarted(true);
    setCurrentPlayer(0);
    setCurrentBag(1);
    setCurrentRound(1);
    setRoundScores([]);
    setWinner(null);
  };

  const recordBag = (points) => {
    if (winner) return;

    const playerTeam = currentPlayer < 2 ? 'team1' : 'team2';
    const playerName = currentPlayer === 0 ? players.player1 : 
                      currentPlayer === 1 ? players.player2 :
                      currentPlayer === 2 ? players.player3 : players.player4;

    // Record this bag
    const bagRecord = {
      round: currentRound,
      player: playerName,
      team: playerTeam,
      bag: currentBag,
      points: points,
      timestamp: new Date()
    };

    const newGameHistory = [...gameHistory, bagRecord];
    setGameHistory(newGameHistory);

    // Update team scores
    const newTeams = { ...teams };
    newTeams[playerTeam].score += points;

    // Check for winner
    if (newTeams[playerTeam].score >= TARGET_SCORE) {
      setWinner(playerTeam);
      setTeams(newTeams);
      return;
    }

    setTeams(newTeams);

    // Move to next bag or next player
    if (currentBag < 5) {
      setCurrentBag(currentBag + 1);
    } else {
      // Move to next player, reset bag count
      if (currentPlayer < 3) {
        setCurrentPlayer(currentPlayer + 1);
        setCurrentBag(1);
      } else {
        // Round complete, move to next round
        setCurrentPlayer(0);
        setCurrentBag(1);
        setCurrentRound(currentRound + 1);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers({
      player1: '',
      player2: '',
      player3: '',
      player4: ''
    });
    setTeams({
      team1: { players: [], score: 0 },
      team2: { players: [], score: 0 }
    });
    setCurrentRound(1);
    setCurrentPlayer(0);
    setCurrentBag(1);
    setRoundScores([]);
    setWinner(null);
    setGameHistory([]);
  };

  const getCurrentPlayerName = () => {
    switch(currentPlayer) {
      case 0: return players.player1;
      case 1: return players.player2;
      case 2: return players.player3;
      case 3: return players.player4;
      default: return '';
    }
  };

  const getCurrentTeam = () => {
    return currentPlayer < 2 ? 'team1' : 'team2';
  };

  const getTeamColor = (team) => {
    return team === 'team1' ? '#dc2626' : '#2563eb';
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
    width: 'calc(50% - 0.5rem)',
    minHeight: '80px',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    margin: '0.25rem',
    transition: 'all 0.2s'
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
            First team to 21 wins! Enter 4 players (2 per team).
          </p>
        </div>

        {/* Player Setup */}
        <div style={cardStyle}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#dc2626'
          }}>
            🔴 Team 1
          </h2>
          
          <div style={{ marginBottom: mobileStyles.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              Player 1
            </label>
            <input
              type="text"
              value={players.player1}
              onChange={(e) => setPlayers({ ...players, player1: e.target.value })}
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
              placeholder="Enter player 1 name"
            />
          </div>

          <div style={{ marginBottom: mobileStyles.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              Player 2
            </label>
            <input
              type="text"
              value={players.player2}
              onChange={(e) => setPlayers({ ...players, player2: e.target.value })}
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
              placeholder="Enter player 2 name"
            />
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#2563eb'
          }}>
            🔵 Team 2
          </h2>
          
          <div style={{ marginBottom: mobileStyles.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              Player 3
            </label>
            <input
              type="text"
              value={players.player3}
              onChange={(e) => setPlayers({ ...players, player3: e.target.value })}
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
              placeholder="Enter player 3 name"
            />
          </div>

          <div style={{ marginBottom: mobileStyles.spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: mobileStyles.spacing.sm,
              color: '#374151'
            }}>
              Player 4
            </label>
            <input
              type="text"
              value={players.player4}
              onChange={(e) => setPlayers({ ...players, player4: e.target.value })}
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
              placeholder="Enter player 4 name"
            />
          </div>

          <button
            onClick={setupTeams}
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
            📖 How to Play
          </h3>
          <div style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>• Each player throws 5 bags per round</p>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>In the hole:</strong> 3 points</p>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>On the board:</strong> 1 point</p>
            <p style={{ marginBottom: '0.5rem' }}>• <strong>First team to 21 wins!</strong></p>
            <p>• Players alternate: Team 1 → Team 2 → Team 1 → Team 2</p>
          </div>
        </div>
      </div>
    );
  }

  if (winner) {
    const winningTeam = teams[winner];
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
            {winner === 'team1' ? '🔴 Team 1' : '🔵 Team 2'} Wins!
          </h1>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#374151'
          }}>
            {winningTeam.players.join(' & ')}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.lg,
            color: '#374151'
          }}>
            Final Score: {teams.team1.score} - {teams.team2.score}
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
            🔄 New Game
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
          Round {currentRound} • Bag {currentBag} of 5
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
              fontSize: '1rem',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '0.25rem'
            }}>
              🔴 {teams.team1.players.join(' & ')}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#111827'
            }}>
              {teams.team1.score}
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
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2563eb',
              marginBottom: '0.25rem'
            }}>
              🔵 {teams.team2.players.join(' & ')}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#111827'
            }}>
              {teams.team2.score}
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

      {/* Current Player */}
      <div style={{
        ...cardStyle,
        backgroundColor: getCurrentTeam() === 'team1' ? '#fef2f2' : '#eff6ff',
        border: `3px solid ${getTeamColor(getCurrentTeam())}`
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: getTeamColor(getCurrentTeam()),
          marginBottom: mobileStyles.spacing.lg
        }}>
          {getCurrentTeam() === 'team1' ? '🔴' : '🔵'} {getCurrentPlayerName()}'s Turn
        </h2>
        
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          marginBottom: mobileStyles.spacing.lg
        }}>
          Bag {currentBag} of 5 - How did it land?
        </p>
        
        {/* Scoring Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: mobileStyles.spacing.md }}>
          <button
            onClick={() => recordBag(0)}
            style={{
              ...scoreButtonStyle,
              backgroundColor: '#6b7280',
              color: 'white',
              boxShadow: '0 4px 16px rgba(107, 114, 128, 0.3)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ❌ Miss<br />0 Points
          </button>
          <button
            onClick={() => recordBag(1)}
            style={{
              ...scoreButtonStyle,
              backgroundColor: '#10b981',
              color: 'white',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📌 On Board<br />+1 Point
          </button>
        </div>

        <button
          onClick={() => recordBag(3)}
          style={{
            width: '100%',
            minHeight: '80px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.2s'
          }}
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

      {/* Recent Game History */}
      {gameHistory.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: mobileStyles.spacing.md,
            color: '#111827'
          }}>
            📊 Recent Bags
          </h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {gameHistory.slice(-10).reverse().map((entry, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ fontWeight: '600', color: getTeamColor(entry.team) }}>
                  {entry.player}
                </span>
                <span style={{ color: '#6b7280' }}>
                  Bag {entry.bag}
                </span>
                <span style={{ 
                  fontWeight: '700',
                  color: entry.points === 3 ? '#f59e0b' : entry.points === 1 ? '#10b981' : '#6b7280'
                }}>
                  {entry.points === 3 ? '🎯 +3' : entry.points === 1 ? '📌 +1' : '❌ 0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BagsView;