const fs = require('fs');
const path = require('path');

const terrainPath = path.join(__dirname, 'src/components/terrain');
const outputPath = path.join(terrainPath, 'terrainMap.json');

const generateTerrainMap = () => {
    const subfolders = fs.readdirSync(terrainPath).filter((file) => {
        return fs.statSync(path.join(terrainPath, file)).isDirectory();
    });

    const terrainMap = {};
    subfolders.forEach((subfolder) => {
        const subfolderPath = path.join(terrainPath, subfolder);
        const files = fs.readdirSync(subfolderPath).filter((file) => file.endsWith('.tsx'));
        terrainMap[subfolder] = files.map((file) => path.basename(file, '.tsx'));
    });

    fs.writeFileSync(outputPath, JSON.stringify(terrainMap, null, 2));
    console.log(`Terrain map generated at ${outputPath}`);
};

generateTerrainMap();