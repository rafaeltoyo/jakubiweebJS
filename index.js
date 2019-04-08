const testFolder = './config2/config.json';
const fs = require('fs');

fs.readFile(testFolder, (err, data) => {
    console.log(err);
    console.log(data);
});

/*
fs.readdirSync(testFolder).forEach(file => {
    console.log(file);
});
*/
