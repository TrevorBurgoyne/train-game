// Function to choose a random terrain subfolder in the components/terrain folder
// During the build process, the terrain components are imported and stored in a map
import React from 'react';
import terrainMap from '../components/terrain/terrainMap.json';

export const getRandomTerrainSubfolder = (): string => {
    const subfolders = Object.keys(terrainMap);
    return subfolders[Math.floor(Math.random() * subfolders.length)];
};

export const getRandomTerrainComponent = (subfolder: string): React.FC => {
    const components = terrainMap[subfolder as keyof typeof terrainMap];
    const randomComponent = components[Math.floor(Math.random() * components.length)];
    const component = require(`../components/terrain/${subfolder}/${randomComponent}`).default;
    return component;
};