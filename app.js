const url = require("url");

const fs = require("fs");
const http = require("http");

const mongoose= require("mongoose");
const authenticate = require("./auth.js");
const {Student,studentSchema,signup} =require ("./signup.js");
const {Admin} =require ("./models/admin.js")
const login = require("./login.js");
const adminLogin = require("./adminlogin.js");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

//CONNECTING TO MONGODB ATLAS SERVER

mongoose.connect("mongodb://localhost:27017/",{
    useNewUrlParser: true
}).then((conn)=>{
   console.log('Connection successful with ATLAS');
}).catch((err)=>{
    console.log('error handled');
})

// OBJECT SCHEMAS AND MODEL










const semesterSubjectSchema = new mongoose.Schema({
    dept : String,
    semester : Number,
    subjects: [
    {
    name: String,
    code: String,
    credits: Number
    }
    ]
})
const  semesterSubjects = mongoose.model('semesterSubjects',semesterSubjectSchema);







//READING FILES
const signupHtml = fs.readFileSync("./Templates/signup.html", "utf-8");
const homeHtml = fs.readFileSync("./Templates/home.html", "utf-8");
const raterSignupHtml = fs.readFileSync("./Templates/raterSignup.html", "utf-8");
const loginHtml = fs.readFileSync("./Templates/login.html", "utf-8");
const adminLoginHtml = fs.readFileSync("./Templates/adminLogin.html", "utf-8");
const adminDashboardHtml = fs.readFileSync("./Templates/adminDashboard.html", "utf-8");
const createAccountHtml = fs.readFileSync("./Templates/createAccount.html", "utf-8");
const loginasHtml = fs.readFileSync("./Templates/loginas.html", "utf-8");
const dashboardHtml = fs.readFileSync("./Templates/dashboardCard.html", "utf-8");
const studentDashboardHtml = fs.readFileSync("./Templates/dashboard.html", "utf-8");
const dummyHtml = fs.readFileSync("./Templates/dummy.html", "utf-8");

const port = 8000;

//TEMPLATE TO HTML CONVERSION


function replaceHtml(template,student){
    let output = template.replace("{{%CGPA%}}", student.cgpa);
    /*output = output.replace("{{%PRICE%}}", product.price);
    output = output.replace("{{%DESC%}}", product.desc);
    output = output.replace("{{%IMAGE%}}", product.image);
    output = output.replace("{{%ID%}}", product._id);
    output = output.replace("{{%ID2%}}", product._id);*/
    return output;
}

const OTPs={};
//ROUTING

