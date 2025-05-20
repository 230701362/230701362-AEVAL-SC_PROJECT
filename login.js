const {Student,studentSchema} =require ("./signup.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });
    request.on("end", async () => {
        const { username, password } = JSON.parse(body);

        try {
           
            const student = await Student.findOne({ sname : username });
            
            if (!student || !(await bcrypt.compare(password, student.password))) {
                response.writeHead(401, { "Content-Type": "application/json" });
                return response.end(JSON.stringify({ error: "Invalid credentials" }));
            }

            // Generate JWT Token
            const token = jwt.sign({ userId: student.sid , username: student.sname}, "AEVAL", { expiresIn: "1h" });
            console.log("token generated",token);

            response.writeHead(200, { "Content-Type": "application/json" });
            
            response.end(JSON.stringify({ message: "Login successful", token ,username}));
        } catch (err) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Login failed" }));
        }
    });
}

module.exports = login;
