const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = 'boilerplate-snapshot.txt';
const OUTPUT_DIR = 'generated-boilerplate';

// Delimiters (must match extract-boilerplate.js)
const FILE_DELIMITER = '\n<<<FILE_SEPARATOR>>>\n';
const FILE_START = '<<<FILE_START:';
const FILE_END = '>>>\n';

function ensureDirectoryExists(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

function setupBoilerplate() {
    console.log('🚀 Starting boilerplate setup...\n');

    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ Error: ${INPUT_FILE} not found!`);
        console.log('💡 Please run extract-boilerplate.js first to generate the snapshot file.');
        process.exit(1);
    }

    // Read the snapshot file
    let content;
    try {
        content = fs.readFileSync(INPUT_FILE, 'utf8');
        console.log(`📄 Reading snapshot file: ${INPUT_FILE}`);
    } catch (error) {
        console.error('❌ Error reading snapshot file:', error.message);
        process.exit(1);
    }

    // Create output directory
    if (fs.existsSync(OUTPUT_DIR)) {
        console.log(`⚠️  Output directory already exists: ${OUTPUT_DIR}`);
        console.log('🗑️  Cleaning up old files...');
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);

    // Split content by file delimiter
    const sections = content.split(FILE_DELIMITER);

    let successCount = 0;
    let errorCount = 0;
    let metadata = null;

    sections.forEach(section => {
        section = section.trim();
        if (!section) return;

        // Parse metadata
        if (section.startsWith('<<<BOILERPLATE_METADATA>>>')) {
            const metadataEnd = section.indexOf('<<<END_METADATA>>>');
            if (metadataEnd !== -1) {
                metadata = section.substring(0, metadataEnd + '<<<END_METADATA>>>'.length);
                console.log('📋 Metadata found:');
                console.log(metadata.replace(/<<<BOILERPLATE_METADATA>>>\n/, '').replace(/<<<END_METADATA>>>/, ''));
                console.log('');
                return;
            }
        }

        // Parse file sections
        if (section.startsWith(FILE_START)) {
            const filePathEnd = section.indexOf(FILE_END);
            if (filePathEnd === -1) {
                console.error('⚠️  Malformed file section (missing end marker)');
                errorCount++;
                return;
            }

            const filePath = section.substring(FILE_START.length, filePathEnd);
            const fileContent = section.substring(filePathEnd + FILE_END.length);

            try {
                const outputPath = path.join(OUTPUT_DIR, filePath);
                ensureDirectoryExists(outputPath);
                fs.writeFileSync(outputPath, fileContent, 'utf8');
                console.log(`✅ Created: ${filePath}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error creating ${filePath}:`, error.message);
                errorCount++;
            }
        }
    });

    // Summary
    console.log(`\n✨ Setup complete!`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log(`✅ Successfully created: ${successCount} files`);
    if (errorCount > 0) {
        console.log(`❌ Errors: ${errorCount} files`);
    }

    console.log(`\n📝 Next steps:`);
    console.log(`   1. cd ${OUTPUT_DIR}`);
    console.log(`   2. npm install`);
    console.log(`   3. Update .env with your MongoDB URI and secrets`);
    console.log(`   4. npm run dev`);
}

// Run setup
setupBoilerplate();
