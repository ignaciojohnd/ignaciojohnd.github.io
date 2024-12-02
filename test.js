const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');

async function readGutenbergPoetry(filePath) {
    const allLines = [];
    const fileStream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            allLines.push(JSON.parse(line.trim()));
        } catch (error) {
            console.error('Error parsing line:', error);
        }
    }

    console.log(allLines.length);

    // Shuffle the array
    for (let i = allLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
    }

    // Pick the first n items
    const n = 10;
    const selectedItems = allLines.slice(0, n);
    console.log(selectedItems);

    return selectedItems;
}

// Usage
readGutenbergPoetry('gutenberg-poetry-v001.ndjson.gz')
    .then(() => console.log('Done'))
    .catch(console.error);