import User from "../models/User.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer";
import crypto from "crypto";
import Otp from "../models/Otp.js";

dotenv.config();

export const Signup = async (req, res) => {
    const { email, name, username, password } = req.body;
    if (!username || !password ||!email || !name)   {
    return res.status(400).json({ message: "all fields are required!" });
  }
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists! Kindly login!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, name, username, password: hashedPassword });
        await newUser.save();


        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY_TIME || "1h" }
        );

       
        res.status(201).json({
            message: "User created successfully!",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                name: newUser.name,
            },
        });


        console.log("id token: " + token);
    } catch (error) {
        console.log("Unable to create new user!" + error);
        res.status(500).json({ message: "Error in creating user!" });
    }
    

    
    
        
}

export const Login = async (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({message:"User not found!"})
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            res.status(401).json({ message: "Incorrect Password! Enter the correct password!" });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY_TIME || "1h" }
        );

        res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
            },
      
        });
        
        console.log("id token: " + token);
    } catch (error) {
        console.log("Login error: ", error);
        res.status(500).json({message:"User cannot be logged in!"})
    }
}

export const getUsers = async(req,res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(201).json(users);
        
    } catch (error) {
        console.error("Error in fetching all users!" + error);
        res.status(500).json({message:"internal server error"})
    }
}

export const getUserById = async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(401).json({
                message:
                    "user not found!"
            });
        }

        res.status(201).json(user);
    } catch (error) {
        console.log("Error in fetching user: " + error);
        res.status(500).json({message:"internal server error!"})
    }
}

//otp handler function
export const sendOtp =async (email,otp  ) => {
     const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // sender email
      pass: process.env.PASSWORD // sender email app password
    }
     });
    
    await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
  });
}

export const requestOtp = async (req, res) => {
    
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

 
  const otp = crypto.randomInt(100000, 999999).toString();

  
  const expiresAt = new Date(Date.now() + 2* 60 * 1000);
  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

    await sendOtp(email, otp);
     res.status(200).json({ message: "OTP sent to your email." });
    
}

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(401).json({ message: "Invalid or expired OTP." });
  }

  await Otp.deleteOne({ email, otp });

  const user = await User.findOne({ email });
  const token = jwt.sign(
    { userId: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY_TIME || "1h" }
  );

  res.status(200).json({
    message: "OTP verified. Login successful.",
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
    
}