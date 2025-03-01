const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3002;

app.post("/run", (req, res) => {
    const { language, code, testCases } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    let filename, execCommand, output = "";

    if (language === "javascript") {
        filename = "temp.js";
        execCommand = `node ${filename}`;
    } else if (language === "react") {
        filename = "temp.mjs";
        execCommand = `node ${filename}`;
    } else if (language === "html") {
        filename = "index.html";
        fs.writeFileSync(filename, code);

        // Directly return HTML code for testing instead of executing
        output = code;
    } else {
        return res.status(400).json({ error: "Unsupported language" });
    }

    // If HTML, return without execution
    if (language === "html") {
        return res.json({
            success: true,
            results: [{
                input: code,
                expected: testCases?.expected || code,
                actual: output,
                pass: output.trim() === (testCases?.expected || code).trim(),
            }]
        });
    }

    // Save code to a file
    fs.writeFileSync(filename, code);

    // Execute the code
    exec(execCommand, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, error: stderr });
        }

        // **Ensure testCases is always an array**
        const formattedTestCases = Array.isArray(testCases) ? testCases : [];

        const results = formattedTestCases.map((test) => ({
            input: test.input,
            expected: test.expected,
            actual: stdout.trim(),
            pass: stdout.trim() === test.expected.toString(),
        }));

        res.json({ success: true, results });
    });
});

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Replit API!" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});