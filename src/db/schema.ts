import * as t from "drizzle-orm/pg-core";


export const estados = t.pgTable('estados', {
    codigo_ibge: t.varchar('codigo_ibge', {length:2}).primaryKey(),
    feriados_nacionais: t.json(),
    feriados_estaduais: t.json()
}
);


export const municipios = t.pgTable('municipios', {
    codigo_ibge: t.varchar('codigo_ibge', {length:7}).primaryKey(),
    nome: t.varchar('nome',{length :256}),
    estado_id: t.varchar('estado_id', { length: 2 }).references(() => estados.codigo_ibge),
    feriados_municipais: t.json(),    
    feriados_moveis: t.varchar()
}
)