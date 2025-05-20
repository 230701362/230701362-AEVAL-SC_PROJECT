const mongoose= require("mongoose");
const adminSchema= new mongoose.Schema({
    adminUserName : String,
    adminId: Number,
    password : String
})
const  Admin = mongoose.model('Admin',adminSchema);

module.exports = {Admin};