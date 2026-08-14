const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const RESULTS_FILE = path.join(__dirname, 'results.json');

function readResults() {
    try {
    const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    } catch (e) {}
    return [];
}

function writeResults(arr) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

app.post('/save-result', (req, res) => {
    const { counter, total, when } = req.body || {};
    if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'invalid total' });
    }
    const results = readResults();
    results.unshift({ counter: Number(counter) || 0, total: Number(total) || 0, when: when || new Date().toISOString() });
    if (results.length > 500) results.length = 500;
    try {
    writeResults(results);
    res.json({ ok: true });
    } catch (e) {
    res.status(500).json({ error: 'write failed' });
    }
});

// scan images directory and return relative paths
app.get('/scan-images', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    try {
        const files = fs.readdirSync(imagesDir, { withFileTypes: true })
            .filter((d) => d.isFile())
            .map((d) => d.name)
            .filter((n) => /\.(png|jpe?g|webp|gif)$/i.test(n))
            .map((n) => path.posix.join('images', n));
        res.json(files);
    } catch (e) {
        res.status(500).json({ error: 'scan failed' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Results server listening on http://localhost:${port}`));
