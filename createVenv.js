const { exec } = require('child_process');
const fs = require('fs');

// Check if the venv folder exists
if (!fs.existsSync('venv')) {
    console.log("Creating virtual environment...");
    exec('python -m venv venv', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating virtual environment: ${stderr}`);
            process.exit(1);
        }
        console.log("Virtual environment created successfully.");
    });
} else {
    console.log("Virtual environment already exists.");
}
