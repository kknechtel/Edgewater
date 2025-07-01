import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BagsView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('game'); // 'game', 'tournament', 'leaderboard', 'stats'
  
  // Enhanced game state with proper scoring
  const [gameState, setGameState] = useState({
    team1: { 
      name: '', 
      score: 0, 
      players: [],
      roundScores: [],
      bagsOnBoard: 0,
      bagsInHole: 0
    },
    team2: { 
      name: '', 
      score: 0, 
      players: [],
      roundScores: [],
      bagsOnBoard: 0,
      bagsInHole: 0
    },
    currentRound: 1,
    currentThrower: 'team1',
    gameHistory: [],
    inProgress: false,
    winner: null,
    targetScore: 21
  });

  // Team setup state
  const [setupState, setSetupState] = useState({
    team1Name: '',
    team2Name: '',
    team1Players: [],
    team2Players: [],
    newPlayerName: ''
  });

  // Scoring state for current throw
  const [throwState, setThrowState] = useState({
    team1OnBoard: 0,
    team1InHole: 0,
    team2OnBoard: 0,
    team2InHole: 0
  });

  const [playerStats, setPlayerStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistPlayerName, setWaitlistPlayerName] = useState(user?.display_name || user?.first_name || '');
  const [waitlistEntryType, setWaitlistEntryType] = useState('individual'); // 'individual' or 'team'
  const [waitlistTeammate, setWaitlistTeammate] = useState('');
  const [tournamentState, setTournamentState] = useState({
    active: false,
    players: [],
    bracket: [],
    currentRound: 1,
    games: [],
    winner: null,
    type: '8-player' // '4-player' or '8-player'
  });
  const [dailyStats, setDailyStats] = useState({});

  // App users for player selection
  const [appUsers, setAppUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Bags slang and terminology
  const bagsSlang = {
    hole: ['Drain', 'Bucket', 'Money Shot', 'Swish', 'Pure Gold', 'Bullseye'],
    board: ['Woody', 'Corndog', 'Hanger', 'Slider', 'Dirty Bag'],
    miss: ['Gutter Ball', 'Whiff', 'Air Mail', 'Shank', 'Total Brick'],
    goodThrow: ['Nice Toss!', 'Smooth!', 'Dialed In!', 'On Fire!', 'Money!'],
    comeback: ['Clutch!', 'Ice Cold!', 'Pressure Player!', 'Beast Mode!']
  };

  useEffect(() => {
    loadPlayerStats();
    loadWaitlist();
    loadDailyStats();
    loadAppUsers();
  }, []);

  // Update waitlist player name when user changes
  useEffect(() => {
    if (user && !waitlistPlayerName) {
      setWaitlistPlayerName(user.display_name || user.first_name || '');
    }
  }, [user]);

  // Pre-populate team 1 with current user
  useEffect(() => {
    if (user && setupState.team1Players.length === 0 && !gameState.inProgress) {
      const userName = user.display_name || user.first_name || 'You';
      setSetupState(prev => ({
        ...prev,
        team1Players: [{
          name: userName,
          id: user.id || `user-${Date.now()}`
        }]
      }));
    }
  }, [user, gameState.inProgress]);

  // Load app users for player selection
  const loadAppUsers = async () => {
    setLoadingUsers(true);
    try {
      // Try to get users from API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        setAppUsers(users);
      } else {
        // No fake users - real users only
        setAppUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // No fake users - real users only
      setAppUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDailyStats = () => {
    const today = new Date().toDateString();
    const savedDailyStats = localStorage.getItem('bagsDailyStats');
    if (savedDailyStats) {
      const allDailyStats = JSON.parse(savedDailyStats);
      setDailyStats(allDailyStats[today] || {
        gamesPlayed: 0,
        totalPoints: 0,
        holesThrown: 0,
        perfectRounds: 0,
        players: new Set()
      });
    }
  };

  const updateDailyStats = (gameResult) => {
    const today = new Date().toDateString();
    const savedDailyStats = localStorage.getItem('bagsDailyStats');
    const allDailyStats = savedDailyStats ? JSON.parse(savedDailyStats) : {};
    
    if (!allDailyStats[today]) {
      allDailyStats[today] = {
        gamesPlayed: 0,
        totalPoints: 0,
        holesThrown: 0,
        perfectRounds: 0,
        players: []
      };
    }
    
    const todayStats = allDailyStats[today];
    todayStats.gamesPlayed += 1;
    todayStats.totalPoints += gameResult.team1.score + gameResult.team2.score;
    todayStats.holesThrown += gameResult.team1.bagsInHole + gameResult.team2.bagsInHole;
    
    // Add players to daily list
    [...gameResult.team1.players, ...gameResult.team2.players].forEach(player => {
      if (!todayStats.players.includes(player.name)) {
        todayStats.players.push(player.name);
      }
    });
    
    allDailyStats[today] = todayStats;
    localStorage.setItem('bagsDailyStats', JSON.stringify(allDailyStats));
    setDailyStats(todayStats);
  };

  const loadPlayerStats = () => {
    const savedStats = localStorage.getItem('bagsPlayerStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setPlayerStats(stats);
      updateLeaderboard(stats);
    }
  };

  const savePlayerStats = (stats) => {
    localStorage.setItem('bagsPlayerStats', JSON.stringify(stats));
    setPlayerStats(stats);
    updateLeaderboard(stats);
  };

  const updateLeaderboard = (stats) => {
    const sortedPlayers = Object.entries(stats)
      .map(([playerId, data]) => ({
        id: playerId,
        ...data,
        winRate: data.gamesPlayed > 0 ? (data.wins / data.gamesPlayed * 100).toFixed(1) : 0,
        avgPointsPerGame: data.gamesPlayed > 0 ? (data.totalPoints / data.gamesPlayed).toFixed(1) : 0,
        holesPerGame: data.gamesPlayed > 0 ? (data.totalHoles / data.gamesPlayed).toFixed(1) : 0
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.avgPointsPerGame - a.avgPointsPerGame;
      });
    setLeaderboard(sortedPlayers);
  };

  const addPlayerToTeam = (team, playerName, playerId = null) => {
    if (!playerName.trim()) return;
    
    const teamKey = `${team}Players`;
    const currentPlayers = setupState[teamKey];
    
    if (currentPlayers.length >= 2) {
      alert('Maximum 2 players per team!');
      return;
    }
    
    if (currentPlayers.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      alert('Player already on this team!');
      return;
    }

    // If playerId provided, it's an app user - link to their stats
    const playerData = { 
      name: playerName, 
      id: playerId || `${playerName}-${Date.now()}`,
      appUserId: playerId, // Link to app user for stats tracking
      roundScores: [],
      totalHoles: 0,
      totalOnBoard: 0
    };

    setSetupState(prev => ({
      ...prev,
      [teamKey]: [...currentPlayers, playerData],
      newPlayerName: ''
    }));
  };

  const removePlayerFromTeam = (team, playerIndex) => {
    const teamKey = `${team}Players`;
    setSetupState(prev => ({
      ...prev,
      [teamKey]: prev[teamKey].filter((_, index) => index !== playerIndex)
    }));
  };

  const startGame = () => {
    if (setupState.team1Players.length === 0 || setupState.team2Players.length === 0) {
      alert('Each team needs at least 1 player!');
      return;
    }

    // Team names are optional - use defaults if empty
    const team1Name = setupState.team1Name.trim() || 'Team 1';
    const team2Name = setupState.team2Name.trim() || 'Team 2';

    setGameState(prev => ({
      ...prev,
      team1: {
        ...prev.team1,
        name: team1Name,
        players: setupState.team1Players,
        score: 0,
        roundScores: [],
        bagsOnBoard: 0,
        bagsInHole: 0
      },
      team2: {
        ...prev.team2,
        name: team2Name,
        players: setupState.team2Players,
        score: 0,
        roundScores: [],
        bagsOnBoard: 0,
        bagsInHole: 0
      },
      inProgress: true,
      currentRound: 1,
      currentThrower: 'team1',
      winner: null
    }));

    // Reset throw state
    setThrowState({
      team1OnBoard: 0,
      team1InHole: 0,
      team2OnBoard: 0,
      team2InHole: 0
    });
  };

  const calculateRoundScore = () => {
    const team1Points = throwState.team1InHole * 3 + throwState.team1OnBoard * 1;
    const team2Points = throwState.team2InHole * 3 + throwState.team2OnBoard * 1;
    
    // Cancellation scoring - only the difference counts
    let team1RoundScore = 0;
    let team2RoundScore = 0;
    
    if (team1Points > team2Points) {
      team1RoundScore = team1Points - team2Points;
    } else if (team2Points > team1Points) {
      team2RoundScore = team2Points - team1Points;
    }

    return { team1RoundScore, team2RoundScore, team1Points, team2Points };
  };

  const submitRound = () => {
    const { team1RoundScore, team2RoundScore, team1Points, team2Points } = calculateRoundScore();
    
    const newGameState = {
      ...gameState,
      team1: {
        ...gameState.team1,
        score: gameState.team1.score + team1RoundScore,
        bagsInHole: gameState.team1.bagsInHole + throwState.team1InHole,
        bagsOnBoard: gameState.team1.bagsOnBoard + throwState.team1OnBoard,
        roundScores: [...gameState.team1.roundScores, team1Points]
      },
      team2: {
        ...gameState.team2,
        score: gameState.team2.score + team2RoundScore,
        bagsInHole: gameState.team2.bagsInHole + throwState.team2InHole,
        bagsOnBoard: gameState.team2.bagsOnBoard + throwState.team2OnBoard,
        roundScores: [...gameState.team2.roundScores, team2Points]
      },
      currentRound: gameState.currentRound + 1
    };

    // Check for winner
    if (newGameState.team1.score >= gameState.targetScore) {
      newGameState.winner = 'team1';
      newGameState.inProgress = false;
      updatePlayerStatsAfterGame(newGameState, 'team1');
    } else if (newGameState.team2.score >= gameState.targetScore) {
      newGameState.winner = 'team2';
      newGameState.inProgress = false;
      updatePlayerStatsAfterGame(newGameState, 'team2');
    }

    setGameState(newGameState);
    
    // Reset throw state for next round
    setThrowState({
      team1OnBoard: 0,
      team1InHole: 0,
      team2OnBoard: 0,
      team2InHole: 0
    });
  };

  const updatePlayerStatsAfterGame = (finalGameState, winningTeam) => {
    const newStats = { ...playerStats };
    
    // Update stats for all players
    ['team1', 'team2'].forEach(team => {
      finalGameState[team].players.forEach(player => {
        if (!newStats[player.id]) {
          newStats[player.id] = {
            name: player.name,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            totalPoints: 0,
            totalHoles: 0,
            totalOnBoard: 0,
            perfectGames: 0,
            currentStreak: 0,
            bestStreak: 0
          };
        }
        
        const stat = newStats[player.id];
        const won = team === winningTeam;
        const teamScore = finalGameState[team].score;
        const teamHoles = finalGameState[team].bagsInHole;
        const teamOnBoard = finalGameState[team].bagsOnBoard;
        
        stat.gamesPlayed++;
        stat.totalPoints += teamScore;
        stat.totalHoles += teamHoles;
        stat.totalOnBoard += teamOnBoard;
        
        if (won) {
          stat.wins++;
          stat.currentStreak++;
          if (stat.currentStreak > stat.bestStreak) {
            stat.bestStreak = stat.currentStreak;
          }
          if (teamScore === 21 && finalGameState[team === 'team1' ? 'team2' : 'team1'].score === 0) {
            stat.perfectGames++;
          }
        } else {
          stat.losses++;
          stat.currentStreak = 0;
        }
      });
    });
    
    savePlayerStats(newStats);
    updateDailyStats(finalGameState);
  };

  const getRandomSlang = (category) => {
    const options = bagsSlang[category];
    return options[Math.floor(Math.random() * options.length)];
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      team1: { ...prev.team1, score: 0, roundScores: [], bagsOnBoard: 0, bagsInHole: 0 },
      team2: { ...prev.team2, score: 0, roundScores: [], bagsOnBoard: 0, bagsInHole: 0 },
      currentRound: 1,
      currentThrower: 'team1',
      inProgress: false,
      winner: null
    }));
    setThrowState({
      team1OnBoard: 0,
      team1InHole: 0,
      team2OnBoard: 0,
      team2InHole: 0
    });
  };

  // Waitlist Functions
  const loadWaitlist = () => {
    const savedWaitlist = localStorage.getItem('bagsWaitlist');
    if (savedWaitlist) {
      setWaitlist(JSON.parse(savedWaitlist));
    }
  };

  const saveWaitlist = (newWaitlist) => {
    localStorage.setItem('bagsWaitlist', JSON.stringify(newWaitlist));
    setWaitlist(newWaitlist);
  };

  const addToWaitlist = () => {
    if (!waitlistPlayerName.trim()) {
      alert('Please enter a player name!');
      return;
    }

    if (waitlistEntryType === 'team' && !waitlistTeammate.trim()) {
      alert('Please enter teammate name!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: waitlistEntryType,
      name: waitlistPlayerName,
      teammate: waitlistEntryType === 'team' ? waitlistTeammate : null,
      displayName: waitlistEntryType === 'team' 
        ? `${waitlistPlayerName} & ${waitlistTeammate}` 
        : waitlistPlayerName,
      joinedAt: new Date().toLocaleTimeString(),
      playersNeeded: waitlistEntryType === 'team' ? 0 : 1
    };

    const updatedWaitlist = [...waitlist, newEntry];
    saveWaitlist(updatedWaitlist);
    setWaitlistPlayerName('');
    setWaitlistTeammate('');
    setShowWaitlistModal(false);
  };

  const removeFromWaitlist = (playerId) => {
    const updatedWaitlist = waitlist.filter(player => player.id !== playerId);
    saveWaitlist(updatedWaitlist);
  };

  const moveWaitlistToGame = (entryId) => {
    const entry = waitlist.find(p => p.id === entryId);
    if (entry) {
      if (entry.type === 'team') {
        // Add both players to a team
        if (setupState.team1Players.length === 0) {
          addPlayerToTeam('team1', entry.name);
          addPlayerToTeam('team1', entry.teammate);
        } else if (setupState.team2Players.length === 0) {
          addPlayerToTeam('team2', entry.name);
          addPlayerToTeam('team2', entry.teammate);
        } else {
          alert('No available team slots for a full team!');
          return;
        }
      } else {
        // Add individual player
        if (setupState.team1Players.length < 2) {
          addPlayerToTeam('team1', entry.name);
        } else if (setupState.team2Players.length < 2) {
          addPlayerToTeam('team2', entry.name);
        } else {
          alert('All team slots are full!');
          return;
        }
      }
      removeFromWaitlist(entryId);
    }
  };

  // Tournament Functions
  const startTournament = (type = '8-player') => {
    const minPlayers = type === '4-player' ? 4 : 8;
    const availablePlayers = waitlist.filter(entry => entry.type === 'individual');
    
    if (availablePlayers.length < minPlayers) {
      alert(`Need at least ${minPlayers} individual players for ${type} tournament!`);
      return;
    }

    const tournamentPlayers = availablePlayers.slice(0, minPlayers);
    const bracket = generateBracket(tournamentPlayers, type);
    
    setTournamentState({
      active: true,
      players: tournamentPlayers,
      bracket: bracket,
      currentRound: 1,
      games: [],
      winner: null,
      type: type
    });

    // Remove tournament players from waitlist
    const remainingWaitlist = waitlist.filter(entry => 
      !tournamentPlayers.find(tp => tp.id === entry.id)
    );
    saveWaitlist(remainingWaitlist);
  };

  const generateBracket = (players, type) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const bracket = [];
    
    // Round 1 pairings
    for (let i = 0; i < shuffled.length; i += 2) {
      bracket.push({
        id: `round1-${i/2}`,
        round: 1,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        winner: null,
        completed: false
      });
    }
    
    // Generate subsequent rounds
    let currentRoundGames = bracket.length;
    let round = 2;
    
    while (currentRoundGames > 1) {
      const nextRoundGames = currentRoundGames / 2;
      for (let i = 0; i < nextRoundGames; i++) {
        bracket.push({
          id: `round${round}-${i}`,
          round: round,
          player1: null,
          player2: null,
          winner: null,
          completed: false
        });
      }
      currentRoundGames = nextRoundGames;
      round++;
    }
    
    return bracket;
  };

  const advanceTournamentWinner = (gameId, winnerId) => {
    const updatedBracket = tournamentState.bracket.map(game => {
      if (game.id === gameId) {
        const winner = game.player1.id === winnerId ? game.player1 : game.player2;
        return { ...game, winner, completed: true };
      }
      return game;
    });

    // Advance winner to next round
    const currentGame = updatedBracket.find(g => g.id === gameId);
    const nextRoundGame = findNextRoundGame(updatedBracket, gameId);
    
    if (nextRoundGame) {
      const updatedBracketWithAdvancement = updatedBracket.map(game => {
        if (game.id === nextRoundGame.id) {
          if (!game.player1) {
            return { ...game, player1: currentGame.winner };
          } else if (!game.player2) {
            return { ...game, player2: currentGame.winner };
          }
        }
        return game;
      });
      
      setTournamentState(prev => ({
        ...prev,
        bracket: updatedBracketWithAdvancement
      }));
    } else {
      // Tournament winner!
      setTournamentState(prev => ({
        ...prev,
        bracket: updatedBracket,
        winner: currentGame.winner,
        active: false
      }));
    }
  };

  const findNextRoundGame = (bracket, currentGameId) => {
    const currentGame = bracket.find(g => g.id === currentGameId);
    const nextRound = currentGame.round + 1;
    const gameIndex = parseInt(currentGameId.split('-')[1]);
    const nextGameIndex = Math.floor(gameIndex / 2);
    
    return bracket.find(g => 
      g.round === nextRound && 
      g.id === `round${nextRound}-${nextGameIndex}`
    );
  };

  const renderGameSetup = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
        🎯 Game Setup
      </h3>
      
      {/* Team Names */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
            Team 1 Name (optional)
          </label>
          <input
            type="text"
            value={setupState.team1Name}
            onChange={(e) => setSetupState(prev => ({ ...prev, team1Name: e.target.value }))}
            placeholder="e.g., Bag Crushers, Hole Hunters"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
            Team 2 Name (optional)
          </label>
          <input
            type="text"
            value={setupState.team2Name}
            onChange={(e) => setSetupState(prev => ({ ...prev, team2Name: e.target.value }))}
            placeholder="e.g., Toss Masters, Board Lords"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* Player Setup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {['team1', 'team2'].map((team, teamIndex) => (
          <div key={team} style={{ border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
              {team === 'team1' ? '🔴 Team 1' : '🔵 Team 2'} Players (1-2 players)
            </h4>
            
            {/* Current Players */}
            {setupState[`${team}Players`].map((player, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backgroundColor: '#f3f4f6', 
                padding: '0.5rem', 
                borderRadius: '0.5rem', 
                marginBottom: '0.5rem' 
              }}>
                <span style={{ fontWeight: '500' }}>{player.name}</span>
                <button
                  onClick={() => removePlayerFromTeam(team, index)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            
            {/* Add Player */}
            {setupState[`${team}Players`].length < 2 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value=""
                  onChange={(e) => {
                    const selectedUser = appUsers.find(u => u.id === e.target.value);
                    if (selectedUser) {
                      addPlayerToTeam(team, selectedUser.display_name, selectedUser.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select app user...</option>
                  {loadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : (
                    appUsers
                      .filter(user => {
                        // Don't show users already on teams
                        const allPlayers = [...setupState.team1Players, ...setupState.team2Players];
                        return !allPlayers.find(p => p.id === user.id);
                      })
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.display_name} ({user.bags_wins || 0}W - {user.bags_losses || 0}L)
                        </option>
                      ))
                  )}
                </select>
                <span style={{ alignSelf: 'center', color: '#6b7280' }}>OR</span>
                <input
                  type="text"
                  value={setupState.newPlayerName}
                  onChange={(e) => setSetupState(prev => ({ ...prev, newPlayerName: e.target.value }))}
                  placeholder="Custom name"
                  style={{
                    width: '8rem',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && setupState.newPlayerName) {
                      addPlayerToTeam(team, setupState.newPlayerName);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (setupState.newPlayerName) {
                      addPlayerToTeam(team, setupState.newPlayerName);
                    }
                  }}
                  disabled={!setupState.newPlayerName}
                  style={{
                    backgroundColor: setupState.newPlayerName ? '#10b981' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: setupState.newPlayerName ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={startGame}
        disabled={setupState.team1Players.length === 0 || setupState.team2Players.length === 0 || !setupState.team1Name.trim() || !setupState.team2Name.trim()}
        style={{
          width: '100%',
          marginTop: '1.5rem',
          backgroundColor: '#0891b2',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          padding: '1rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          cursor: setupState.team1Players.length > 0 && setupState.team2Players.length > 0 && setupState.team1Name.trim() && setupState.team2Name.trim() ? 'pointer' : 'not-allowed',
          opacity: setupState.team1Players.length > 0 && setupState.team2Players.length > 0 && setupState.team1Name.trim() && setupState.team2Name.trim() ? 1 : 0.5
        }}
      >
        🎯 Start Throwing Bags!
      </button>
    </div>
  );

  const renderGamePlay = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      {/* Game Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#374151' }}>
          Round {gameState.currentRound} 🎯
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          First to {gameState.targetScore} wins! (Cancellation scoring)
        </p>
      </div>

      {/* Score Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.75rem', border: '2px solid #f87171' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#dc2626' }}>
            🔴 {gameState.team1.name}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#dc2626' }}>
            {gameState.team1.score}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
            {gameState.team1.bagsInHole} holes • {gameState.team1.bagsOnBoard} on board
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#374151' }}>
          VS
        </div>

        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', border: '2px solid #60a5fa' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#2563eb' }}>
            🔵 {gameState.team2.name}
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#2563eb' }}>
            {gameState.team2.score}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>
            {gameState.team2.bagsInHole} holes • {gameState.team2.bagsOnBoard} on board
          </div>
        </div>
      </div>

      {/* Current Round Scoring */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151', textAlign: 'center' }}>
          📊 This Round's Throws
        </h4>
        
        {['team1', 'team2'].map((team, index) => (
          <div key={team} style={{ marginBottom: '1rem' }}>
            <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: team === 'team1' ? '#dc2626' : '#2563eb' }}>
              {team === 'team1' ? '🔴' : '🔵'} {gameState[team].name}
            </h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                  💰 In Hole (3pts each)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setThrowState(prev => ({ 
                      ...prev, 
                      [`${team}InHole`]: Math.max(0, prev[`${team}InHole`] - 1) 
                    }))}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      width: '2rem',
                      height: '2rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    minWidth: '3rem', 
                    textAlign: 'center', 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.25rem'
                  }}>
                    {throwState[`${team}InHole`]}
                  </span>
                  <button
                    onClick={() => setThrowState(prev => ({ 
                      ...prev, 
                      [`${team}InHole`]: Math.min(4, prev[`${team}InHole`] + 1) 
                    }))}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      width: '2rem',
                      height: '2rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
                  🪵 On Board (1pt each)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setThrowState(prev => ({ 
                      ...prev, 
                      [`${team}OnBoard`]: Math.max(0, prev[`${team}OnBoard`] - 1) 
                    }))}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      width: '2rem',
                      height: '2rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    minWidth: '3rem', 
                    textAlign: 'center', 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.25rem'
                  }}>
                    {throwState[`${team}OnBoard`]}
                  </span>
                  <button
                    onClick={() => setThrowState(prev => ({ 
                      ...prev, 
                      [`${team}OnBoard`]: Math.min(4, prev[`${team}OnBoard`] + 1) 
                    }))}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      width: '2rem',
                      height: '2rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Round Score Preview */}
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: team === 'team1' ? '#dc2626' : '#2563eb'
            }}>
              Round Points: {throwState[`${team}InHole`] * 3 + throwState[`${team}OnBoard`] * 1}
            </div>
          </div>
        ))}

        {/* Cancellation Preview */}
        {(() => {
          const { team1RoundScore, team2RoundScore } = calculateRoundScore();
          return (
            <div style={{ 
              backgroundColor: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '0.5rem', 
              padding: '0.75rem', 
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <strong>After Cancellation:</strong><br/>
              {team1RoundScore > 0 && `🔴 ${gameState.team1.name} +${team1RoundScore}`}
              {team2RoundScore > 0 && `🔵 ${gameState.team2.name} +${team2RoundScore}`}
              {team1RoundScore === 0 && team2RoundScore === 0 && "🤝 Push - No points scored"}
            </div>
          );
        })()}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={submitRound}
          style={{
            flex: 1,
            backgroundColor: '#0891b2',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✅ Complete Round {gameState.currentRound}
        </button>
        
        <button
          onClick={resetGame}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );

  const renderGameComplete = () => (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '1rem', 
      padding: '2rem', 
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>
        {getRandomSlang('comeback')} Game Over!
      </h2>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: gameState.winner === 'team1' ? '#dc2626' : '#2563eb' }}>
        {gameState[gameState.winner].name} Wins!
      </h3>
      
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Final Score</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
              🔴 {gameState.team1.score}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {gameState.team1.name}
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>VS</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
              🔵 {gameState.team2.score}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {gameState.team2.name}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={resetGame}
        style={{
          backgroundColor: '#0891b2',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          padding: '1rem 2rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        🎯 Play Again
      </button>
    </div>
  );

  const renderLeaderboard = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
        🏆 Bags Leaderboard
      </h3>
      
      {leaderboard.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          No games played yet. Start throwing some bags!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaderboard.map((player, index) => (
            <div key={player.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: index < 3 ? '#fef3c7' : '#f9fafb',
              border: index < 3 ? '2px solid #f59e0b' : '1px solid #e5e7eb',
              borderRadius: '0.75rem', 
              padding: '1rem' 
            }}>
              <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {player.wins}W-{player.losses}L • {player.winRate}% win rate
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {player.holesPerGame} holes/game • {player.avgPointsPerGame} pts/game
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  🔥 {player.currentStreak} streak
                </div>
                {player.perfectGames > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    ⭐ {player.perfectGames} perfect games
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWaitlist = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#374151' }}>
            🕐 Who's Got Next?
          </h3>
          <button
            onClick={() => setShowWaitlistModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ Join Waitlist
          </button>
        </div>
        
        {waitlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No one waiting</h4>
            <p style={{ fontSize: '0.875rem' }}>Be the first to join the waitlist for the next game!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {waitlist.map((entry, index) => (
              <div key={entry.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: index === 0 ? '#fef3c7' : '#f9fafb',
                border: index === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    backgroundColor: index === 0 ? '#fbbf24' : '#e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    color: index === 0 ? 'white' : '#374151'
                  }}>
                    {index === 0 ? '👑' : index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {entry.type === 'team' ? '👥' : '👤'} {entry.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {entry.type === 'team' ? 'Team' : 'Individual'} • Joined at {entry.joinedAt}
                    </div>
                    {index === 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>
                        🔥 Up Next!
                      </div>
                    )}
                    {entry.type === 'individual' && entry.playersNeeded > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>
                        Looking for {entry.playersNeeded} teammate{entry.playersNeeded > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => moveWaitlistToGame(entry.id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add to Game
                  </button>
                  <button
                    onClick={() => removeFromWaitlist(entry.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Tournament Quick Start */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
          🏆 Quick Tournament
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => startTournament('4-player')}
            disabled={waitlist.filter(e => e.type === 'individual').length < 4}
            style={{
              flex: 1,
              backgroundColor: waitlist.filter(e => e.type === 'individual').length >= 4 ? '#8b5cf6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: waitlist.filter(e => e.type === 'individual').length >= 4 ? 'pointer' : 'not-allowed'
            }}
          >
            4-Player Tournament
          </button>
          <button
            onClick={() => startTournament('8-player')}
            disabled={waitlist.filter(e => e.type === 'individual').length < 8}
            style={{
              flex: 1,
              backgroundColor: waitlist.filter(e => e.type === 'individual').length >= 8 ? '#f59e0b' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: waitlist.filter(e => e.type === 'individual').length >= 8 ? 'pointer' : 'not-allowed'
            }}
          >
            8-Player Tournament
          </button>
        </div>
        <p style={{ fontSize: '0.625rem', color: '#6b7280', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
          {waitlist.filter(e => e.type === 'individual').length} individual players available
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
          📊 Today's Stats
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
              {dailyStats.gamesPlayed || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Games Today
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              {dailyStats.holesThrown || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Holes Made
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
              {dailyStats.players ? dailyStats.players.length : 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Players
            </div>
          </div>
        </div>
      </div>
      
      {/* Waitlist Modal */}
      {showWaitlistModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            margin: '1rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
              🕐 Join the Waitlist
            </h3>
            
            {/* Entry Type Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setWaitlistEntryType('individual')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: `2px solid ${waitlistEntryType === 'individual' ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: waitlistEntryType === 'individual' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  👤 Individual
                </button>
                <button
                  onClick={() => setWaitlistEntryType('team')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: `2px solid ${waitlistEntryType === 'team' ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: waitlistEntryType === 'team' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  👥 Team
                </button>
              </div>
            </div>
            
            <input
              type="text"
              value={waitlistPlayerName}
              onChange={(e) => setWaitlistPlayerName(e.target.value)}
              placeholder={waitlistEntryType === 'team' ? "Your name" : "Enter your name"}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                marginBottom: waitlistEntryType === 'team' ? '0.75rem' : '1rem'
              }}
            />
            
            {waitlistEntryType === 'team' && (
              <input
                type="text"
                value={waitlistTeammate}
                onChange={(e) => setWaitlistTeammate(e.target.value)}
                placeholder="Teammate's name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addToWaitlist();
                  }
                }}
              />
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowWaitlistModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addToWaitlist}
                disabled={!waitlistPlayerName.trim()}
                style={{
                  flex: 1,
                  backgroundColor: waitlistPlayerName.trim() ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: waitlistPlayerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main navigation tabs
  const tabs = [
    { id: 'game', label: '🎮 Quick Game', icon: '🎮' },
    { id: 'waitlist', label: '🕐 Got Next', icon: '🕐' },
    { id: 'tournament', label: '🏆 Tournament', icon: '🏆' },
    { id: 'leaderboard', label: '📊 Leaderboard', icon: '📊' },
    { id: 'stats', label: '📈 My Stats', icon: '📈' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff',
      paddingBottom: '1rem'
    }}>
      {/* Header */}
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#374151' }}>
          🎯 Bags Central
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          Track scores, play tournaments, and become a bags champion!
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        padding: '0 1rem 1rem 1rem',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1',
              minWidth: 'auto',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              backgroundColor: activeTab === tab.id ? '#0891b2' : 'white',
              color: activeTab === tab.id ? 'white' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            <div>{tab.icon}</div>
            <div style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>
              {tab.label.replace(/^🎮|🕐|🏆|📊|📈\s/, '')}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 1rem' }}>
        {activeTab === 'game' && (
          <>
            {!gameState.inProgress && !gameState.winner && renderGameSetup()}
            {gameState.inProgress && !gameState.winner && renderGamePlay()}
            {gameState.winner && renderGameComplete()}
          </>
        )}
        
        {activeTab === 'waitlist' && renderWaitlist()}
        
        {activeTab === 'leaderboard' && renderLeaderboard()}
        
        {activeTab === 'tournament' && (
          tournamentState.active ? (
            <div style={{ padding: '1rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#374151' }}>
                    🏆 {tournamentState.type} Tournament
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Round {tournamentState.currentRound}
                  </div>
                </div>
                
                {/* Tournament Bracket */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2, 3, 4].map(round => {
                    const roundGames = tournamentState.bracket.filter(game => game.round === round);
                    if (roundGames.length === 0) return null;
                    
                    return (
                      <div key={round} style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                          {round === 1 ? 'Round 1' : round === 2 ? 'Semifinals' : round === 3 ? 'Finals' : 'Championship'}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {roundGames.map(game => (
                            <div key={game.id} style={{
                              backgroundColor: game.completed ? '#f0fdf4' : '#f9fafb',
                              border: `2px solid ${game.completed ? '#22c55e' : '#e5e7eb'}`,
                              borderRadius: '0.75rem',
                              padding: '1rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: game.winner?.id === game.player1?.id ? '600' : '400',
                                    color: game.winner?.id === game.player1?.id ? '#22c55e' : '#374151',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {game.player1 ? (
                                      <>
                                        {game.winner?.id === game.player1.id && '🏆 '}
                                        {game.player1.displayName || game.player1.name}
                                      </>
                                    ) : 'TBD'}
                                  </div>
                                  <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: game.winner?.id === game.player2?.id ? '600' : '400',
                                    color: game.winner?.id === game.player2?.id ? '#22c55e' : '#374151'
                                  }}>
                                    {game.player2 ? (
                                      <>
                                        {game.winner?.id === game.player2.id && '🏆 '}
                                        {game.player2.displayName || game.player2.name}
                                      </>
                                    ) : 'TBD'}
                                  </div>
                                </div>
                                
                                {game.player1 && game.player2 && !game.completed && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => advanceTournamentWinner(game.id, game.player1.id)}
                                      style={{
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {(game.player1.displayName || game.player1.name).split(' ')[0]} Wins
                                    </button>
                                    <button
                                      onClick={() => advanceTournamentWinner(game.id, game.player2.id)}
                                      style={{
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {(game.player2.displayName || game.player2.name).split(' ')[0]} Wins
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {tournamentState.winner && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    marginTop: '1rem'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                      Tournament Champion!
                    </h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e' }}>
                      {tournamentState.winner.displayName || tournamentState.winner.name}
                    </p>
                    <button
                      onClick={() => setTournamentState({
                        active: false,
                        players: [],
                        bracket: [],
                        currentRound: 1,
                        games: [],
                        winner: null,
                        type: '8-player'
                      })}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginTop: '1rem'
                      }}
                    >
                      Start New Tournament
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Tournament Mode
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Start a tournament from the "Got Next" waitlist when you have enough players!
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>4</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Min for Quick Tournament</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>8</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Full Tournament</div>
                </div>
              </div>
            </div>
          )
        )}
        
        {activeTab === 'stats' && (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Personal Stats
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Track your throwing accuracy, favorite opponents, and more!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BagsView;