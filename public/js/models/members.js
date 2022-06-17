
const dbmgr = require("../dbmgr");
const db = dbmgr.db;

exports.getAllMembers = ()=>{
    const qry = "SELECT * FROM `members`";
    let stmt = db.prepare(qry);
    return stmt.all();
}