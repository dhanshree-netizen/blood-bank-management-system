const fs = require("fs");

const requiredFiles = [
    "index.html",
    "home.html",
    "register.html",
    "search.html",
    "request.html",
    "feedback.html",
    "style.css",
    "script.js"
];

for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error("Test failed: " + file + " is missing");
        process.exit(1);
    }
}

console.log("All required Blood Bank files are present");
console.log("Test passed");