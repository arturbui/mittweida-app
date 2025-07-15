import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');

console.log('Resetting all data');

const submissionsFile = path.join(dataDir, 'submissions.json');
if (fs.existsSync(submissionsFile)) {
    fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
    console.log('Cleared submissions.json');
}

const usersFile = path.join(dataDir, 'users.json');
if (fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    console.log('Cleared users.json');
}


if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
        fs.unlinkSync(path.join(uploadsDir, file));
    });
    console.log(`Cleared ${files.length} uploaded files`);
} else {
    console.log('Uploads directory does not exist');
}

console.log('Reset complete!');