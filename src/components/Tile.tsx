import React, { FC } from 'react';

type TileProps = {
    row: number;
    col: number;
    type: 'obstacle' | 'empty' | 'start' | 'goal';
    onClick: (row: number, col: number) => void;
};

const Tile: FC<TileProps> = ({ row, col, type, onClick }) => {
    return (
        <div
            className={`tile ${type}`}
            onClick={() => onClick(row, col)}
        >
            {/* Optionally render content for start/goal tiles */}
            {type === 'start' && 'S'}
            {type === 'goal' && 'G'}
        </div>
    );
};

export default Tile;