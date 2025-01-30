import express from "express";
import feriadosRoutes from "./routes/feriadosRoutes";

const app = express();

app.use(express.json());

app.use('/feriados', feriadosRoutes)

export default app