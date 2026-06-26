const pdf = require('pdf-parse');
const fs  = require('fs');
const buf = fs.readFileSync(process.argv[2]);
pdf(buf).then(d => {
  console.log('PAGES:', d.numpages);
  console.log(d.text.slice(0, 3000));
}).catch(e => console.error(e.message));
