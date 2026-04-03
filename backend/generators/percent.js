function percentQuestion(difficulty){

 let start = Math.floor(Math.random()*100)+20
 let percent = Math.floor(Math.random()*30)+10

 let end = Math.round(start*(1+percent/100))

 return {

  skill:"Percent Change",

  type:"multiple",

  question:`A value increases from ${start} to ${end}. What is the percent increase?`,

  choices:[
   percent+"%",
   percent+5+"%",
   percent-5+"%",
   percent+10+"%"
  ],

  answer:0

 }

}

module.exports = {percentQuestion}