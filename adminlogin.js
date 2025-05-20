const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Admin} =require ("./models/admin.js")


async function adminLogin(request, response) {
    
    
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });
    
    request.on("end", async () => {
        let { username, password ,id} = JSON.parse(body);
        console.log("Parsed");
        try {
           
            const admin = await Admin.findOne({ adminUserName : username });
            console.log("here",admin)
            id = Number(id);
            
            
            if (! admin || !(password === admin.password) || !(admin.adminId === id)) {
                response.writeHead(401, { "Content-Type": "application/json" });
                console.log("here2",password === admin.password, admin.adminId === id );
                return response.end(JSON.stringify({ error: "Invalid credentials" }));
            }
            // Generate JWT Token
            const token = jwt.sign({ id: admin._id , username: admin.adminUserName}, "AEVAL", { expiresIn: "1h" });
            console.log("token generated",token,username,id);
            response.writeHead(200, { "Content-Type": "application/json" });
            
            response.end(JSON.stringify({ message: "Login successful", token ,username}));
        } catch (err) {
            console.log(err)
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Login failed" }));
        }
    });
}

module.exports = adminLogin;
