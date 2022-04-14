module.exports = () => {
    const file = path.resolve(__dirname, "./config/rank.json");
    const db = JSON.parse(fs.readFileSync(file));
    const obj = Object.entries(db);
    obj.sort((a, b) => b[1].points - a[1].points);
    const edit = JSON.stringify(Object.fromEntries(obj), null, 4);
    fs.writeFileSync(file, edit);
};
