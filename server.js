import express from "express";
import { connectDB } from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import urlRouter from "./routes/urlRoutes.js";
const app = express();
const port = 5001;
app.use(express.json());

app.get("/", (req, res) => {
    try {
        res.send("Server is running!");
    } catch (error) {
        res.send("Server is not running due to error!" + error);
        console.log("server not running: " + error);
    }
})
app.use('/url', urlRouter);
app.use('/user', authRouter);


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on: http://localhost:${port}`)
    })
})
