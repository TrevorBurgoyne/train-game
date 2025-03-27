import React, { FC } from 'react';

export type TileType = 'obstacle' | 'empty' | 'start' | 'goal' | 'rail';
export type RailType = 'straight' | 'left' | 'right';
export type Direction = 'north' | 'east' | 'south' | 'west';
export type Coordinate = [number, number];
export type TileProps = {
    tile_type: TileType;
    rail_type: RailType | null;
    direction: Direction | null;
};

// Function to get the direction based on a dest and source coordinate
export const getDirection = (source: Coordinate, dest: Coordinate): Direction => {
    console.log(source, dest);
    if (source[0] < dest[0]) return 'east';
    if (source[0] > dest[0]) return 'west';
    if (source[1] < dest[1]) return 'south';
    if (source[1] > dest[1]) return 'north';
    throw new Error('Invalid coordinates');
}

const Tile: FC<TileProps> = ({tile_type, rail_type = null, direction = null }) => {
    return (
        <div
            className={`tile ${tile_type} ${rail_type}-${direction}`}
        />
    );
};

export default Tile;