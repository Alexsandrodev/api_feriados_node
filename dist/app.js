"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const feriadosRoutes_1 = __importDefault(require("./routes/feriadosRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
    methods: ['GET', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(feriadosRoutes_1.default);
exports.default = app;
