const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

const AE_BINARY = "C:\\Program Files\\Adobe\\Adobe After Effects 2026\\Support Files\\aerender.exe";
const SCANNER_SCRIPT = "C:\\Users\\David\\GitHubProjects\\nexrender\\scanner.jsx";
const PREPARE_SCRIPT = "C:\\Users\\David\\GitHubProjects\\nexrender\\prepare_template.jsx";
const MANIFEST_PATH = "C:\\Users\\David\\GitHubProjects\\nexrender\\template_manifest.json";

app.use(express.static('public'));
app.use(express.json());

// 2. PREPARE TEMPLATE (Essential Graphics)
app.post('/api/prepare-template', (req, res) => {
    console.log(`[PREPARE] Triggering Essential Graphics preparation...`);

    const bootstrapperPath = path.join(process.cwd(), 'prepare_bootstrapper.jsx');
    const escapedPreparePath = PREPARE_SCRIPT.replace(/\\/g, '/');

    // This assumes AE is already open with the project from the scan phase
    const bootstrapperContent = `
        try {
            $.evalFile(new File("${escapedPreparePath}"));
        } catch(e) {
            var f = new File("C:/Users/David/GitHubProjects/nexrender/scanner_debug.log");
            f.open("a");
            f.writeln("PREPARE ERROR: " + e.toString());
            f.close();
        }
    `;
    fs.writeFileSync(bootstrapperPath, bootstrapperContent);

    const AE_GUI = "C:\\Program Files\\Adobe\\Adobe After Effects 2026\\Support Files\\AfterFX.exe";

    // We run it with -r on the already open instance
    const aeProcess = spawn(AE_GUI, ["-r", bootstrapperPath], { detached: true, stdio: 'ignore' });
    aeProcess.unref();

    res.json({ message: "Preparation started..." });
});

// 1. RECEIVE & LAUNCH (Don't wait!)
app.post('/api/upload-template', upload.single('template'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const uploadedPath = path.resolve(req.file.path + ext);
    fs.renameSync(req.file.path, uploadedPath);

    console.log(`[UPLOAD] Received: ${uploadedPath}`);

    // CLONE FIX: If it's an .aet, we MUST clone it to .aep for After Effects to open it via CLI
    let scanPath = uploadedPath;
    if (ext === '.aet') {
        scanPath = uploadedPath.replace('.aet', '_scan.aep');
        fs.copyFileSync(uploadedPath, scanPath);
        console.log(`[LAZY-FIX] Cloned .aet to .aep: ${scanPath}`);
    }

    startScan(scanPath);
    res.json({ message: "Upload successful. Scan started in background...", status: "processing" });
});

// 1b. SCAN LOCAL PATH (Keeping this as a backup)
app.post('/api/scan-path', (req, res) => {
    const { path: aepPath } = req.body;
    if (!aepPath) return res.status(400).json({ error: "No path provided" });
    
    startScan(aepPath);
    res.json({ message: "Scan started for local path...", status: "processing" });
});

function startScan(aepPath) {
    if (fs.existsSync(MANIFEST_PATH)) fs.unlinkSync(MANIFEST_PATH);

    console.log(`[LAZY-SCAN] Launching AE for: ${aepPath}`);

    const bootstrapperPath = path.join(process.cwd(), 'bootstrapper.jsx');
    const escapedAepPath = aepPath.replace(/\\/g, '/');
    const escapedScannerPath = SCANNER_SCRIPT.replace(/\\/g, '/');
    const escapedPreparePath = PREPARE_SCRIPT.replace(/\\/g, '/');
    
    // CHAINED: Open -> Wait -> Scan -> Prepare -> Save
    const bootstrapperContent = `
        try {
            app.beginSuppressDialogs();
            var file = new File("${escapedAepPath}");
            if (file.exists) {
                app.open(file);
                // More robust wait for large projects
                $.sleep(10000); 
                $.evalFile(new File("${escapedScannerPath}"));
                $.sleep(3000);
                $.evalFile(new File("${escapedPreparePath}"));
            }
            app.endSuppressDialogs(false);
        } catch(e) {
            var f = new File("C:/Users/David/GitHubProjects/nexrender/scanner_debug.log");
            f.open("a");
            f.writeln("BOOTSTRAP ERROR: " + e.toString());
            f.close();
        }
    `;
    fs.writeFileSync(bootstrapperPath, bootstrapperContent);

    const AE_GUI = "C:\\Program Files\\Adobe\\Adobe After Effects 2026\\Support Files\\AfterFX.exe";
    const aeProcess = spawn(AE_GUI, ["-r", bootstrapperPath], { detached: true, stdio: 'ignore' });
    aeProcess.unref();
}

app.get('/api/check-status', (req, res) => {
    if (fs.existsSync(MANIFEST_PATH)) {
        const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        res.json({ status: "complete", manifest: manifest });
    } else {
        res.json({ status: "processing" });
    }
});

app.listen(5000, () => console.log(`Lazy Server Ready on Port 5000`));
