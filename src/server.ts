import { initializeDatabase } from './db/startup';
import app from './app';
import http from 'http';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { execSync } from 'child_process';
const swaggerFile = require('./swagger_output.json');

execSync('npx drizzle-kit push --config ./dist/drizzle.config.js', { stdio: 'inherit' });

dotenv.config();


const PORT = process.env.PORT

initializeDatabase().then(() => {
    http.createServer(app).listen(PORT);
}).catch((error) => {
    console.error(" Erro ao inicializar o banco de dados:", error);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

