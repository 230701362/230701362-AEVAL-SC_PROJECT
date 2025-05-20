const mongoose= require("mongoose");
const bcrypt = require("bcryptjs");
const raterSchema= new mongoose.Schema({
    rname :  String,
    password : String,
    rid : Number,
    phnumber : Number,
    email : String,
})


raterSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Rater = mongoose.model('Rater',raterSchema); 


async function raterSignup(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });

    request.on("end", async () => {
        const data = JSON.parse(body);
        if (!data.username || !data.password || !data.email || !data.rid) {
            response.writeHead(400, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ error: "All fields are required" }));
        }

        try {
            const newRater = await Rater.create({
                rname :  data.username,
                password: data.password,
                rid : data.rid,
                phnumber : data.phnumber,
                email : data.email

                
            })

            response.writeHead(201, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: " Rater User created successfully", user: newRater}));
        } catch (err) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Signup failed" }));
        }
    });
}

module.exports = {raterSignup,Rater,raterSchema};
