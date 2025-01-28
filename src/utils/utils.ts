import fs from 'fs'
import csv from 'csv-parser'
import { Writable, Transform } from 'stream'
import { db } from '../index'
import { estados, municipios } from '../db/schema'
import { eq } from 'drizzle-orm'


function feriadosNacionais() {
    const feriados = {
        "01-01": { "name": "Ano Novo" },
        "04-21": { "name": "Tiradentes" },
        "05-01": { "name": "Dia do Trabalhador" },
        "09-07": { "name": "Independencia" },
        "10-12": { "name": "Nossa Senhora Aparecida" },
        "11-02": { "name": "Finados" },
        "11-15": { "name": "Proclamação da República" },
        "12-25": { "name": "Natal" }
    };
    return feriados;
}

async function verificaCodigoIbge(codigo_ibge:string){
    const estado = await db
        .select()
        .from(estados)
        .where(eq(estados.codigo_ibge, codigo_ibge));

    return estado.length > 0;
}

export async function gerateData() {
    
    const readableStreamFile = fs.createReadStream('municipios-2019.csv')
    const transformToObject = csv({ separator: ',' })
    const transformToString = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        callback(null, JSON.stringify(chunk))
    },
    })
    const writableStreamFile = new Writable({
    async write(chunk, encoding, next) {
        const stringifyer = chunk.toString();
        const rowData = JSON.parse(stringifyer);
        const estado =  rowData.codigo_ibge.substring(0, 2);
        
        const estado_existente =await verificaCodigoIbge(estado);

        if (!estado_existente){
            await db.insert(estados).values({
                codigo_ibge: estado,
                feriados_nacionais: feriadosNacionais()
              });
        };

        await db.insert(municipios).values({
            codigo_ibge: rowData.codigo_ibge,
            nome: rowData.nome,
            estado_id: estado
        });
        next()
    },
    })

    console.log('Iniciou', Date())
    readableStreamFile
    .pipe(transformToObject)
    .pipe(transformToString)
    .pipe(writableStreamFile)
    .on('close', () => console.log('Finalizou', Date()))
}


export async function criarServidor() {
    const dados = await db.select().from(estados)

    if (dados.length === 0){
        await gerateData()
        console.log('servidor criado.')
    }else{
        console.log('servidor já existente.')
    }
}

export async function getEstado(codigo_ibge: string, data: string) {
    const resultado = (await db
        .select({
            feriados: estados.feriados_nacionais,
        })
        .from(estados)
        .where(eq(estados.codigo_ibge, codigo_ibge))) as { feriados: string | Record<string, any> }[];

    if (resultado.length === 0) {
        throw new Error("Estado não encontrado.");
    }

    const dados = resultado[0].feriados;

    // Verifica se é um objeto ou uma string JSON
    const feriados_Nacionais =
        typeof dados === "string" ? JSON.parse(dados) : dados;

    // Busca o feriado específico
    const feriado = feriados_Nacionais[data];

    // Retorna o feriado em formato JSON
    return JSON.stringify(feriado);
}


export async function getMunicipioById(codigo_ibge: string, data:string) {
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
