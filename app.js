import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from 'bcryptjs'
import { uploadFilesToCloudinary } from './utils/features.js'
import { v2 as cloudinary } from "cloudinary";
import { singleAvatar } from './middleware/multer.js';
import { corsOptions } from './constants/config.js';

dotenv.config({
  path: "./.env",
});
const port = process.env.port || 3000
const mongoURI = process.env.MONGO_URI;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));



mongoose.connect(mongoURI, {
  dbName: "JobRegistration",
})
  .then(() => console.log('Database Connected'))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  linkdin: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
}
)
const User = new mongoose.model("User", userSchema);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.post('/register', singleAvatar, async (req, res) => {
  const { name, email, mobile, password, linkdin, experience } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(201).json({
      success: true,
      message: 'Already Applied'
    });
  }
  const file = req.file;
  if (!file) return res.status(400).json({
    success: true,
    message: 'Please Upload Resume'
  });

  const result = await uploadFilesToCloudinary([file]);
  const resume = {
    public_id: result[0].public_id,
    url: result[0].url,
  };
  const hash_password = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    mobile,
    password: hash_password,
    linkdin,
    experience,
    resume,
  });
  return res.status(201).json({
    success: true,
    message: "Application sent",
  });

})

app.post('/login', async (req, res) => {

  const { email, password } = req.body;
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(404).json({
      success: true,
      message: 'Invalid Email',
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(404).json({
      success: true,
      message: 'Invalid Password'
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Welcome back',
    user,
  });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port} `);
});
