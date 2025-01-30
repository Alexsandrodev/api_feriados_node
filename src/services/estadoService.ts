import { db } from "../db/connection";
import { estados } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getEstado(codigo_ibge: string,data: string) {
    const resultado = (await db
        .select({
            feriados_nacionais: estados.feriados_nacionais,
            feriados_estaduais: estados.feriados_estaduais,

        })
        .from(estados)
        .where(eq(estados.codigo_ibge, codigo_ibge)));

    if (resultado.length === 0) {
        throw new Error("Estado não encontrado.");
    }

    const { feriados_nacionais, feriados_estaduais } = resultado[0]

    if (feriados_estaduais) {
        const feriadoEstadual = (feriados_estaduais as Record<string, any>)[data] || null;
        if (feriadoEstadual) {
            return feriadoEstadual;
        }
    }

    const feriadoNacional = (feriados_nacionais as Record<string, any>)[data] || null;
    if (feriadoNacional) {
        return feriadoNacional;
    }
}

export async function appendEstado(codigo_ibge: string, data: string, feriado: string) {
    const resultado = await db
        .select({
            feriado: estados.feriados_estaduais
        })
        .from(estados)
        .where(eq(estados.codigo_ibge, codigo_ibge));

    if (resultado.length === 0) {
        return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` }
    }

    const feriadosAtuais = (resultado[0].feriado || {}) as Record<string, any>;
    feriadosAtuais[data] = feriado;

    const updateResult = await db
        .update(estados)
        .set({ feriados_estaduais: feriadosAtuais })
        .where(eq(estados.codigo_ibge, codigo_ibge));


    return { status: 201, message: `Feriado ${feriado[0]} adicionado ao município ${codigo_ibge} na data ${data}.` }

}

export async function deleteEstado(codigo_ibge: string, data: string) {
    const resultado = await db
        .select({
            feriados_estaduais: estados.feriados_estaduais,
            feriados_nacionais: estados.feriados_nacionais,

        })
        .from(estados)
        .where(eq(estados.codigo_ibge, codigo_ibge));

    if (resultado.length === 0) {
        return { status: 404, message: `Estado com código IBGE ${codigo_ibge} não encontrado.` };
    }


    const feriados_nacionais = (resultado[0].feriados_nacionais || {}) as Record<string, any>;
    if (feriados_nacionais[data]) {
        return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
    }

    const feriadosAtuais = (resultado[0].feriados_estaduais || {}) as Record<string, any>;

    if (!feriadosAtuais[data]) {
        return { status: 404, message: `Feriado na data ${data} não encontrado no estado ${codigo_ibge}.` };
    }

    delete feriadosAtuais[data];

    const updateResult = await db
        .update(estados)
        .set({ feriados_estaduais: feriadosAtuais })
        .where(eq(estados.codigo_ibge, codigo_ibge));

    return { status: 204, message: `Feriado na data ${data} removido do estado ${codigo_ibge}.` };
}