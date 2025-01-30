import { db } from "./connection";
import { estados, municipios } from "./schema";
import { parseCSV } from "../utils/csvParser";
import { eq } from "drizzle-orm";


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


async function verificaCodigoIbge(codigo_ibge: string): Promise<boolean> {
    const estado = await db.select().from(estados).where(eq(estados.codigo_ibge, codigo_ibge));
    return estado.length > 0;
}


export async function initializeDatabase() {
    console.log("Verificando se o banco de dados precisa ser populado...");

    const estadosExistentes = await db.select().from(estados);

    if (estadosExistentes.length === 0) {
        console.log("Nenhum estado encontrado. Iniciando inserção de dados...");

        const municipiosCSV = await parseCSV("municipios-2019.csv");

        for (const row of municipiosCSV) {
            const estadoCodigo = row.codigo_ibge.substring(0, 2);

            const estadoExiste = await verificaCodigoIbge(estadoCodigo);

            if (!estadoExiste) {
                await db.insert(estados).values({
                    codigo_ibge: estadoCodigo,
                    feriados_nacionais: feriadosNacionais(),
                    movel_nacional: "Sexta-feira Santa"
                });
            }

            await db.insert(municipios).values({
                codigo_ibge: row.codigo_ibge,
                nome: row.nome,
                estado_id: estadoCodigo
            });
        }

        console.log("Banco de dados inicializado com sucesso!");
    } else {
        console.log("Banco de dados já contém informações iniciais.");
    }
}
