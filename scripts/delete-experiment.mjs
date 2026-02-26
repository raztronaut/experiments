import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const experimentName = process.argv[2];

if (!experimentName) {
    console.error("Please provide an experiment name, e.g., 'npm run delete:experiment fluid-sim'");
    process.exit(1);
}

const safeName = experimentName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
// Directories to target
const groupDir = path.join(__dirname, '../src/app/experiments', `(${safeName})`);
const componentsDir = path.join(__dirname, '../src/components/experiments', safeName);
const publicDir = path.join(__dirname, '../public/experiments', safeName);
const registryFile = path.join(__dirname, '../public/registry', `${safeName}.json`);

if (!fs.existsSync(groupDir)) {
    console.error(`Experiment "${safeName}" does not exist at ${groupDir}`);
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(`Are you sure you want to delete the experiment "${safeName}"? This action cannot be undone. (y/N) `, (answer) => {
    if (answer.toLowerCase() !== 'y') {
        console.log('Deletion cancelled.');
        rl.close();
        process.exit(0);
    }

    console.log(`\nDeleting experiment "${safeName}"...`);

    // 1. Delete the Route Group directory (Includes page, layout, error, and experiment.json)
    try {
        if (fs.existsSync(groupDir)) {
            fs.rmSync(groupDir, { recursive: true, force: true });
            console.log(`✅ Deleted route: ${groupDir}`);
        }
    } catch (err) {
        console.error(`❌ Error deleting route: ${err.message}`);
    }

    // 2. Delete Components Directory
    try {
        if (fs.existsSync(componentsDir)) {
            fs.rmSync(componentsDir, { recursive: true, force: true });
            console.log(`✅ Deleted components: ${componentsDir}`);
        }
    } catch (err) {
        console.error(`❌ Error deleting components: ${err.message}`);
    }

    // 3. Delete Public Assets Directory
    try {
        if (fs.existsSync(publicDir)) {
            fs.rmSync(publicDir, { recursive: true, force: true });
            console.log(`✅ Deleted assets: ${publicDir}`);
        }
    } catch (err) {
        console.error(`❌ Error deleting assets: ${err.message}`);
    }

    // 4. Delete Registry JSON
    try {
        if (fs.existsSync(registryFile)) {
            fs.unlinkSync(registryFile);
            console.log(`✅ Deleted registry file: ${registryFile}`);
        }
    } catch (err) {
        console.error(`❌ Error deleting registry file: ${err.message}`);
    }

    console.log(`\n✨ Experiment "${safeName}" deleted successfully.`);
    console.log(`   (Run "npm run generate:registry" to update the registry index)`);
    rl.close();
});
