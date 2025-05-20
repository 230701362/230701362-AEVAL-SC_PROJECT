const mongoose= require("mongoose");
const bcrypt = require("bcryptjs");
const studentSchema= new mongoose.Schema({
    sname :  String,
    password: String,
    email : String,
    sid : Number,
    phnumber : Number,
    ratings : Number,
    semester : Number,
    cgpa : Number,
    gpa :Number,
    catMarks :{
        CAT1 : [
            {subject :String , marks :Number}
        ],
        CAT2: [
            {subject :String , marks :Number}
        ],
        CAT3: [
            {subject :String , marks :Number}
        ]
    },
    assignments : [{subject :String , marks :Number}]
})
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Student = mongoose.model('Student',studentSchema);


async function signup(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });

    request.on("end", async () => {
        const data = JSON.parse(body);
        if (!data.username || !data.password || !data.email || !data.sid) {
            response.writeHead(400, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ error: "All fields are required" }));
        }

        try {
            const newStudent = await Student.create({
                sname :  data.username,
                password: data.password,
                email : data.email,
                sid : data.sid,
                phnumber : data.phnumber,
                semester : data.semester,
                cgpa : data.cgpa,
                gpa : data.gpa,
                ratings :data.ratings,
                catMarks : data.catMarks,
                assignments :data.assignments
            })

            response.writeHead(201, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: " Student User created successfully", user: newStudent}));
        } catch (err) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Signup failed" }));
        }
    });
}

module.exports = {signup,Student,studentSchema};
