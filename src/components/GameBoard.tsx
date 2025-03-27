import React, { FC, useState, useEffect } from 'react';
import Tile, { TileProps, RailType, Coordinate, getDirection } from './Tile';
import PathValidator from '../utils/PathValidator'; // Ensure correct import

const GRID_SIZE = 4;

const GameBoard: FC = () => {
    const [grid, setGrid] = useState<TileProps[][]>([]);
    const [goalTile, setGoalTile] = useState<Coordinate | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [path, setPath] = useState<Coordinate[]>([]);
    const [pathIndex, setPathIndex] = useState(0);

    useEffect(() => {
        // Set --grid-size for css grid
        document.documentElement.style.setProperty('--grid-size', GRID_SIZE.toString());
        initializeGame();
    }, []);

    const initializeGame = (): void => {
        // Generate a new grid of obstacles
        const newGrid: TileProps[][] = Array.from({ length: GRID_SIZE }, () =>
            Array.from({ length: GRID_SIZE }, () => ({ tile_type: 'obstacle', rail_type: null, direction: null }))
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
                    return { tile_type: 'empty', rail_type: null, direction: null };
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
        const filteredEdges = edges.filter(tile => !excludeTile || (tile[0] !== excludeTile[0] || tile[1] !== excludeTile[1]));
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
        const direction = getDirection(prevPosition, currentPosition);
    
        // Update the grid to mark the user's rail
        setGrid(prevGrid =>
            prevGrid.map((row, rowIndex) =>
                row.map((tile_props, colIndex) => {
                    if (rowIndex === currentPosition[0] && colIndex === currentPosition[1]) {
                        return { tile_type: 'rail', rail_type: rail_type, direction: direction };
                    }
                    return tile_props;
                })
            )
        );

        // Increment the path index
        setPathIndex(pathIndex + 1);
    
        // if (!PathValidator.validatePath(startTile, goalTile)) {
        //     setIsGameOver(true);
        //     alert('Game Over! You made an invalid move.');
        // } else if (nextPosition[0] === goalTile[0] && nextPosition[1] === goalTile[1]) {
        //     alert('Congratulations! You completed the path!');
        //     setIsGameOver(true);
        // }
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
        </div>
    );
};

export default GameBoard;