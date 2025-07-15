import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
}

const submissionsFile = path.join(dataDir, 'submissions.json');
const usersFile = path.join(dataDir, 'users.json');

let submissions = [];
let users = [];

try {
    if (fs.existsSync(submissionsFile)) {
        const data = fs.readFileSync(submissionsFile, 'utf8');
        submissions = JSON.parse(data);
        console.log('Loaded', submissions.length, 'submissions from file');
    }
} catch (error) {
    console.error('Error loading submissions:', error);
}

try {
    if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf8');
        users = JSON.parse(data);
        console.log('Loaded', users.length, 'users from file');
    }
} catch (error) {
    console.error('Error loading users:', error);
}

const saveSubmissions = () => {
    try {
        fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
        console.log('Saved submissions to file');
    } catch (error) {
        console.error('Error saving submissions:', error);
    }
};

const saveUsers = () => {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        console.log('Saved users to file');
    } catch (error) {
        console.error('Error saving users:', error);
    }
};


app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

app.use('/uploads', (req, res, next) => {
    console.log('Serving static file:', req.url);
    const filePath = path.join(uploadsDir, req.url);

    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return res.status(404).json({ error: 'File not found' });
    }

    res.set({
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
    });

    next();
}, express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('📸 Saving file as:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const dailyChallenges = [
    {
        id: 1,
        title: "Go to the University of Mittweida",
        description: "Visit the main campus and take a photo",
        funFact: "The University of Mittweida was founded in 1867 and is one of the oldest technical universities in Germany!",
        date: "2025-01-07"
    },
    {
        id: 2,
        title: "Find the Historic Town Square",
        description: "Explore Mittweida's charming town center",
        funFact: "Mittweida's town square features beautiful medieval architecture from the 13th century!",
        date: "2025-01-08"
    },
    {
        id: 3,
        title: "Visit the Local Museum",
        description: "Learn about the rich history of the region",
        funFact: "The museum houses artifacts dating back over 800 years!",
        date: "2025-01-09"
    }
];

app.get('/api/daily-challenge', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let todayChallenge = dailyChallenges.find(ch => ch.date === today);
        if (!todayChallenge) {
            const dayIndex = new Date().getDate() % dailyChallenges.length;
            todayChallenge = dailyChallenges[dayIndex];
        }
        console.log('Returning daily challenge:', todayChallenge.title);
        res.json(todayChallenge);
    } catch (error) {
        console.error('Error in daily-challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/create-account', (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('👤 Creating account for:', email);

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            streak: 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers();
        console.log('Account created successfully for:', email);
        res.json({ message: 'Account created successfully', user: { id: newUser.id, name, email } });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upload-submission', upload.single('photo'), (req, res) => {
    try {
        console.log('Upload submission request received');
        console.log('Request body:', req.body);
        console.log('File info:', req.file ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        } : 'No file');

        const { challengeId, userId, userName } = req.body;

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!challengeId || !userId) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields: challengeId and userId' });
        }

        const filePath = path.join(uploadsDir, req.file.filename);
        if (!fs.existsSync(filePath)) {
            console.log('File was not saved properly:', filePath);
            return res.status(500).json({ error: 'File upload failed' });
        }

        const submission = {
            id: submissions.length + 1,
            challengeId: parseInt(challengeId),
            userId: parseInt(userId),
            userName: userName || 'Anonymous',
            photoUrl: `/uploads/${req.file.filename}`,
            submittedAt: new Date().toISOString(),
            timestamp: new Date().toLocaleTimeString()
        };

        submissions.push(submission);
        saveSubmissions();
        console.log('Submission saved:', submission);
        console.log('File saved at:', filePath);
        console.log('Total submissions now:', submissions.length);

        const user = users.find(u => u.id === parseInt(userId));
        if (user) {
            user.streak += 1;
            saveUsers();
            console.log('Updated user streak:', user.streak);
        }

        res.json({ message: 'Submission uploaded successfully', submission });
    } catch (error) {
        console.error('Error uploading submission:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

app.get('/api/submissions', (req, res) => {
    try {
        console.log('Submissions request - Total submissions:', submissions.length);

        const allSubmissions = submissions.map(submission => {
            const filename = submission.photoUrl.replace('/uploads/', '');
            const filePath = path.join(uploadsDir, filename);
            const fileExists = fs.existsSync(filePath);

            console.log(`Submission ${submission.id}: ${filename} - File exists: ${fileExists}`);

            return {
                ...submission,
                fileExists
            };
        }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        console.log('Returning submissions:', allSubmissions.length);
        res.json(allSubmissions);
    } catch (error) {
        console.error('Error getting submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/leaderboard', (req, res) => {
    try {
        const sortedUsers = users.sort((a, b) => b.streak - a.streak);
        const leaderboard = sortedUsers.map((user, index) => ({
            rank: index + 1,
            name: user.name,
            streak: user.streak
        }));
        console.log('Returning leaderboard:', leaderboard.length, 'users');
        res.json(leaderboard);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/health', (req, res) => {
    const uploadFiles = fs.readdirSync(uploadsDir);
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uploadsDir: uploadsDir,
        submissions: submissions.length,
        users: users.length,
        uploadedFiles: uploadFiles.length,
        files: uploadFiles
    });
});

app.get('/api/debug/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const fileDetails = files.map(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                url: `/uploads/${file}`
            };
        });
        res.json({ files: fileDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/test-submission', (req, res) => {
    try {
        const testSubmission = {
            id: submissions.length + 1,
            challengeId: 1,
            userId: 1,
            userName: 'Test User',
            photoUrl: '/uploads/test-image.jpg',
            submittedAt: new Date().toISOString(),
            timestamp: new Date().toLocaleTimeString()
        };

        submissions.push(testSubmission);
        saveSubmissions();
        console.log('Test submission created:', testSubmission);

        res.json({ message: 'Test submission created', submission: testSubmission });
    } catch (error) {
        console.error('Error creating test submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'Mittweida App Server is running!',
        status: 'OK',
        timestamp: new Date().toISOString(),
        stats: {
            submissions: submissions.length,
            users: users.length,
            uploadedFiles: fs.readdirSync(uploadsDir).length
        },
        availableEndpoints: [
            'GET /api/daily-challenge',
            'POST /api/create-account',
            'POST /api/upload-submission',
            'GET /api/submissions',
            'GET /api/leaderboard',
            'GET /api/health',
            'GET /api/debug/files',
            'POST /api/test-submission'
        ]
    });
});

app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Current stats: ${submissions.length} submissions, ${users.length} users`);
    console.log(`CORS enabled for: http://localhost:5173, http://localhost:3000`);
});

app.get('/api/user/:userId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

