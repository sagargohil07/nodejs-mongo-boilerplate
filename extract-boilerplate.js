const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = 'setup.txt';
const ROOT_DIR = __dirname;

// Files to include (relative to root)
const FILES_TO_EXTRACT = [
    '.env',
    'package.json',
    'tsconfig.json',
    'COMMANDS.md',
    '.gitignore',
    'src/app.ts',
    'src/config/database.ts',
    'src/controllers/auth.controller.ts',
    'src/controllers/user.controller.ts',
    'src/middlewares/auth.middleware.ts',
    'src/middlewares/error.middleware.ts',
    'src/middlewares/joi.middleware.ts',
    'src/middlewares/validation.middleware.ts',
    'src/models/user.model.ts',
    'src/routes/auth.routes.ts',
    'src/routes/user.routes.ts',
    'src/socket/socker.handler.ts',
    'src/types/express.d.ts',
    'src/utils/jwt.util.ts',
    'src/utils/response.util.ts',
    'src/validation/user.validation.ts'
];

// Delimiter to separate files
const FILE_DELIMITER = '\n<<<FILE_SEPARATOR>>>\n';
const FILE_START = '<<<FILE_START:';
const FILE_END = '>>>\n';

function extractBoilerplate() {
    console.log('🚀 Starting boilerplate extraction...\n');

    let output = '';
    let successCount = 0;
    let errorCount = 0;

    // Add metadata header
    output += `<<<BOILERPLATE_METADATA>>>\n`;
    output += `Generated: ${new Date().toISOString()}\n`;
    output += `Total Files: ${FILES_TO_EXTRACT.length}\n`;
    output += `<<<END_METADATA>>>\n${FILE_DELIMITER}`;

    // Extract each file
    FILES_TO_EXTRACT.forEach(filePath => {
        const fullPath = path.join(ROOT_DIR, filePath);

        try {
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');

                // Add file marker and content
                output += `${FILE_START}${filePath}${FILE_END}`;
                output += content;
                output += FILE_DELIMITER;

                console.log(`✅ Extracted: ${filePath}`);
                successCount++;
            } else {
                console.log(`⚠️  File not found: ${filePath}`);
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ Error reading ${filePath}:`, error.message);
            errorCount++;
        }
    });

    // Write output file
    try {
        fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
        console.log(`\n✨ Extraction complete!`);
        console.log(`📄 Output file: ${OUTPUT_FILE}`);
        console.log(`✅ Successfully extracted: ${successCount} files`);
        if (errorCount > 0) {
            console.log(`⚠️  Errors/Missing: ${errorCount} files`);
        }
        console.log(`📦 Total size: ${(output.length / 1024).toFixed(2)} KB`);
    } catch (error) {
        console.error('❌ Error writing output file:', error.message);
        process.exit(1);
    }
}

// Run extraction
extractBoilerplate();
