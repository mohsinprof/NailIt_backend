const mongoose= require('mongoose');

async function connectDB(){
    try{

await mongoose.connect(process.env.MONGO_URI)}
catch(err){
    console.error('Error connecting to MongoDB:', err);
}
console.log('MongoDB connected successfully');

}


module.exports=connectDB;