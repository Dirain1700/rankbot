module.exports = (() => {
  const db = JSON.parse(fs.readFileSync("./rank.json"));
  const obj = Object.entries(db);
  obj.sort((a, b) => b[1].points - a[1].points);
  const edit = JSON.stringify(Object.fromEntries(obj), null, 4);
  fs.writeFileSync("./rank.json", edit);
}
