function slopeQuestion(){

 let x1 = Math.floor(Math.random()*5)
 let y1 = Math.floor(Math.random()*5)

 let x2 = x1 + Math.floor(Math.random()*5)+1
 let y2 = y1 + Math.floor(Math.random()*5)+1

 let slope = (y2-y1)/(x2-x1)

 return {

  skill:"Slope",

  type:"fill",

  question:`Find the slope of the line passing through (${x1},${y1}) and (${x2},${y2}).`,

  answer:String(slope)

 }

}

module.exports = {slopeQuestion}