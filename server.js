

require('dotenv').config();
const connectDB = require('./src/config/database');
const app = require('./src/app');

const generateinvoke = require('./src/services/ai.service');

connectDB();
// generateinvoke();

app.listen(3000,()=>{
    console.log('Server is running on port 3000 ');
})
