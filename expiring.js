const {getTokens} = require('./HandleFuncs');

const tokens = getTokens();
const currentTimestamp = Date.now();
const toekTime = currentTimestamp 
console.log(currentTimestamp);
console.log(toekTime);


if(currentTimestamp == toekTime || currentTimestamp > toekTime){
    console.log("expired")
}else{
    console.log('valid')
}