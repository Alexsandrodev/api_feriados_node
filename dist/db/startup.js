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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const connection_1 = require("./connection");
const schema_1 = require("./schema");
const csvParser_1 = require("../utils/csvParser");
const drizzle_orm_1 = require("drizzle-orm");
function feriadosNacionais() {
    return {
        "01-01": { "name": "Ano Novo" },
        "04-21": { "name": "Tiradentes" },
        "05-01": { "name": "Dia do Trabalhador" },
        "09-07": { "name": "Independência do Brasil" },
        "10-12": { "name": "Nossa Senhora Aparecida" },
        "11-02": { "name": "Finados" },
        "11-15": { "name": "Proclamação da República" },
        "12-25": { "name": "Natal" }
    };
}
function verificaCodigoIbge(codigo_ibge) {
    return __awaiter(this, void 0, void 0, function* () {
        const estado = yield connection_1.db.select().from(schema_1.estados).where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge));
        return estado.length > 0;
    });
}
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Verificando se o banco de dados precisa ser populado...");
        const estadosExistentes = yield connection_1.db.select().from(schema_1.estados);
        if (estadosExistentes.length === 0) {
            console.log("Nenhum estado encontrado. Iniciando inserção de dados...");
            const municipiosCSV = yield (0, csvParser_1.parseCSV)("municipios-2019.csv");
            for (const row of municipiosCSV) {
                const estadoCodigo = row.codigo_ibge.substring(0, 2);
                const estadoExiste = yield verificaCodigoIbge(estadoCodigo);
                if (!estadoExiste) {
                    yield connection_1.db.insert(schema_1.estados).values({
                        codigo_ibge: estadoCodigo,
                        feriados_nacionais: feriadosNacionais(),
                        movel_nacional: "Sexta-feira Santa"
                    });
                }
                yield connection_1.db.insert(schema_1.municipios).values({
                    codigo_ibge: row.codigo_ibge,
                    nome: row.nome,
                    estado_id: estadoCodigo
                });
            }
            console.log("Banco de dados inicializado com sucesso!");
        }
        else {
            console.log("Banco de dados já contém informações iniciais.");
        }
    });
}
