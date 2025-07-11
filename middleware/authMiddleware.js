import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

const authMiddleware = (req,res,next) => {
    //get token from auth header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token not provided!" });
    }


    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
        
    } catch (error) {
        console.log("Error in decoding token: " + error);
        return res.status(403).json({ message: "Inavlid or expired token" });
        
    }
}
export default authMiddleware;