// MongoDB runs in a Docker container: docker run -d -p 27017:27017 --name mongo mongo
// Connection string (server/.env): MONGO_URI=mongodb://localhost:27017/expenses
const mongoose = require('mongoose')

const expenseSchema =new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:2,
        trim:true
    },
    amount:{
        type:Number,
        required:true,
        min:[0.01,'Amount must be greater than 0']
    },
    category:{
        type:String,
        required:true,
        enum:['food','travel','bills','shopping','other']
    },
    createdAt: {type:Date,default: Date.now},
})

module.exports = mongoose.model('Expense',expenseSchema)