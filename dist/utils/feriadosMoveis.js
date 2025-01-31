"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feriados = void 0;
class Feriados {
    constructor(ano) {
        this.ano = ano;
        this.pascoa = this.calcularPascoa(ano);
    }
    // Função simples para calcular a Páscoa
    calcularPascoa(ano) {
        const a = ano % 19;
        const b = Math.floor(ano / 100);
        const c = ano % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mes = Math.floor((h + l - 7 * m + 114) / 31);
        const dia = 1 + ((h + l - 7 * m + 114) % 31);
        return new Date(ano, mes - 1, dia); // Meses começam em 0 em JavaScript
    }
    // Função para calcular os feriados móveis a partir da Páscoa
    calcularFeriado(dias) {
        const feriado = new Date(this.pascoa);
        feriado.setDate(feriado.getDate() + dias); // Adiciona ou subtrai os dias
        const mes = feriado.getMonth() + 1; // Meses começam do 0 em JavaScript
        const dia = feriado.getDate();
        return `${mes < 10 ? `0${mes}` : mes}-${dia < 10 ? `0${dia}` : dia}`;
    }
    // Função para obter todos os feriados móveis
    getFeriados() {
        const feriados = {};
        feriados[this.calcularFeriado(0)] = { name: "Páscoa" };
        feriados[this.calcularFeriado(-47)] = { name: "Carnaval" };
        feriados[this.calcularFeriado(60)] = { name: "Corpus Christi" };
        feriados[this.calcularFeriado(-2)] = { name: "Sexta-Feira Santa" };
        return feriados;
    }
}
exports.Feriados = Feriados;
