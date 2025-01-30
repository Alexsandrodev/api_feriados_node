export function formatDate(date: string): { year: number | null, monthDay: string | null } {
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
    } else if (formatoParcial.test(date)) {
        const [mes, dia] = date.split("-");
        const anoAtual = new Date().getFullYear();
        const dataConvertida = new Date(`${anoAtual}-${mes}-${dia}`);

        if (!isNaN(dataConvertida.getTime())) {
            return { year: null, monthDay: `${mes}-${dia}` };
        }
    }

    return { year: null, monthDay: null };
}


export function formatarFeriado(nome: string): string | null {
    const feriados: Record<string, string> = {
        "sexta-feira-santa": "Sexta-feira Santa",
        "corpus-christi": "Corpus Christi",
        "carnaval": "Carnaval"
    };

    return feriados[String(nome).toLowerCase()] || null;
}