"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const startup_1 = require("./db/startup");
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const child_process_1 = require("child_process");
const swaggerFile = require('./swagger_output.json');
(0, child_process_1.execSync)('npx drizzle-kit push --config ./dist/drizzle.config.js', { stdio: 'inherit' });
dotenv_1.default.config();
const PORT = process.env.PORT;
(0, startup_1.initializeDatabase)().then(() => {
    http_1.default.createServer(app_1.default).listen(PORT);
}).catch((error) => {
    console.error(" Erro ao inicializar o banco de dados:", error);
});
app_1.default.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerFile));
