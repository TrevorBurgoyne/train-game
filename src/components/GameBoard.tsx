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
        // Simple path generation logic (for demonstration purposes)
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

    const handleTileClick = (row: number, col: number): void => {
        if (isGameOver) return;

        const newUserPath: Coordinate[] = [...userPath, [row, col]];
        setUserPath(newUserPath);

        if (!PathValidator.validatePath(newUserPath, startTile, goalTile)) {
            setIsGameOver(true);
        } else if (newUserPath.length === grid.flat().filter(tile => tile === 'empty').length) {
            alert('Congratulations! You completed the path!');
            setIsGameOver(true);
        }
    };

    return (
        <div className="game-board">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                    {row.map((tile, colIndex) => (
                        <Tile
                            key={colIndex}
                            row={rowIndex}
                            col={colIndex}
                            type={tile}
                            onClick={(r, c) => handleTileClick(r, c)} // Ensure correct typing
                        />
                    ))}
                </div>
            ))}
            {isGameOver && <div className="game-over">Game Over!</div>}
        </div>
    );
};

export default GameBoard;