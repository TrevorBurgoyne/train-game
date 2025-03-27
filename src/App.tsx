import React from 'react';
import GameBoard from './components/GameBoard';
import Keybinds from './components/Keybinds';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Train Game</h1>
      <Keybinds />
      <GameBoard />
    </div>
  );
};

export default App;