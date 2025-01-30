import { initializeDatabase } from './db/startup';
import app from './app';


const PORT = 8000

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Erro ao inicializar o banco de dados:", error);
});