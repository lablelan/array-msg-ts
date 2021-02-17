const utils = require('./utils');
const config = require('./config');
const protocalArr = require('./protocol');
const fs = require('fs');
let outputPath = config.outputPath || './protocal.d.ts';
let output = utils.gen(protocalArr);
console.log(output);
fs.writeFile(outputPath, output, (err) => {
    if (err) throw err;
});