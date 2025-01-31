"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatarFeriado = formatarFeriado;
function formatDate(date) {
    // Expressões regulares para validar os formatos esperados
    const formatoCompleto = /^\d{4}-\d{2}-\d{2}$/; // AAAA-MM-DD
    const formatoParcial = /^\d{2}-\d{2}$/; // MM-DD
    if (formatoCompleto.test(date)) {
        const [ano, mes, dia] = date.split("-");
        const anoNumero = parseInt(ano, 10);
        const dataConvertida = new Date(`${ano}-${mes}-${dia}`);
        // Verifica se a data é válida
        if (!isNaN(dataConvertida.getTime())) {
            return { year: anoNumero, monthDay: `${mes}-${dia}` };
        }
    }
    else if (formatoParcial.test(date)) {
        const [mes, dia] = date.split("-");
        const anoAtual = new Date().getFullYear();
        const dataConvertida = new Date(`${anoAtual}-${mes}-${dia}`);
        if (!isNaN(dataConvertida.getTime())) {
            return { year: null, monthDay: `${mes}-${dia}` };
        }
    }
    return { year: null, monthDay: null };
}
function formatarFeriado(nome) {
    const feriados = {
        "sexta-feira-santa": "Sexta-feira Santa",
        "corpus-christi": "Corpus Christi",
        "carnaval": "Carnaval"
    };
    return feriados[String(nome).toLowerCase()] || null;
}
