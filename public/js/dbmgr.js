
const sqlite = require('better-sqlite3-with-prebuilds');
const db = new sqlite('public/database/myData.db');
exports.db = db;