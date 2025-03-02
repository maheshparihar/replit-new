// backend/server.js
const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

// Endpoint to execute code and Jest test cases
app.post('/execute', (req, res) => {
  const { code, testCases } = req.body;

  // Write code to a temporary file
  const codeFilePath = path.join(__dirname, 'tempCode.js');
  const testFilePath = path.join(__dirname, 'tempTest.js');

  fs.writeFileSync(codeFilePath, `const dynamicCode = ${code};\n`);

  // Create the Jest test file
  const testCode = `
    const dynamicCode = require('./tempCode'); // Import the dynamically generated code
    describe('Dynamic Tests', () => {
      ${testCases}
    });
  `;
  fs.writeFileSync(testFilePath, testCode);

  // Execute Jest tests
  exec('npx jest --silent --runInBand', (err, stdout, stderr) => {
    if (err) {
      console.error('Error executing Jest tests:', err);
      return res.status(500).json({ status: 'error', message: 'Test execution failed.' });
    }

    // Clean up temporary files
    fs.unlinkSync(codeFilePath);
    fs.unlinkSync(testFilePath);

    res.json({ status: 'success', result: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
