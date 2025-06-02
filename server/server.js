import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";

import router from "./routes/formRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

app.use("/api", router);

app.get("/health", (req, res) => {
  res.json({ message: "Severs is running" });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDb");
    app.listen(PORT, () => console.log(`Server is listening at port ${PORT}`));
  })
  .catch((err) => console.log("Mongodb connection error."));
