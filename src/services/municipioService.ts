import { db } from "../db/connection";
import { estados, municipios } from "../db/schema";
import { eq } from "drizzle-orm";
import { Feriados } from "../utils/feriadosMoveis";

export async function getMunicipio(codigo_ibge: string, ano:number, data: string) {
    const resultado = await db
        .select({
            feriados_nacionais: estados.feriados_nacionais,
            feriados_estaduais: estados.feriados_estaduais,
            feriados_municipais: municipios.feriados_municipais,
            moveis_nacionais: estados.movel_nacional,
            moveis_municipal: municipios.feriados_moveis,
        })
        .from(municipios)
        .where(eq(municipios.codigo_ibge, codigo_ibge))
        .leftJoin(estados, eq(municipios.estado_id, estados.codigo_ibge));;

    if (resultado.length === 0) {
        return null
    }

    const { feriados_nacionais, feriados_estaduais, feriados_municipais, moveis_nacionais, moveis_municipal } = resultado[0]

    const feriados = new Feriados(ano)

    const feriado_moveis = feriados.getFeriados()
    
    if (feriado_moveis[data]){
        const name = feriado_moveis[data]['name']
        const moveisMunicipaisArray = moveis_municipal ? moveis_municipal.split(",").map(f => f.trim().toLowerCase()) : [];
        const moveisNacionaisArray = moveis_nacionais ? moveis_nacionais.split(",").map(f => f.trim().toLowerCase()) : [];
        
        const nameLower = name.toLowerCase();
        
        
        const existeNosMoveis = moveisMunicipaisArray.includes(nameLower) || moveisNacionaisArray.includes(nameLower);
        

        if (existeNosMoveis){
            return feriado_moveis[data]
        }
    }

    if (feriados_municipais) {
        const feriadoMunicipal = (feriados_municipais as Record<string, any>)[data] || null;
        if (feriadoMunicipal) {
            return feriadoMunicipal;
        }
    }


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

export async function appendMunicipio(codigo_ibge: string, data: string, feriado: string) {
    const resultado = await db
        .select(
            { feriado: municipios.feriados_municipais }
        )
        .from(municipios)
        .where(eq(municipios.codigo_ibge, codigo_ibge))

    if (resultado.length === 0) {
        return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` }
    }

    const feriadosAtuais = (resultado[0].feriado || {}) as Record<string, any>
    feriadosAtuais[data] = { name: feriado };

    const updateResult = await db
        .update(municipios)
        .set({ feriados_municipais: feriadosAtuais })
        .where(eq(municipios.codigo_ibge, codigo_ibge));


    return { status: 201, message: `Feriado ${feriado[0]} adicionado ao município ${codigo_ibge} na data ${data}.` }
}

export async function deleteMunicipio(codigo_ibge: string, data: string) {

    const resultado = await db
        .select({
            feriados_municipais: municipios.feriados_municipais,
            feriados_estaduais: estados.feriados_estaduais,
            feriados_nacionais: estados.feriados_nacionais,
        })
        .from(municipios)
        .where(eq(municipios.codigo_ibge, codigo_ibge))
        .leftJoin(estados, eq(municipios.estado_id, estados.codigo_ibge));

    if (resultado.length === 0) {
        return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
    }

    const feriados_estaduais = (resultado[0].feriados_estaduais || {}) as Record<string, any>
    const feriados_nacionais = (resultado[0].feriados_nacionais || {}) as Record<string, any>

    if (feriados_estaduais[data]) {
        return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
    }
    if (feriados_nacionais[data]) {
        return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
    }

    const feriadosAtuais = (resultado[0].feriados_municipais || {}) as Record<string, any>;

    if (!feriadosAtuais[data]) {
        return { status: 404, message: `Feriado na data ${data} não encontrado no município ${codigo_ibge}.` };
    }

    delete feriadosAtuais[data];

    const updateResult = await db
        .update(municipios)
        .set({ feriados_municipais: feriadosAtuais })
        .where(eq(municipios.codigo_ibge, codigo_ibge));

    return { status: 204, message: `Feriado na data ${data} removido do município ${codigo_ibge}.` };
}

export async function appendFeriadoMovel(codigo_ibge: string, feriado_movel: string) {
    const resultado = await db
    .select({ movel_municipal: municipios.feriados_moveis })
    .from(municipios)
    .where(eq(municipios.codigo_ibge, codigo_ibge));

    if (resultado.length === 0) {
        return { status: 404, message: `Município com código IBGE ${codigo_ibge} não encontrado.` };
    };

    const movel_municipal = resultado[0].movel_municipal;

    if (movel_municipal && movel_municipal.includes(feriado_movel)) {
        return { status: 201, message: `O feriado móvel "${feriado_movel}" já existe.` };
    }

    const novosFeriadosMoveis = movel_municipal ? `${movel_municipal}, ${feriado_movel}` : feriado_movel;

    await db
        .update(municipios)
        .set({ feriados_moveis: novosFeriadosMoveis })
        .where(eq(municipios.codigo_ibge, codigo_ibge));

    return { status: 201, message: `Feriado móvel "${feriado_movel}" adicionado com sucesso.` };

}

export async function removeFeriadoMovel(codigo_ibge: string, feriado_movel: string) {
    if (feriado_movel.toLowerCase() === "sexta-feira santa") {
        return { status: 403, message: `O feriado "${feriado_movel}" não pode ser removido.` };
    }

    const resultado = await db
        .select({ movel_municipal: municipios.feriados_moveis })
        .from(municipios)
        .where(eq(municipios.codigo_ibge, codigo_ibge));

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

    await db
        .update(municipios)
        .set({ feriados_moveis: feriadosArray.length > 0 ? feriadosArray.join(", ") : null })
        .where(eq(municipios.codigo_ibge, codigo_ibge));

    return { status: 204, message: `Feriado móvel "${feriado_movel}" removido com sucesso.` };
}