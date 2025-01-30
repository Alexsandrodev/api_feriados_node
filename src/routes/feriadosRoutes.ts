import express from "express";
import {  appendEstado,  deleteEstado, getEstado } from "../services/estadoService";
import {  appendFeriadoMovel, appendMunicipio, deleteMunicipio, getMunicipio, removeFeriadoMovel } from "../services/municipioService";
import { formatarFeriado, formatDate } from "../utils/utils";

const router = express.Router();

router.get("/:codigo_ibge/:data/", async (req, res) => {
    const { codigo_ibge, data } = req.params;

    try {
        const date = formatDate(data)
        if (date.monthDay && date.year) {
            try {
                if (codigo_ibge.length === 7) {
                    const feriado = await getMunicipio(codigo_ibge, date.year, date.monthDay);
                    res.json(feriado);
                } else if (codigo_ibge.length === 2) {
                    const feriado = await getEstado(codigo_ibge, date.monthDay);
                    res.json(feriado);
                } else {
                    res.status(404).json("codigo ibge Invalido.");
                }
            } catch (error) {
                console.error("Erro ao consultar feriado:", error);
                res.status(500).json({ message: "Erro interno ao buscar o feriado." });
            }
        } else if (!date.monthDay) {
            const feriado = formatarFeriado(data)
            if (feriado) {
                if (codigo_ibge.length === 7) {
                    const dada = 0

                }
            }
        }

    } catch {
        res.status(404).json({ message: "data ou feriado movel invalido" })
    }


})

router.put("/:codigo_ibge/:data/", async (req, res) => {
    const { codigo_ibge, data } = req.params;
    const feriado = req.body;

    if (Object.keys(req.body).length > 0) {
        try {
            const date = formatDate(data)
            if (date.monthDay) {
                if (codigo_ibge.length === 7) {
                    const response = await appendMunicipio(codigo_ibge, date.monthDay, feriado)
                    res.status(response.status).send(response.message)
                } else if (codigo_ibge.length === 2) {
                    const response = await appendEstado(codigo_ibge, date.monthDay, feriado)
                    res.status(response.status).send(response.message)
                } else {
                    res.status(404).json("codigo ibge Invalido.")
                }
            }

        } catch {
            res.status(404).json({ message: "data ou feriado movel invalido" })
        }
    } else if (Object.keys(req.body).length === 0) {
        const feriado_formatado = formatarFeriado(data)

        if (feriado_formatado) {
            const repsonse = await appendFeriadoMovel(codigo_ibge, feriado_formatado)
            res.status(repsonse.status).json(repsonse.message)
        } else {
            res.status(404).json({ message: " feriado movel invalido" })
        }


    }
})

router.delete("/:codigo_ibge/:data", async (req, res) => {
    const { codigo_ibge, data } = req.params;

    try {

        const date = formatDate(data)
        if (date.monthDay) {
            if (codigo_ibge.length === 7) {
                const response = await deleteMunicipio(codigo_ibge, date.monthDay)
                res.status(response.status).send(response.message)
                console.log(response.status)
            } else if (codigo_ibge.length === 2) {
                const response = await deleteEstado(codigo_ibge, date.monthDay)
                console.log(response.status)
                res.status(response.status).send(response.message)
            } else {
                res.status(404).json("codigo ibge Invalido.")
            }
        } else if (!date.monthDay) {
            const feriado_formatado = formatarFeriado(data)
            if (feriado_formatado) {
                const response = await removeFeriadoMovel(codigo_ibge, feriado_formatado)
                res.status(response.status).json(response.message)
            } else {
                res.status(404).json({ message: " feriado movel invalido" })
            }

        }

    } catch {
        res.status(404).json({ message: "data ou feriado movel invalido" })
    }

})

export default router;