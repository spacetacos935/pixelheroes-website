const _ = require("lodash");
const fs = require("fs");

const args = process.argv.slice(2);

const aFiles = fs.readdirSync(args[0], { recursive: true });
const bFiles = fs.readdirSync(args[1], { recursive: true });

_.difference(aFiles, bFiles).forEach((v) => {
  console.log(v);
});
