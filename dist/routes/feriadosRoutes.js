"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estadoService_1 = require("../services/estadoService");
const municipioService_1 = require("../services/municipioService");
const utils_1 = require("../utils/utils");
const router = express_1.default.Router();
router.get("/feriados/:codigo_ibge/:data/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo_ibge, data } = req.params;
    try {
        const date = (0, utils_1.formatDate)(data);
        if (!date.monthDay) {
            res.status(404).json({ message: 'data invalida' });
        }
        if (date.monthDay && date.year) {
            if (codigo_ibge.length === 7) {
                const feriado = yield (0, municipioService_1.getMunicipio)(codigo_ibge, date.year, date.monthDay);
                res.status(feriado.status).json(feriado.response);
            }
            else if (codigo_ibge.length === 2) {
                const feriado = yield (0, estadoService_1.getEstado)(codigo_ibge, date.monthDay);
                res.status(feriado.status).json(feriado.response);
            }
            else {
                res.status(404).json("codigo ibge Invalido.");
            }
        }
    }
    catch (_a) {
        res.status(404).json({ message: "data ou feriado movel invalido" });
    }
}));
router.put("/feriados/:codigo_ibge/:data/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo_ibge, data } = req.params;
    const feriado = req.body;
    if (Object.keys(req.body).length > 0) {
        try {
            const date = (0, utils_1.formatDate)(data);
            if (date.monthDay) {
                if (codigo_ibge.length === 7) {
                    const response = yield (0, municipioService_1.appendMunicipio)(codigo_ibge, date.monthDay, feriado);
                    res.status(response.status).send(response.message);
                }
                else if (codigo_ibge.length === 2) {
                    const response = yield (0, estadoService_1.appendEstado)(codigo_ibge, date.monthDay, feriado);
                    res.status(response.status).send(response.message);
                }
                else {
                    res.status(404).json("codigo ibge Invalido.");
                }
            }
        }
        catch (_a) {
            res.status(404).json({ message: "data ou feriado movel invalido" });
        }
    }
    else if (Object.keys(req.body).length === 0) {
        const feriado_formatado = (0, utils_1.formatarFeriado)(data);
        if (feriado_formatado) {
            const repsonse = yield (0, municipioService_1.appendFeriadoMovel)(codigo_ibge, feriado_formatado);
            res.status(repsonse.status).json(repsonse.message);
        }
        else {
            res.status(404).json({ message: " feriado movel invalido" });
        }
    }
}));
router.delete("/feriados/:codigo_ibge/:data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo_ibge, data } = req.params;
    try {
        const date = (0, utils_1.formatDate)(data);
        if (date.monthDay) {
            if (codigo_ibge.length === 7) {
                const response = yield (0, municipioService_1.deleteMunicipio)(codigo_ibge, date.monthDay);
                res.status(response.status).send(response.message);
            }
            else if (codigo_ibge.length === 2) {
                const response = yield (0, estadoService_1.deleteEstado)(codigo_ibge, date.monthDay);
                res.status(response.status).send(response.message);
            }
            else {
                res.status(404).json("codigo ibge Invalido.");
            }
        }
        else if (!date.monthDay) {
            const feriado_formatado = (0, utils_1.formatarFeriado)(data);
            if (feriado_formatado) {
                const response = yield (0, municipioService_1.removeFeriadoMovel)(codigo_ibge, feriado_formatado);
                res.status(response.status).json(response.message);
            }
            else {
                res.status(404).json({ message: " feriado movel invalido" });
            }
        }
    }
    catch (_a) {
        res.status(404).json({ message: "data ou feriado movel invalido" });
    }
}));
exports.default = router;
