import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true
    },
    name: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,

    },
    createdAt: {
        type: Date,
        default:Date.now
    }

},
    {timestamps:true}
)

const User = mongoose.model("User", userSchema);
export default User;

