const {percentQuestion} = require("./percent")
const {slopeQuestion} = require("./algebra")

function randomItem(arr){
 return arr[Math.floor(Math.random()*arr.length)]
}

const generators = [
 percentQuestion,
 slopeQuestion
]

function generateTest(difficulty){

 const questions = []

 for(let i=0;i<45;i++){

  const gen = randomItem(generators)

  questions.push(gen(difficulty))

 }

 return questions

}

module.exports = {generateTest}