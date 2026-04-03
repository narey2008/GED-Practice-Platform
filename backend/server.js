const express = require("express")
const cors = require("cors")

const {generateTest} = require("./generators/testBuilder")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
 res.send("GED Practice API Running")
})

app.get("/generate-test",(req,res)=>{

 const difficulty = req.query.difficulty || "medium"

 const test = generateTest(difficulty)

 res.json(test)

})

app.listen(3000,()=>{
 console.log("Server running on port 3000")
})