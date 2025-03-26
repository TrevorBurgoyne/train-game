import React from 'react';

interface PathValidatorProps {
    selectedTiles: string[];
    path: string[];
}

const PathValidator: React.FC<PathValidatorProps> = ({ selectedTiles, path }) => {
    const isValidPath = () => {
        if (selectedTiles.length !== path.length) {
            return false;
        }
        return selectedTiles.every((tile, index) => tile === path[index]);
    };

    return (
        <div>
            {isValidPath() ? (
                <p>Congratulations! You've completed the path successfully!</p>
            ) : (
                <p>Oops! The path is incorrect. Try again!</p>
            )}
        </div>
    );
};

export default PathValidator;