import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JSON_LIMIT } from "./constants.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json()) // this specifies the maximum size of incoming json payload
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


//route import 
import userRouter from './routes/user.routes.js'
import hospitalRouter from './routes/hospital.routes.js'
import reviewRouter from './routes/review.routes.js'


//route declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/hospitals", hospitalRouter)
app.use("/api/v1/review", reviewRouter)

export { app }