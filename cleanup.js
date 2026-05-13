const { exec } = require('child_process');
const os = require('os');

if (os.platform() === 'win32') {
  // Kill all node processes on Windows
  exec('taskkill /IM node.exe /F 2>nul', (err) => {
    console.log('Killed Node processes');
    setTimeout(() => process.exit(0), 1000);
  });
} else {
  // Kill on Unix
  exec('pkill -9 node', (err) => {
    console.log('Killed Node processes');
    setTimeout(() => process.exit(0), 1000);
  });
}
