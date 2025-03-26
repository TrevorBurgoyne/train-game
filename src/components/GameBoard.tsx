import React, { FC, useState, useEffect } from 'react';
import Tile from './Tile';
import PathValidator from '../utils/PathValidator'; // Ensure correct import

type TileType = 'obstacle' | 'empty';
type Coordinate = [number, number];

const GRID_SIZE = 4;

const GameBoard: FC = () => {
    const [grid, setGrid] = useState<TileType[][]>([]);
    const [startTile, setStartTile] = useState<Coordinate | null>(null);
    const [goalTile, setGoalTile] = useState<Coordinate | null>(null);
    const [userPath, setUserPath] = useState<Coordinate[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);

    useEffect(() => {
        // Set --grid-size for css grid
        document.documentElement.style.setProperty('--grid-size', GRID_SIZE.toString());
        initializeGame();
    }, []);

    const initializeGame = (): void => {
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('obstacle') as TileType[]);
        const start = getRandomEdgeTile();
        const goal = getRandomEdgeTile(start);
        const path = generatePath(start, goal);

        setStartTile(start);
        setGoalTile(goal);
        setCurrentPosition(start); // Set the starting position
        setGrid(newGrid.map((row, rowIndex) => 
            row.map((tile, colIndex) => 
                path.some(p => p[0] === rowIndex && p[1] === colIndex) ? 'empty' : tile
            )
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

    const handleMove = (direction: 'left' | 'straight' | 'right'): void => {
        if (isGameOver || !currentPosition || !startTile || !goalTile) return;

        const [row, col] = currentPosition;
        let nextPosition: Coordinate | null = null;

        // Determine the next position based on the direction
        if (direction === 'straight') {
            nextPosition = [row + 1, col]; // Example: Move down
        } else if (direction === 'left') {
            nextPosition = [row, col - 1]; // Example: Move left
        } else if (direction === 'right') {
            nextPosition = [row, col + 1]; // Example: Move right
        }

        if (nextPosition) {
            const newUserPath: Coordinate[] = [...userPath, nextPosition];
            setUserPath(newUserPath);
            setCurrentPosition(nextPosition);

            if (!PathValidator.validatePath(newUserPath, startTile, goalTile)) {
                setIsGameOver(true);
                alert('Game Over! You made an invalid move.');
            } else if (nextPosition[0] === goalTile[0] && nextPosition[1] === goalTile[1]) {
                alert('Congratulations! You completed the path!');
                setIsGameOver(true);
            }
        }
    };

    return (
        <div>
            <div className="game-board">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((tile, colIndex) => (
                            <Tile
                                key={colIndex}
                                row={rowIndex}
                                col={colIndex}
                                type={tile}
                                onClick={() => {}}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={() => handleMove('left')} disabled={isGameOver}>Left</button>
                <button onClick={() => handleMove('straight')} disabled={isGameOver}>Straight</button>
                <button onClick={() => handleMove('right')} disabled={isGameOver}>Right</button>
            </div>
        </div>
    );
};

export default GameBoard;