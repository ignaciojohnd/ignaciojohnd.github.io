let poetryLines = [];

async function readGutenbergPoetry(file) {
    if (!(file instanceof File)) {
        console.error('Invalid file input');
        return [];
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                
                // Decompress the file
                const decompressed = await new Response(
                    new Blob([arrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
                ).arrayBuffer();

                // Convert to text
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(decompressed);
                
                // Split into lines and parse
                const allLines = text.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => JSON.parse(line));

                // Shuffle the array (Fisher-Yates shuffle)
                for (let i = allLines.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
                }

                // Select first 10 items and extract text
                const selectedItems = allLines.slice(0, 10);
                poetryLines = selectedItems.map(item => {
                    // Try to extract meaningful text
                    return item.text || 
                           `${item.title || 'Untitled Poem'}\n${item.text || 'No text available'}` ||
                           'Unable to extract poem';
                });

                console.log(poetryLines.length + " poems loaded");
                resolve(poetryLines);
            } catch (error) {
                console.error('Error processing file:', error);
                reject(error);
            }
        };

        reader.onerror = (error) => {
            console.error('File reading error:', error);
            reject(error);
        };

        // Read the file as ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
}

// Add file input to the page
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.gz';
    fileInput.style.position = 'fixed';
    fileInput.style.top = '10px';
    fileInput.style.left = '10px';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await readGutenbergPoetry(file);
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to process the poetry file');
            }
        }
    });
});