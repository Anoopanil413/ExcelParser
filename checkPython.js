import {exec} from 'child_process';

exec('python --version', (error, stdout, stderr) => {
  if (error) {
    console.error("Python is not installed globally. Please install Python to continue.");
    process.exit(1);  
  } else {
    console.log(`Python version: ${stdout}`);
  }
});
