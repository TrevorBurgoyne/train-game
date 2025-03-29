import { FC, useState, useEffect } from 'react';
import Keybinds from './Keybinds';
import Tile, { TileProps, RailType, Coordinate, getDirection } from './Tile';
import { getKeybind } from '../utils/keybind_utils';
import { getRandomTerrainSubfolder, getRandomTerrainComponent } from '../utils/terrain_utils';
import '../styles/GameBoard.css';

const GRID_SIZE = 4;
// Set --grid-size for css grid
document.documentElement.style.setProperty('--grid-size', GRID_SIZE.toString());

const GameBoard: FC = () => {
    const [isEditingKeybind, setIsEditingKeybind] = useState(false); // Track if keybinds are being edited
    const [grid, setGrid] = useState<TileProps[][]>([]);
    const [goalTile, setGoalTile] = useState<Coordinate | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [path, setPath] = useState<Coordinate[]>([]);
    const [pathIndex, setPathIndex] = useState(0);
    const [autoRestart, setAutoRestart] = useState(true);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (isEditingKeybind || isGameOver) return;
    
            switch (event.key) {
                case getKeybind('left'):
                    event.preventDefault();
                    placeRail('left');
                    break;
                case getKeybind('straight'):
                    event.preventDefault();
                    placeRail('straight');
                    break;
                case getKeybind('right'):
                    event.preventDefault();
                    placeRail('right');
                    break;
                case getKeybind('newGame'):
                    event.preventDefault();
                    initializeGame();
                    break;
                case getKeybind('toggleAutoRestart'):
                    event.preventDefault();
                    setAutoRestart(prev => !prev);
                    break;
                default:
                    break;
            }
        };
    
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isEditingKeybind, grid, goalTile, isGameOver, path, pathIndex, autoRestart]);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = (): void => {
        setIsGameOver(false);

        // Select a random terrain subfolder to use for all terrain tiles
        const randomSubfolder = getRandomTerrainSubfolder();

        // Generate a new grid of just terrain
        const newGrid: TileProps[][] = Array.from({ length: GRID_SIZE }, () =>
            Array.from({ length: GRID_SIZE }, () => ({ tile_type: 'terrain', TerrainComponent: getRandomTerrainComponent(randomSubfolder) }))
        );

        // If we can't generate a path,
        // we choose a new start and goal tile
        let path: Coordinate[] = [];
        let start: Coordinate = [0, 0];
        let goal: Coordinate = [0, 0];
        while (path.length === 0) {
            start = getRandomEdgeTile();
            goal = getRandomEdgeTile(start);
            path = generatePath(start, goal);
        }
        
        setPath(path);
        // The user starts at the tile after the start tile
        setPathIndex(1);
        setGoalTile(goal);
        setGrid(newGrid.map((row, rowIndex) =>
            row.map((tile_props, colIndex) => {
                if (start[0] === rowIndex && start[1] === colIndex) {
                    return { tile_type: 'start', rail_type: 'straight', direction: getDirection(start, path[1]) };
                }
                if (goal[0] === rowIndex && goal[1] === colIndex) {
                    return { tile_type: 'goal', rail_type: 'straight', direction: getDirection(path[path.length - 2], goal) };
                }
                if (path.some(p => p[0] === rowIndex && p[1] === colIndex)) {
                    return { tile_type: 'empty' };
                }
                return tile_props;
            })
        ));
    };

    const getRandomEdgeTile = (excludeTile: Coordinate | null = null): Coordinate => {
        const edges: Coordinate[] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            edges.push([0, i], [GRID_SIZE - 1, i], [i, 0], [i, GRID_SIZE - 1]);
        }
    
        const filteredEdges = edges.filter(tile => {
            if (!excludeTile) return true;
    
            // Calculate Manhattan distance between the current tile and the excluded tile
            const distance = Math.abs(tile[0] - excludeTile[0]) + Math.abs(tile[1] - excludeTile[1]);
            // Ensure the tiles don't start too close together
            return distance >= GRID_SIZE; 
        });
    
        return filteredEdges[Math.floor(Math.random() * filteredEdges.length)] as Coordinate;
    };

    const generatePath = (start: Coordinate, goal: Coordinate): Coordinate[] => {
        const MAX_RETRIES = 5;
        let retries = 0;
        
        while (retries < MAX_RETRIES) {
            const path = [start];
            let current = start;

            while (current[0] !== goal[0] || current[1] !== goal[1]) {
                const possibleMoves: Coordinate[] = [];
        
                // Add valid moves to the list of possible moves
                if (current[0] < GRID_SIZE - 1) possibleMoves.push([current[0] + 1, current[1]]); // Move down
                if (current[0] > 0) possibleMoves.push([current[0] - 1, current[1]]); // Move up
                if (current[1] < GRID_SIZE - 1) possibleMoves.push([current[0], current[1] + 1]); // Move right
                if (current[1] > 0) possibleMoves.push([current[0], current[1] - 1]); // Move left
        
                // Filter out moves that would backtrack to the previous position
                const previous = path[path.length - 2];
                const validMoves = possibleMoves.filter(
                    move => !previous || (move[0] !== previous[0] || move[1] !== previous[1])
                );
        
                // Filter out moves that would create loops or branches
                const nonBranchingMoves = validMoves.filter(move => {
                    const adjacentTiles = path.filter(
                        tile =>
                            Math.abs(tile[0] - move[0]) + Math.abs(tile[1] - move[1]) === 1
                    );
                    return adjacentTiles.length <= 1; // Ensure the move doesn't connect to more than one existing path tile
                });
        
                // Check if the goal is adjacent
                const goalAdjacentMove = nonBranchingMoves.find(
                    move => Math.abs(move[0] - goal[0]) + Math.abs(move[1] - goal[1]) === 1
                );
        
                if (goalAdjacentMove) {
                    // Add the tile adjacent to the goal
                    path.push(goalAdjacentMove);
        
                    // Add the goal tile to the path and terminate
                    path.push(goal);
                    return path;
                }
        
                // If no valid moves remain, break the loop (shouldn't happen with proper constraints)
                if (nonBranchingMoves.length === 0) {
                    console.error("No valid moves available to continue the path.");
                    break;
                }
        
                // Randomly pick a move, with a bias toward the goal
                const nextMove = nonBranchingMoves[Math.floor(Math.random() * nonBranchingMoves.length)];
        
                // Update the current position and add it to the path
                current = nextMove;
                path.push(current);
            }
            retries++;
        }
        return [];
    };

    const placeRail = (rail_type: RailType): void => {
        if (isGameOver || !goalTile) return;
    
        // Calculate the direction we're moving
        const prevPosition = path[pathIndex - 1];
        const currentPosition = path[pathIndex];
        const nextPosition = path[pathIndex + 1];
        const direction = getDirection(prevPosition, currentPosition);

        // Determine the correct rail_type for the currentPosition
        const nextDirection = getDirection(currentPosition, nextPosition);
        let correctRailType: RailType;
        if (nextDirection === direction) {
            correctRailType = 'straight';
        } else if (
            (direction === 'north' && nextDirection === 'east') ||
            (direction === 'east' && nextDirection === 'south') ||
            (direction === 'south' && nextDirection === 'west') ||
            (direction === 'west' && nextDirection === 'north')
        ) {
            correctRailType = 'right';
        } else {
            correctRailType = 'left';
        }

        const invalidMove = rail_type !== correctRailType;

        // Update the grid to mark the user's rail
        setGrid(prevGrid =>
            prevGrid.map((row, rowIndex) =>
                row.map((tile_props, colIndex) => {
                    if (rowIndex === currentPosition[0] && colIndex === currentPosition[1]) {
                        return { tile_type: 'rail', rail_type: rail_type, direction: direction, is_invalid: invalidMove };
                    }
                    return tile_props;
                })
            )
        );

        let game_over = false;
        if (invalidMove) {
            game_over = true;
        } else if (nextPosition[0] === goalTile[0] && nextPosition[1] === goalTile[1]) {
            game_over = true;
        }

        // Restart the game after 1 second if autoRestart is enabled
        if (game_over && autoRestart) {
            setTimeout(() => initializeGame(), 1000); 
        }

        setIsGameOver(game_over);

        // Increment the path index
        setPathIndex(pathIndex + 1);
    };

    return (
        <div>
            <Keybinds onEditingKeybind={setIsEditingKeybind} />
            <div className="game-board">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((tile, colIndex) => (
                            <Tile
                                key={colIndex}
                                tile_type={tile.tile_type}
                                rail_type={tile.rail_type}
                                direction={tile.direction}
                                is_invalid={tile.is_invalid}
                                TerrainComponent={tile.TerrainComponent}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={() => placeRail('left')} disabled={isGameOver}>
                    <div className="tile rail curved left"></div>
                </button>
                <button onClick={() => placeRail('straight')} disabled={isGameOver}>
                    <div className="tile rail straight"></div>
                </button>
                <button onClick={() => placeRail('right')} disabled={isGameOver}>
                    <div className="tile rail curved right"></div>
                </button>
            </div>
            <div className="controls">
                <button onClick={initializeGame}>New Game</button>
            </div>
            <div className="controls">
                <label>
                    <input
                        type="checkbox"
                        checked={autoRestart}
                        onChange={(e) => setAutoRestart(e.target.checked)}
                    />
                    Auto-Restart
                </label>
            </div>
        </div>
    );
};

export default GameBoard;