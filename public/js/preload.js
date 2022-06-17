
const users = require('./models/users');
const members = require('./models/members');
const { contextBridge } = require('electron');

const getAllUsers = () => {
    return users.getAllUsers();
}
const getAllMembers = () => {
    return members.getAllMembers();
}

contextBridge.exposeInMainWorld("api",{
    getAllUsers: getAllUsers,
    getAllMembers: getAllMembers
    
})

