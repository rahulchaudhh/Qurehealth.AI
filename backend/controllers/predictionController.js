
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Path to the virtual environment python interpreter
const pythonExe = path.join(__dirname, '../../.venv/bin/python3');

exports.predictDisease = (req, res) => {
    const inputData = req.body;

    // Validate input (basic check)
    if (!inputData || Object.keys(inputData).length === 0) {
        return res.status(400).json({ error: 'No input data provided' });
    }

    const scriptPath = path.join(__dirname, '../scripts/predict.py');

    // Spawn Python process from virtual environment
    const pythonProcess = spawn(pythonExe, [scriptPath]);

    let dataString = '';
    let errorString = '';

    // Write input to stdin
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${errorString}`);
            return res.status(500).json({ error: 'Prediction failed', details: errorString });
        }

        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            res.json(result);
        } catch (e) {
            console.error('Failed to parse Python output:', dataString);
            res.status(500).json({ error: 'Failed to parse prediction result' });
        }
    });
};

exports.getSymptoms = (req, res) => {
    const scriptPath = path.join(__dirname, '../scripts/predict.py');
    const pythonProcess = spawn(pythonExe, [scriptPath, 'symptoms']);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}: ${errorString}`);
            return res.status(500).json({ error: 'Failed to fetch symptoms', details: errorString });
        }

        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            res.json(result);
        } catch (e) {
            console.error('Failed to parse Python output:', dataString);
            res.status(500).json({ error: 'Failed to parse symptoms list' });
        }
    });
};
 