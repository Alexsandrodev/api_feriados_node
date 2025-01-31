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
exports.getMunicipio = getMunicipio;
exports.appendMunicipio = appendMunicipio;
exports.deleteMunicipio = deleteMunicipio;
exports.appendFeriadoMovel = appendFeriadoMovel;
exports.removeFeriadoMovel = removeFeriadoMovel;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const feriadosMoveis_1 = require("../utils/feriadosMoveis");
function getMunicipio(codigo_ibge, ano, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({
            feriados_nacionais: schema_1.estados.feriados_nacionais,
            feriados_estaduais: schema_1.estados.feriados_estaduais,
            feriados_municipais: schema_1.municipios.feriados_municipais,
            moveis_nacionais: schema_1.estados.movel_nacional,
            moveis_municipal: schema_1.municipios.feriados_moveis,
        })
            .from(schema_1.municipios)
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge))
            .leftJoin(schema_1.estados, (0, drizzle_orm_1.eq)(schema_1.municipios.estado_id, schema_1.estados.codigo_ibge));
        ;
        if (resultado.length === 0) {
            return { status: 404, response: { message: "Código ibge invalido " } };
        }
        const { feriados_nacionais, feriados_estaduais, feriados_municipais, moveis_nacionais, moveis_municipal } = resultado[0];
        const feriados = new feriadosMoveis_1.Feriados(ano);
        const feriado_moveis = feriados.getFeriados();
        if (feriado_moveis[data]) {
            const name = feriado_moveis[data]['name'];
            const moveisMunicipaisArray = moveis_municipal ? moveis_municipal.split(",").map(f => f.trim().toLowerCase()) : [];
            const moveisNacionaisArray = moveis_nacionais ? moveis_nacionais.split(",").map(f => f.trim().toLowerCase()) : [];
            const nameLower = name.toLowerCase();
            const existeNosMoveis = moveisMunicipaisArray.includes(nameLower) || moveisNacionaisArray.includes(nameLower);
            if (existeNosMoveis) {
                const response = feriado_moveis[data];
                return { status: 200, response };
            }
        }
        if (feriados_municipais) {
            const feriadoMunicipal = feriados_municipais[data] || null;
            if (feriadoMunicipal) {
                return { status: 200, response: feriadoMunicipal };
            }
        }
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
function appendMunicipio(codigo_ibge, data, feriado) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({ feriado: schema_1.municipios.feriados_municipais })
            .from(schema_1.municipios)
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
        }
        const feriadosAtuais = (resultado[0].feriado || {});
        feriadosAtuais[data] = { name: feriado };
        const updateResult = yield connection_1.db
            .update(schema_1.municipios)
            .set({ feriados_municipais: feriadosAtuais })
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        return { status: 201, message: `Feriado ${feriado[0]} adicionado ao município ${codigo_ibge} na data ${data}.` };
    });
}
function deleteMunicipio(codigo_ibge, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({
            feriados_municipais: schema_1.municipios.feriados_municipais,
            feriados_estaduais: schema_1.estados.feriados_estaduais,
            feriados_nacionais: schema_1.estados.feriados_nacionais,
        })
            .from(schema_1.municipios)
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge))
            .leftJoin(schema_1.estados, (0, drizzle_orm_1.eq)(schema_1.municipios.estado_id, schema_1.estados.codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
        }
        const feriados_estaduais = (resultado[0].feriados_estaduais || {});
        const feriados_nacionais = (resultado[0].feriados_nacionais || {});
        if (feriados_estaduais[data]) {
            return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
        }
        if (feriados_nacionais[data]) {
            return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
        }
        const feriadosAtuais = (resultado[0].feriados_municipais || {});
        if (!feriadosAtuais[data]) {
            return { status: 404, message: `Feriado na data ${data} não encontrado no município ${codigo_ibge}.` };
        }
        delete feriadosAtuais[data];
        const updateResult = yield connection_1.db
            .update(schema_1.municipios)
            .set({ feriados_municipais: feriadosAtuais })
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        return { status: 204, message: `Feriado na data ${data} removido do município ${codigo_ibge}.` };
    });
}
function appendFeriadoMovel(codigo_ibge, feriado_movel) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield connection_1.db
            .select({ movel_municipal: schema_1.municipios.feriados_moveis })
            .from(schema_1.municipios)
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
        }
        ;
        const movel_municipal = resultado[0].movel_municipal;
        if (movel_municipal && movel_municipal.includes(feriado_movel)) {
            return { status: 201, message: `O feriado móvel "${feriado_movel}" já existe.` };
        }
        const novosFeriadosMoveis = movel_municipal ? `${movel_municipal}, ${feriado_movel}` : feriado_movel;
        yield connection_1.db
            .update(schema_1.municipios)
            .set({ feriados_moveis: novosFeriadosMoveis })
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        return { status: 201, message: `Feriado móvel "${feriado_movel}" adicionado com sucesso.` };
    });
}
function removeFeriadoMovel(codigo_ibge, feriado_movel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (feriado_movel.toLowerCase() === "sexta-feira santa") {
            return { status: 403, message: `O feriado "${feriado_movel}" não pode ser removido.` };
        }
        const resultado = yield connection_1.db
            .select({ movel_municipal: schema_1.municipios.feriados_moveis })
            .from(schema_1.municipios)
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        if (resultado.length === 0) {
            return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
        }
        const movel_municipal = resultado[0].movel_municipal;
        if (!movel_municipal) {
            return { status: 404, message: `Nenhum feriado móvel encontrado para o município ${codigo_ibge}.` };
        }
        const feriadosArray = movel_municipal.split(", ").filter(feriado => feriado.toLowerCase() !== feriado_movel.toLowerCase());
        if (feriadosArray.length === movel_municipal.split(", ").length) {
            return { status: 404, message: `O feriado móvel "${feriado_movel}" não foi encontrado para remoção.` };
        }
        yield connection_1.db
            .update(schema_1.municipios)
            .set({ feriados_moveis: feriadosArray.length > 0 ? feriadosArray.join(", ") : null })
            .where((0, drizzle_orm_1.eq)(schema_1.municipios.codigo_ibge, codigo_ibge));
        return { status: 204, message: `Feriado móvel "${feriado_movel}" removido com sucesso.` };
    });
}
