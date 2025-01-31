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
exports.getEstado = getEstado;
exports.appendEstado = appendEstado;
exports.deleteEstado = deleteEstado;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
function getEstado(codigo_ibge, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = (yield connection_1.db
            .select({
            feriados_nacionais: schema_1.estados.feriados_nacionais,
            feriados_estaduais: schema_1.estados.feriados_estaduais,
        })
            .from(schema_1.estados)
            .where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge)));
        if (resultado.length === 0) {
            return { status: 404, response: { message: "Código ibge invalido " } };
        }
        const { feriados_nacionais, feriados_estaduais } = resultado[0];
        if (feriados_estaduais) {
            const feriadoEstadual = feriados_estaduais[data] || null;
            if (feriadoEstadual) {
                return { status: 200, response: feriadoEstadual };
            }
        }
        const feriadoNacional = feriados_nacionais[data] || null;
        if (feriadoNacional) {
            return { status: 200, response: feriadoNacional };
        }
        return { status: 404, response: { message: "Nenhum feriado encontrado." } };
    });
}
function appendEstado(codigo_ibge, data, feriado) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({
            feriado: schema_1.estados.feriados_estaduais
        })
            .from(schema_1.estados)
            .where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
        }
        const feriadosAtuais = (resultado[0].feriado || {});
        feriadosAtuais[data] = feriado;
        const updateResult = yield connection_1.db
            .update(schema_1.estados)
            .set({ feriados_estaduais: feriadosAtuais })
            .where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge));
        return { status: 201, message: `Feriado ${feriado[0]} adicionado ao município ${codigo_ibge} na data ${data}.` };
    });
}
function deleteEstado(codigo_ibge, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({
            feriados_estaduais: schema_1.estados.feriados_estaduais,
            feriados_nacionais: schema_1.estados.feriados_nacionais,
        })
            .from(schema_1.estados)
            .where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Estado com código IBGE ${codigo_ibge} não encontrado.` };
        }
        const feriados_nacionais = (resultado[0].feriados_nacionais || {});
        if (feriados_nacionais[data]) {
            return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
        }
        const feriadosAtuais = (resultado[0].feriados_estaduais || {});
        if (!feriadosAtuais[data]) {
            return { status: 404, message: `Feriado na data ${data} não encontrado no estado ${codigo_ibge}.` };
        }
        delete feriadosAtuais[data];
        const updateResult = yield connection_1.db
            .update(schema_1.estados)
            .set({ feriados_estaduais: feriadosAtuais })
            .where((0, drizzle_orm_1.eq)(schema_1.estados.codigo_ibge, codigo_ibge));
        return { status: 204, message: `Feriado na data ${data} removido do estado ${codigo_ibge}.` };
    });
}
