import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";

import router from "./routes/formRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, //allows cookies/session headers
  })
);
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
app.use("/api/admin", adminRouter);

app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDb");
    app.listen(PORT, () => console.log(`Server is listening at port ${PORT}`));
  })
  .catch((err) => console.log("Mongodb connection error.", err));
