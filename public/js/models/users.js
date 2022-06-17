
var dbmgr = require('../dbmgr');
var db = dbmgr.db;

exports.getAllUsers = ()=> {
    const sql = "SELECT * FROM users";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;

}