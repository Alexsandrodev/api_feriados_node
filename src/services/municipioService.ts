import { db } from "../db/connection";
import { estados, municipios} from "../db/schema";
import { eq } from "drizzle-orm";

export async function getMunicipio(codigo_ibge: string, data:string) {
    const resultado = await db
    .select({
        feriados_nacionais: estados.feriados_nacionais,
        feriados_estaduais: estados.feriados_estaduais,
        feriados_municipais: municipios.feriados_municipais,
    })
    .from(municipios)
    .where(eq(municipios.codigo_ibge, codigo_ibge))
    .leftJoin(estados, eq(municipios.estado_id, estados.codigo_ibge)); ;

    if (resultado.length === 0){
        return null
    }

    const {feriados_nacionais, feriados_estaduais, feriados_municipais} = resultado[0]


    if (feriados_municipais) {
        const feriadoMunicipal =  (feriados_municipais as Record<string, any>)[data] || null;
        if (feriadoMunicipal) {
            return feriadoMunicipal;
    }}

    
    if (feriados_estaduais){
        const feriadoEstadual = (feriados_estaduais as Record<string, any>)[data] || null;
        if (feriadoEstadual) {
            return feriadoEstadual;
    }}

    const feriadoNacional = (feriados_nacionais as Record<string, any>)[data] || null;
    if (feriadoNacional) {
        return feriadoNacional;
    }
    
}

export async function append_municipio(codigo_ibge: string, data: string, feriado:string) {
    const resultado = await db
        .select(
            {feriado: municipios.feriados_municipais}
        )
        .from(municipios)
        .where(eq(municipios.codigo_ibge, codigo_ibge))
        
    if (resultado.length === 0) {
            return {status:404, message: `Município com código IBGE ${codigo_ibge} não encontrado.`}
        }

    const feriadosAtuais = (resultado[0].feriado || {}) as Record<string, any>
    feriadosAtuais[data] = { name: feriado };

        const updateResult = await db
                .update(municipios)
                .set({ feriados_municipais: feriadosAtuais })
                .where(eq(municipios.codigo_ibge, codigo_ibge));


    return {status: 201, message: `Feriado ${feriado[0]} adicionado ao município ${codigo_ibge} na data ${data}.`}
}

export async function delete_municipio(codigo_ibge: string, data: string){
        
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

        if (feriados_estaduais[data]){
            return { status: 403, message: `Feriados estaduais não podem ser removidos em nível municipal.` };
        }
        if (feriados_nacionais[data]){
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
    
        return { status: 204 , message: `Feriado na data ${data} removido do município ${codigo_ibge}.` };
}