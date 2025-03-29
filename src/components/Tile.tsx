import { FC } from 'react';
import '../styles/Tile.css';
import '../styles/Rail.css';

export type TileType = 'terrain' | 'empty' | 'start' | 'goal' | 'rail';
export type RailType = 'straight' | 'left' | 'right';
export type Direction = 'north' | 'east' | 'south' | 'west';
export type Coordinate = [number, number];
export type TileProps = {
    tile_type: TileType;
    rail_type?: RailType;
    direction?: Direction;
    is_invalid?: boolean;
    TerrainComponent?: React.FC;
};

// Function to get the direction based on a dest and source coordinate
export const getDirection = (source: Coordinate, dest: Coordinate): Direction => {
    if (source[0] < dest[0]) return 'east';
    if (source[0] > dest[0]) return 'west';
    if (source[1] < dest[1]) return 'south';
    if (source[1] > dest[1]) return 'north';
    throw new Error('Invalid coordinates');
}

const Tile: FC<TileProps> = ({tile_type, rail_type = null, direction = null, is_invalid = false, TerrainComponent = null}) => {
    // Add 'rail' tyle to the goal
    let tile_class: String = tile_type;
    if (tile_type === 'goal' || tile_type === 'start') {
        tile_class = `${tile_type} rail`;
    }
    
    // Add 'curved' class if rail_type is not null and not 'straight'
    let rail_class: String | null = rail_type;
    if (rail_type !== null && rail_type !== 'straight') {
        rail_class = `curved ${rail_type}`;
    }
    
    return (
        <div className={`tile ${tile_class} ${rail_class} ${direction}`}>
            {is_invalid && <div className="invalid-overlay"></div>}
            {TerrainComponent && <TerrainComponent />}
        </div>
    );
};

export default Tile;