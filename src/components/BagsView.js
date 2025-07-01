import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BagsView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('game'); // 'game', 'tournament', 'leaderboard', 'stats'
  const [gameState, setGameState] = useState({
    team1: { name: 'Team 1', score: 0, players: [] },
    team2: { name: 'Team 2', score: 0, players: [] },
    currentRound: [],
    gameHistory: [],
    inProgress: false,
    winner: null
  });
  
  const [tournament, setTournament] = useState({
    active: false,
    type: null, // 4 or 8 players
    players: [],
    bracket: [],
    currentRound: 0,
    champion: null
  });
  
  const [playerStats, setPlayerStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    loadPlayerStats();
    loadLeaderboard();
  }, []);

  const loadPlayerStats = () => {
    const savedStats = localStorage.getItem('bagsPlayerStats');
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }
  };

  const savePlayerStats = (stats) => {
    localStorage.setItem('bagsPlayerStats', JSON.stringify(stats));
    setPlayerStats(stats);
    updateLeaderboard(stats);
  };

  const loadLeaderboard = () => {
    const savedStats = localStorage.getItem('bagsPlayerStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      updateLeaderboard(stats);
    }
  };

  const updateLeaderboard = (stats) => {
    const sortedPlayers = Object.entries(stats)
      .map(([playerId, data]) => ({
        id: playerId,
        ...data,
        winRate: data.gamesPlayed > 0 ? (data.wins / data.gamesPlayed * 100).toFixed(1) : 0,
        avgPointsPerGame: data.gamesPlayed > 0 ? (data.totalPoints / data.gamesPlayed).toFixed(1) : 0
      }))
      .sort((a, b) => {
        // Sort by wins, then by win rate, then by avg points
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.avgPointsPerGame - a.avgPointsPerGame;
      });
    setLeaderboard(sortedPlayers);
  };

  const updatePlayerStat = (playerId, playerName, won, points, tournamentWin = false) => {
    const newStats = { ...playerStats };
    if (!newStats[playerId]) {
      newStats[playerId] = {
        name: playerName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        perfectGames: 0,
        tournamentWins: 0,
        currentStreak: 0,
        bestStreak: 0
      };
    }
    
    const stat = newStats[playerId];
    stat.gamesPlayed++;
    stat.totalPoints += points;
    
    if (won) {
      stat.wins++;
      stat.currentStreak++;
      if (stat.currentStreak > stat.bestStreak) {
        stat.bestStreak = stat.currentStreak;
      }
    } else {
      stat.losses++;
      stat.currentStreak = 0;
    }
    
    if (points === 21 && won) {
      stat.perfectGames++;
    }
    
    if (tournamentWin) {
      stat.tournamentWins++;
    }
    
    savePlayerStats(newStats);
  };

  // Game Functions
  const startNewGame = () => {
    if (gameState.team1.players.length === 0 || gameState.team2.players.length === 0) {
      alert('Please add players to both teams first!');
      return;
    }
    
    setGameState({
      ...gameState,
      team1: { ...gameState.team1, score: 0 },
      team2: { ...gameState.team2, score: 0 },
      currentRound: [],
      gameHistory: [],
      inProgress: true,
      winner: null
    });
  };

  const addScore = (team, points) => {
    if (!gameState.inProgress) return;
    
    const newState = { ...gameState };
    const teamKey = team === 1 ? 'team1' : 'team2';
    newState[teamKey].score = Math.max(0, Math.min(21, newState[teamKey].score + points));
    
    // Track the scoring event
    newState.currentRound.push({ team, points, timestamp: Date.now() });
    
    // Check for winner (exactly 21 points)
    if (newState[teamKey].score === 21) {
      newState.winner = teamKey;
      newState.inProgress = false;
      
      // Update player stats
      const winningTeam = newState[teamKey];
      const losingTeam = team === 1 ? newState.team2 : newState.team1;
      
      winningTeam.players.forEach(player => {
        updatePlayerStat(player.id, player.name, true, winningTeam.score);
      });
      
      losingTeam.players.forEach(player => {
        updatePlayerStat(player.id, player.name, false, losingTeam.score);
      });
    }
    
    setGameState(newState);
  };

  const endRound = () => {
    const newHistory = [...gameState.gameHistory, {
      round: gameState.gameHistory.length + 1,
      team1Score: gameState.team1.score,
      team2Score: gameState.team2.score,
      events: [...gameState.currentRound]
    }];
    
    setGameState({
      ...gameState,
      gameHistory: newHistory,
      currentRound: []
    });
  };

  const addPlayerToTeam = (team, playerName) => {
    if (!playerName.trim()) return;
    
    const teamKey = team === 1 ? 'team1' : 'team2';
    const playerId = `${user?.id || 'guest'}_${Date.now()}`;
    
    setGameState({
      ...gameState,
      [teamKey]: {
        ...gameState[teamKey],
        players: [...gameState[teamKey].players, { id: playerId, name: playerName }]
      }
    });
  };

  const removePlayerFromTeam = (team, playerIndex) => {
    const teamKey = team === 1 ? 'team1' : 'team2';
    setGameState({
      ...gameState,
      [teamKey]: {
        ...gameState[teamKey],
        players: gameState[teamKey].players.filter((_, idx) => idx !== playerIndex)
      }
    });
  };

  // Tournament Functions
  const startTournament = (playerCount) => {
    if (tournament.players.length !== playerCount) {
      alert(`Please add exactly ${playerCount} players to start the tournament!`);
      return;
    }
    
    // Shuffle players and create bracket
    const shuffled = [...tournament.players].sort(() => Math.random() - 0.5);
    const bracket = [];
    
    // Create first round matches
    for (let i = 0; i < shuffled.length; i += 2) {
      bracket.push({
        id: `match_${i/2}`,
        round: 0,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        winner: null,
        score: { player1: 0, player2: 0 }
      });
    }
    
    setTournament({
      ...tournament,
      active: true,
      type: playerCount,
      bracket: bracket,
      currentRound: 0
    });
  };

  const updateMatchScore = (matchId, player, score) => {
    const newBracket = tournament.bracket.map(match => {
      if (match.id === matchId) {
        const newMatch = { ...match };
        newMatch.score[player] = score;
        
        // Check for winner
        if (score === 21) {
          newMatch.winner = player;
          
          // Update player stats
          const winnerId = newMatch[player].id;
          const winnerName = newMatch[player].name;
          const loserId = newMatch[player === 'player1' ? 'player2' : 'player1'].id;
          const loserName = newMatch[player === 'player1' ? 'player2' : 'player1'].name;
          const loserScore = newMatch.score[player === 'player1' ? 'player2' : 'player1'];
          
          updatePlayerStat(winnerId, winnerName, true, 21);
          updatePlayerStat(loserId, loserName, false, loserScore);
        }
        
        return newMatch;
      }
      return match;
    });
    
    setTournament({ ...tournament, bracket: newBracket });
    
    // Check if round is complete
    const currentRoundMatches = newBracket.filter(m => m.round === tournament.currentRound);
    const allComplete = currentRoundMatches.every(m => m.winner !== null);
    
    if (allComplete) {
      advanceToNextRound();
    }
  };

  const advanceToNextRound = () => {
    const currentRoundMatches = tournament.bracket.filter(m => m.round === tournament.currentRound);
    const winners = currentRoundMatches.map(m => m[m.winner]);
    
    if (winners.length === 1) {
      // Tournament complete!
      const champion = winners[0];
      updatePlayerStat(champion.id, champion.name, false, 0, true); // Tournament win
      setTournament({ ...tournament, champion: champion, active: false });
      return;
    }
    
    // Create next round matches
    const nextRound = tournament.currentRound + 1;
    const newMatches = [];
    
    for (let i = 0; i < winners.length; i += 2) {
      newMatches.push({
        id: `match_${nextRound}_${i/2}`,
        round: nextRound,
        player1: winners[i],
        player2: winners[i + 1],
        winner: null,
        score: { player1: 0, player2: 0 }
      });
    }
    
    setTournament({
      ...tournament,
      bracket: [...tournament.bracket, ...newMatches],
      currentRound: nextRound
    });
  };

  const addPlayerToTournament = (playerName) => {
    if (!playerName.trim()) return;
    
    const playerId = `${user?.id || 'guest'}_${Date.now()}`;
    const newPlayer = { id: playerId, name: playerName };
    
    setTournament({
      ...tournament,
      players: [...tournament.players, newPlayer]
    });
  };

  // Waitlist Functions
  const joinWaitlist = (playerName) => {
    if (!playerName.trim()) return;
    
    const player = {
      id: `${user?.id || 'guest'}_${Date.now()}`,
      name: playerName,
      joinedAt: new Date().toLocaleTimeString()
    };
    
    setWaitlist([...waitlist, player]);
    setShowJoinModal(false);
  };

  const removeFromWaitlist = (playerId) => {
    setWaitlist(waitlist.filter(p => p.id !== playerId));
  };

  const renderGameTab = () => (
    <div style={{ padding: '1rem' }}>
      {/* Game Setup */}
      {!gameState.inProgress && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Game Setup
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Team 1 */}
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Team 1</h4>
              <div style={{ marginBottom: '0.5rem' }}>
                {gameState.team1.players.map((player, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span>{player.name}</span>
                    <button
                      onClick={() => removePlayerFromTeam(1, idx)}
                      style={{
                        padding: '0.125rem 0.375rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Player name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPlayerToTeam(1, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.375rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.375rem'
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    addPlayerToTeam(1, input.value);
                    input.value = '';
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Team 2 */}
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Team 2</h4>
              <div style={{ marginBottom: '0.5rem' }}>
                {gameState.team2.players.map((player, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span>{player.name}</span>
                    <button
                      onClick={() => removePlayerFromTeam(2, idx)}
                      style={{
                        padding: '0.125rem 0.375rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Player name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPlayerToTeam(2, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.375rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.375rem'
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    addPlayerToTeam(2, input.value);
                    input.value = '';
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={startNewGame}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Start Game
          </button>
        </div>
      )}
      
      {/* Active Game */}
      {gameState.inProgress && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            Game In Progress
          </h3>
          
          {/* Scoreboard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
            alignItems: 'center'
          }}>
            {/* Team 1 Score */}
            <div style={{
              textAlign: 'center',
              backgroundColor: '#dbeafe',
              borderRadius: '0.75rem',
              padding: '1rem'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                {gameState.team1.name}
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                {gameState.team1.players.map(p => p.name).join(' & ')}
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                lineHeight: '1'
              }}>
                {gameState.team1.score}
              </div>
            </div>
            
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>VS</div>
            
            {/* Team 2 Score */}
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fef3c7',
              borderRadius: '0.75rem',
              padding: '1rem'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                {gameState.team2.name}
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.5rem' }}>
                {gameState.team2.players.map(p => p.name).join(' & ')}
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                lineHeight: '1'
              }}>
                {gameState.team2.score}
              </div>
            </div>
          </div>
          
          {/* Scoring Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Add Points
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              {/* Team 1 Controls */}
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem'
                }}>
                  {[1, 3, -1].map(points => (
                    <button
                      key={points}
                      onClick={() => addScore(1, points)}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: points > 0 ? '#3b82f6' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {points > 0 ? `+${points}` : points}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Team 2 Controls */}
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem'
                }}>
                  {[1, 3, -1].map(points => (
                    <button
                      key={points}
                      onClick={() => addScore(2, points)}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: points > 0 ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {points > 0 ? `+${points}` : points}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Round Actions */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={endRound}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              End Round
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end this game?')) {
                  setGameState({ ...gameState, inProgress: false });
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              End Game
            </button>
          </div>
        </div>
      )}
      
      {/* Game Winner */}
      {gameState.winner && (
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            🏆 {gameState[gameState.winner].name} Wins!
          </h2>
          <p style={{ fontSize: '1.25rem' }}>
            Final Score: {gameState.team1.score} - {gameState.team2.score}
          </p>
          <button
            onClick={() => setGameState({ ...gameState, winner: null })}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#10b981',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );

  const renderTournamentTab = () => (
    <div style={{ padding: '1rem' }}>
      {!tournament.active && !tournament.champion && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Tournament Setup
          </h3>
          
          {/* Tournament Size Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setTournament({ ...tournament, type: 4 })}
              style={{
                padding: '1rem',
                backgroundColor: tournament.type === 4 ? '#3b82f6' : '#f3f4f6',
                color: tournament.type === 4 ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              4 Player Tournament
            </button>
            <button
              onClick={() => setTournament({ ...tournament, type: 8 })}
              style={{
                padding: '1rem',
                backgroundColor: tournament.type === 8 ? '#3b82f6' : '#f3f4f6',
                color: tournament.type === 8 ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              8 Player Tournament
            </button>
          </div>
          
          {tournament.type && (
            <>
              {/* Player List */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Players ({tournament.players.length}/{tournament.type})
                </h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  {tournament.players.map((player, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem'
                    }}>
                      <span>{idx + 1}. {player.name}</span>
                      <button
                        onClick={() => {
                          setTournament({
                            ...tournament,
                            players: tournament.players.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{
                          padding: '0.125rem 0.375rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                {tournament.players.length < tournament.type && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Player name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addPlayerToTournament(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '0.375rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        addPlayerToTournament(input.value);
                        input.value = '';
                      }}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add Player
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => startTournament(tournament.type)}
                disabled={tournament.players.length !== tournament.type}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: tournament.players.length === tournament.type ? '#10b981' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: tournament.players.length === tournament.type ? 'pointer' : 'not-allowed'
                }}
              >
                Start Tournament
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Active Tournament */}
      {tournament.active && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            {tournament.type} Player Tournament - Round {tournament.currentRound + 1}
          </h3>
          
          {/* Current Round Matches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tournament.bracket
              .filter(match => match.round === tournament.currentRound)
              .map(match => (
                <div key={match.id} style={{
                  backgroundColor: match.winner ? '#f0fdf4' : '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: match.winner ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    {/* Player 1 */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {match.player1.name}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                        {match.score.player1}
                      </div>
                      {!match.winner && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.25rem',
                          marginTop: '0.5rem'
                        }}>
                          {[1, 3, -1].map(points => (
                            <button
                              key={points}
                              onClick={() => updateMatchScore(
                                match.id,
                                'player1',
                                Math.max(0, Math.min(21, match.score.player1 + points))
                              )}
                              style={{
                                padding: '0.25rem',
                                backgroundColor: points > 0 ? '#3b82f6' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              {points > 0 ? `+${points}` : points}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {match.winner && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      🏆 {match[match.winner].name} wins!
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Tournament Champion */}
      {tournament.champion && (
        <div style={{
          backgroundColor: '#fbbf24',
          color: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            🏆 Tournament Champion! 🏆
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            {tournament.champion.name}
          </p>
          <button
            onClick={() => setTournament({
              active: false,
              type: null,
              players: [],
              bracket: [],
              currentRound: 0,
              champion: null
            })}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#fbbf24',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            New Tournament
          </button>
        </div>
      )}
    </div>
  );

  const renderLeaderboardTab = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          🏆 Leaderboard
        </h3>
        
        {leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            No games played yet. Start playing to see the leaderboard!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Rank</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Player</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>W</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>L</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Win%</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Avg Pts</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>🏆</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((player, idx) => (
                  <tr key={player.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: idx < 3 ? '600' : '400' }}>
                      {idx === 0 && '🥇'} {idx === 1 && '🥈'} {idx === 2 && '🥉'} {idx + 1}
                    </td>
                    <td style={{ padding: '0.5rem', fontWeight: '500' }}>{player.name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{player.wins}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{player.losses}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{player.winRate}%</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{player.avgPointsPerGame}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{player.tournamentWins || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Who's Got Next */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            🎯 Who's Got Next?
          </h3>
          <button
            onClick={() => setShowJoinModal(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Join Waitlist
          </button>
        </div>
        
        {waitlist.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            No one waiting. Be the first to join!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {waitlist.map((player, idx) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: idx === 0 ? '#dbeafe' : '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <span style={{ fontWeight: '500' }}>
                    {idx + 1}. {player.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                    {player.joinedAt}
                  </span>
                </div>
                {idx === 0 && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    UP NEXT
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsTab = () => {
    const myStats = user ? playerStats[user.id] : null;
    
    return (
      <div style={{ padding: '1rem' }}>
        {/* Personal Stats */}
        {myStats && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              📊 My Stats
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }}>
              <StatCard
                label="Games Played"
                value={myStats.gamesPlayed}
                color="#3b82f6"
              />
              <StatCard
                label="Win Rate"
                value={`${myStats.gamesPlayed > 0 ? (myStats.wins / myStats.gamesPlayed * 100).toFixed(1) : 0}%`}
                color="#10b981"
              />
              <StatCard
                label="Current Streak"
                value={`${myStats.currentStreak}W`}
                color="#f59e0b"
              />
              <StatCard
                label="Best Streak"
                value={`${myStats.bestStreak}W`}
                color="#8b5cf6"
              />
              <StatCard
                label="Avg Points/Game"
                value={(myStats.totalPoints / myStats.gamesPlayed).toFixed(1)}
                color="#ec4899"
              />
              <StatCard
                label="Perfect Games"
                value={myStats.perfectGames}
                color="#14b8a6"
              />
              <StatCard
                label="Tournament Wins"
                value={myStats.tournamentWins}
                color="#fbbf24"
              />
              <StatCard
                label="Total Points"
                value={myStats.totalPoints}
                color="#6366f1"
              />
            </div>
          </div>
        )}
        
        {/* Fun Stats */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🎉 Fun Stats
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <FunStat
              icon="🔥"
              label="Hottest Player"
              value={leaderboard[0]?.name || 'No games yet'}
              detail={`${leaderboard[0]?.currentStreak || 0} game win streak`}
            />
            <FunStat
              icon="💯"
              label="Perfect Game Master"
              value={
                Object.entries(playerStats)
                  .sort((a, b) => b[1].perfectGames - a[1].perfectGames)[0]?.[1].name || 'No perfect games'
              }
              detail="Most 21-0 victories"
            />
            <FunStat
              icon="🎯"
              label="Points Machine"
              value={
                Object.entries(playerStats)
                  .sort((a, b) => {
                    const avgA = a[1].gamesPlayed > 0 ? a[1].totalPoints / a[1].gamesPlayed : 0;
                    const avgB = b[1].gamesPlayed > 0 ? b[1].totalPoints / b[1].gamesPlayed : 0;
                    return avgB - avgA;
                  })[0]?.[1].name || 'No games yet'
              }
              detail="Highest average points per game"
            />
            <FunStat
              icon="🏆"
              label="Tournament Legend"
              value={
                Object.entries(playerStats)
                  .sort((a, b) => b[1].tournamentWins - a[1].tournamentWins)[0]?.[1].name || 'No tournaments'
              }
              detail="Most tournament victories"
            />
          </div>
        </div>
      </div>
    );
  };

  // Join Waitlist Modal
  const JoinWaitlistModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Join the Waitlist
        </h3>
        <input
          type="text"
          placeholder="Your name"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              joinWaitlist(e.target.value);
            }
          }}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #cbd5e1',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Your name"]');
              joinWaitlist(input.value);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Join
          </button>
          <button
            onClick={() => setShowJoinModal(false)}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fbbf24',
        color: 'white',
        padding: '1.5rem',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🎯 Bags Central
        </h1>
        <p style={{ opacity: 0.9 }}>
          Track scores, play tournaments, and become a cornhole champion!
        </p>
      </div>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        margin: '1rem',
        padding: '0.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {[
          { id: 'game', label: 'Quick Game', icon: '🎮' },
          { id: 'tournament', label: 'Tournament', icon: '🏆' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '📊' },
          { id: 'stats', label: 'My Stats', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: activeTab === tab.id ? '#fbbf24' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'game' && renderGameTab()}
      {activeTab === 'tournament' && renderTournamentTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}
      {activeTab === 'stats' && renderStatsTab()}
      
      {/* Join Waitlist Modal */}
      {showJoinModal && <JoinWaitlistModal />}
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, color }) => (
  <div style={{
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1rem',
    textAlign: 'center',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color }}>
      {value}
    </div>
  </div>
);

const FunStat = ({ icon, label, value, detail }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem'
  }}>
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</div>
      <div style={{ fontWeight: '600' }}>{value}</div>
      {detail && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{detail}</div>
      )}
    </div>
  </div>
);

export default BagsView;
