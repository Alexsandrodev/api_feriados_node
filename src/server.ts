import express from 'express';
import { criarServidor, getEstado, getMunicipioById } from './utils/utils';

const PORT = 8000


const app = express()

app.get('/feriados/:codigo_ibge/:data/', async (req, res) => {
    const {codigo_ibge, data} = req.params

    const [ano, mes, dia] = data.split('-')
    const mesDia = `${mes}-${dia}`
    
    if (codigo_ibge.length === 2){
        const estado = await getEstado(codigo_ibge, mesDia);
        res.json(estado)
    }else if (codigo_ibge.length ===7){
        const municipios = await getMunicipioById(codigo_ibge, mesDia)
        res.json(municipios)
    }else{
        res.sendStatus(404)
    }
})



async function inicarServidor() {
    try {
        console.log('Iniciando o servidor...');

        await criarServidor();

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    };
};

inicarServidor();