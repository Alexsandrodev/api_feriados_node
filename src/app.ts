import express from "express";
import cors from 'cors'
import feriadosRoutes from "./routes/feriadosRoutes";

const app = express();

app.use(cors({
    origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
    methods: ['GET', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true

}))

app.use(express.json());

app.use(feriadosRoutes)

export default app