import { FC, useState, useEffect } from 'react';
import Tile, { TileProps, RailType, Coordinate, getDirection } from './Tile';

const GRID_SIZE = 4;

const GameBoard: FC = () => {
    const [grid, setGrid] = useState<TileProps[][]>([]);
    const [goalTile, setGoalTile] = useState<Coordinate | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [path, setPath] = useState<Coordinate[]>([]);
    const [pathIndex, setPathIndex] = useState(0);
    const [autoRestart, setAutoRestart] = useState(true);

    useEffect(() => {
        // Set --grid-size for css grid
        document.documentElement.style.setProperty('--grid-size', GRID_SIZE.toString());
        initializeGame();
    }, []);

    const initializeGame = (): void => {
        setIsGameOver(false);

        // Generate a new grid of obstacles
        const newGrid: TileProps[][] = Array.from({ length: GRID_SIZE }, () =>
            Array.from({ length: GRID_SIZE }, () => ({ tile_type: 'obstacle' }))
        );
        const start = getRandomEdgeTile();
        const goal = getRandomEdgeTile(start);
        const path = generatePath(start, goal);
        
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
        // Simple path generation logic
        const path = [start];
        let current = start;

        while (current[0] !== goal[0] || current[1] !== goal[1]) {
            if (current[0] < goal[0]) current = [current[0] + 1, current[1]];
            else if (current[0] > goal[0]) current = [current[0] - 1, current[1]];
            else if (current[1] < goal[1]) current = [current[0], current[1] + 1];
            else if (current[1] > goal[1]) current = [current[0], current[1] - 1];
            path.push(current);
        }

        return path;
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
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={() => placeRail('left')} disabled={isGameOver}>Left</button>
                <button onClick={() => placeRail('straight')} disabled={isGameOver}>Straight</button>
                <button onClick={() => placeRail('right')} disabled={isGameOver}>Right</button>
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