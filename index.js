const express = require("express");
const { exec } = require("child_process");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

// Function to clean up temporary files after Jest execution
const cleanUpFiles = () => {
  try {
    const codeFilePath = path.join(__dirname, "tempCode.js"); // Create tempCode.js in the root
    const testFilePath = path.join(__dirname, "tempTest.js"); // Create tempTest.js in the root

    if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath); // Delete the code file
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath); // Delete the test case file
  } catch (err) {
    console.error("Error cleaning up files:", err);
  }
};

// Endpoint to execute dynamic code and test cases
app.post("/execute", (req, res) => {
  const { code, testCases, type } = req.body;

  // Generate paths for temp files
  const codeFilePath = path.join(__dirname, "tempCode.js"); // Path for tempCode.js in root
  const testFilePath = path.join(__dirname, "tempTest.js"); // Path for tempTest.js in root

  // Write code to a temporary file in the root directory
  try {
    fs.writeFileSync(codeFilePath, code);
  } catch (err) {
    console.error("Error writing code to temp file:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to write code to file." });
  }

  let testCode = "";

  // Based on the type, we will create different test cases
  switch (type) {
    case "react":
      testCode = `
        const { render, screen } = require('@testing-library/react');
        const dynamicCode = require('./tempCode').default; // Import the dynamically generated code
        describe('React Dynamic Test', () => {
          ${testCases}
        });
      `;
      break;

    case "node":
      testCode = `
        const dynamicCode = require('./tempCode');  // Import the dynamically generated code
        describe('Node Dynamic Test', () => {
          ${testCases}
        });
      `;
      break;

    case "html":
      testCode = `
        const { JSDOM } = require('jsdom');
        const { document } = (new JSDOM(\`<!DOCTYPE html><html><body>${code}</body></html>\`)).window;
        const dynamicCode = document.querySelector('body');
        describe('HTML Dynamic Test', () => {
          ${testCases}
        });
      `;
      break;

    case "css":
      testCode = `
        const { JSDOM } = require('jsdom');
        const { document } = (new JSDOM(\`<!DOCTYPE html><html><body><div style="${code}"></div></body></html>\`)).window;
        const dynamicCode = document.querySelector('div');
        describe('CSS Dynamic Test', () => {
          ${testCases}
        });
      `;
      break;

    default:
      cleanUpFiles();
      return res
        .status(400)
        .json({ status: "error", message: "Unknown test type" });
  }

  // Write the generated test case to a temporary file in the root directory
  try {
    fs.writeFileSync(testFilePath, testCode);
  } catch (err) {
    console.error("Error writing test cases to temp file:", err);
    cleanUpFiles();
    return res.status(500).json({
      status: "error",
      message: "Failed to write test cases to file.",
    });
  }

  // Run Jest tests
  exec(
    "npx jest --silent --runInBand --transformIgnorePatterns=/node_modules/",
    (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing Jest tests:", err);
        console.error("stderr:", stderr);
        cleanUpFiles();
        return res.status(500).json({
          status: "error",
          message: "Test execution failed.",
          error: stderr,
        });
      }

      console.log("stdout:", stdout); // Log stdout to check the Jest results
      cleanUpFiles();
      res.json({ status: "success", result: stdout });
    },
  );
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Replit API!" });
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running ona http://localhost:${PORT}`);
});
