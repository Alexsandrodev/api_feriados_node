import express from "express";
import { append_estado, delete_estado, getEstado } from "../services/estadoService";
import { append_municipio, delete_municipio, getMunicipio } from "../services/municipioService";
import { formatDate } from "../utils/utils";

const router = express.Router();

router.get("/:codigo_ibge/:data/", async (req, res)=>{
    const {codigo_ibge, data} = req.params;

    const date = formatDate(data)

    try{
        if ( codigo_ibge.length ===7 ){
            const feriado = await getMunicipio(codigo_ibge, date.monthDay);
            res.json(feriado);
        } else if ( codigo_ibge.length ===2 ){
            const feriado = await getEstado(codigo_ibge, date.monthDay);
            res.json(feriado);
        } else{
            res.status(404).json("codigo ibge Invalido.");
        }
    }catch (error) {
        console.error("Erro ao consultar feriado:", error);
        res.status(500).json({ message: "Erro interno ao buscar o feriado." });
    }
    
})

router.put("/:codigo_ibge/:data/", async (req, res)=>{
    const {codigo_ibge, data} = req.params;
    const feriado = req.body;

    const date = formatDate(data)

    if ( codigo_ibge.length ===7 ){
        const response = await append_municipio(codigo_ibge, date.monthDay, feriado)
        res.status(response.status).send(response.message)
    } else if ( codigo_ibge.length ===2 ){
        const response = await append_estado(codigo_ibge, date.monthDay, feriado)
        res.status(response.status).send(response.message)
    } else{
        res.status(404).json("codigo ibge Invalido.")
    }
    
})

router.delete("/:codigo_ibge/:data", async (req, res)=>{
    const {codigo_ibge, data} = req.params;
    const date = formatDate(data)
    
    if ( codigo_ibge.length ===7 ){
        const response = await delete_municipio(codigo_ibge, date.monthDay)
        res.status(response.status).send(response.message)
        console.log(response.status)
    } else if ( codigo_ibge.length ===2 ){
        const response = await delete_estado(codigo_ibge, date.monthDay)
        console.log(response.status)
        res.status(response.status).send(response.message)
    } else{
        res.status(404).json("codigo ibge Invalido.")
    }
    
})

export default router;