const server = http.createServer(async(request, response) => {
    let { query, pathname: path } = url.parse(request.url, true);

    console.log(path);
    
    
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tharunraj12082005@gmail.com",
        pass: process.env.MAIL_APP_PWD 
    },
    });

    

    if (path === "/" || path.toLowerCase() === "/home") {            //CHECKED
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(homeHtml);
    } 

    
    
    else if(request.method === "GET" && path === "/createAccount"){  
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(createAccountHtml);
    }
    
     else if (request.method === "GET" && path === "/login") {       //CHECKED
        response.end(loginHtml);
    }
    
     else if (request.method === "GET" && path === "/dashboard") {   //CHECKED
        response.end(studentDashboardHtml);  
    }
     
    else if (request.method === "GET" && path === "/signup") {   //CHECKED
        response.end(dummyHtml);  
    }
     

     else if (request.method === "GET" && path === "/adminauth") {
        authenticate(request,response,async ()=>{
             const admin = await Admin.findOne({ adminUserName : request.username });
             try{
             if(admin){
                 response.writeHead(200, { "Content-Type": "application/json" });
                 console.log("here");
                 response.end(JSON.stringify({signupPage : signupHtml}))
             }
            }
             catch(error){
                console.log(error);
                 response.writeHead(500, { "Content-Type": "application/json" });
                 response.end(JSON.stringify({message :"Un-Authorized"}))
             }
        })
    }
    
    
    else if (request.method === "GET" && path === "/login/admin") {
        response.end(adminLoginHtml);
    }

     else if (request.method === "GET" && path === "/admin/dashboard") {
        response.end(adminDashboardHtml);
    }
   

    
    
    
    else if(request.method === "GET" && path === "/auth-dashboard"){
        authenticate(request,response,async()=>{
           const student = await Student.findOne({sid: request.userId});
           console.log(student);
           const dashboard = replaceHtml(dashboardHtml,student);
           console.log(dashboard);
           const catMarks = student.catMarks;
           const formattedCatMarks = {
            CAT1: catMarks.CAT1.map(item => ({
                subject: item.subject,
                marks: item.marks,
               
            })),
            CAT2: catMarks.CAT2.map(item => ({
                subject: item.subject,
                marks: item.marks,
                
            })),
            CAT3: catMarks.CAT3.map(item => ({
                subject: item.subject,
                marks: item.marks,
                
            }))
        };

          const assignments = student.assignments;
          const formattedAssignments = assignments.map(item =>({
            subject : item.subject,
            marks : item.marks
          }))


           response.writeHead(200, { "Content-Type": "text/html" });
           response.end(JSON.stringify({dashboard, subjects : formattedCatMarks, assignments : formattedAssignments}));

        })
       
    }
   
    

   
    else if(request.method === "POST" && path === "/semesterSubjects"){

        
        let body = "";
        request.on("data", chunk => {
        body += chunk.toString();
        });
        request.on("end",async()=>{
           const {semester,dept} = JSON.parse(body);
        console.log("semester:", semester, typeof semester); 
        console.log("dept:", dept, typeof dept);   
           
        const semSub =  await semesterSubjects.findOne({semester : Number(semester), dept})
        console.log(semSub);
        if(!semSub){
            console.log("no such sem");
        }
        else{
            console.log("here");
        const subjects = semSub.subjects;

        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({subjects})); 
        }
        })
    
        
    }
   
    
     
   
   
    
      
    else if (request.method === "POST" && path === "/login") {  //CHECKED
        login(request,response);
    }
   
    else if (request.method === "POST" && path === "/signup") { 
        return signup(request, response);
    }
   

    else if (request.method === "POST" && path === "/login/admin") {
        adminLogin(request,response);
    }
   
    

    else if(request.method=== "POST" && path ==="/send-otp"){
        
        let body = "";
      request.on("data", chunk => {
        body += chunk.toString();
       });
       console.log("here");
      request.on("end",async()=>{
        const {email} = JSON.parse(body);
       const user = await User.findOne({email});
       console.log("here2");

       if(!user){
        response.writeHead(401, { "Content-Type": "text/html" });
        response.end(JSON.stringyfy("User not found"));
        console.log("user not found");
        return;
       }

       const otpCode = Math.floor(100000 + Math.random() * 900000);
       OTPs[email] = otpCode;
       console.log(OTPs);
       
       try{
        await transporter.sendMail({
            from: "tharunraj12082005@gmail.com@gamil.com",
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is: ${otpCode}`,
        });
        console.log("mail sent");
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "OTP sent!" }));
       }
       catch(error){
        console.log("error");
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Failed to send OTP" }));
       }

      })
       

    } 

    else if(path=== "/verify-otp" && request.method==="POST"){
        body="";
        request.on("data",(chunk)=>body+=chunk.toString());
        request.on("end",async()=>{
            const {email,otp}= JSON.parse(body);
            console.log(email,OTPs);

            if (!OTPs[email]) {
                response.writeHead(400, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "OTP not found or expired" }));
                
                return;
              }
        
              if (OTPs[email] == otp) {
                delete OTPs[email]; 
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "OTP verified successfully" }));
              } else {
                response.writeHead(401, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Invalid OTP" }));
              }
        });
    }

    else if(path=== "/reset-password" && request.method=== "POST"){
        body="";
        request.on("data",(chunk)=>body+=chunk.toString());
        request.on("end",async()=>{
            const {email,password}= JSON.parse(body);

            const hashedPassword = await bcrypt.hash(password, 10);
            
            try{
            await User.updateOne(
                { email: email },
                { $set: { password: hashedPassword } }
            );
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Password changed" }));
        }
        catch(error){
            response.writeHead(401, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "An error occured"}));
        }


        });
    }
    
    




});



//STARTING SERVER
server.listen(port, "localhost", () => {
    console.log(`Server started at http://localhost:${port}`);
});



