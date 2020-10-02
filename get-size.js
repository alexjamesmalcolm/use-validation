const getSize = require("get-folder-size");

getSize("output", (err, bytes) => {
  console.log(`${bytes} bytes`);
});
