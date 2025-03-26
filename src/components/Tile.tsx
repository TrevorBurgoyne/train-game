import React, { FC } from 'react';

type TileProps = {
    row: number;
    col: number;
    type: 'obstacle' | 'empty';
    onClick: (row: number, col: number) => void;
};

const Tile: FC<TileProps> = ({ row, col, type, onClick }) => {
    return (
        <div
            className={`tile ${type}`}
            onClick={() => onClick(row, col)}
        >
            {/* Render tile content */}
        </div>
    );
};

export default Tile;