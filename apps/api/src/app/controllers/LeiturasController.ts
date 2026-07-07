import { Request, Response } from "express";
import { WhereOptions, Order } from "sequelize";
import * as Yup from "yup";

import construirRange from "../utils/construirRange.js";
import construirOrdenacao from "../utils/construirOrdenacao.js";
import construirIntervaloData from "../utils/construirIntervaloData.js";
import adicionarFiltroExato from "../utils/adicionarFiltroExato.js";

import Leitura from "../models/Leitura.js";
import Estacao from "../models/Estacao.js";

import redis from "../../lib/redis.js";
import Queue from "../../lib/Queue.js";
import SaveLeituraJob from "../jobs/SaveLeituraJob.js";

interface Params {
  id: string;
  estacaoId: string;
}

interface Query {
  temperatura?: string;
  temperatura_min?: string;
  temperatura_max?: string;

  umidade?: string;
  umidade_min?: string;
  umidade_max?: string;

  precipitacao?: string;
  precipitacao_min?: string;
  precipitacao_max?: string;

  criadaAntes?: string;
  criadaDepois?: string;

  sort?: string;
  page?: string;
  limit?: string;
}

// Schema para validação de uma única leitura
const leituraSchema = Yup.object().shape({
  temperatura: Yup.number().required(),
  umidade: Yup.number().required(),
  precipitacao: Yup.number().required(),
  data_leitura: Yup.date().optional(),
});

// Schema flexível que aceita objeto ou array
const bodySchema = Yup.lazy((value) => {
  if (Array.isArray(value)) {
    return Yup.array().of(leituraSchema).required();
  }
  return leituraSchema.required();
});

class LeiturasController {
  async index(req: Request<Params, any, any, Query>, res: Response) {
    const { estacaoId } = req.params;

    console.log("QUERY COMPLETA:", req.query);

    // 1. Validar se a estação existe no Banco de Dados
    const estacaoExiste = await Estacao.findByPk(estacaoId);

    if (!estacaoExiste) {
      return res
        .status(404)
        .json({ erro: "Estação meteorológica não encontrada." });
    }

    const {
      temperatura,
      temperatura_min,
      temperatura_max,
      umidade,
      umidade_min,
      umidade_max,
      precipitacao,
      precipitacao_min,
      precipitacao_max,
      criadaAntes,
      criadaDepois,
      sort,
    } = req.query;

    console.log("VALORES EXTRAÍDOS:", { umidade_min, umidade_max });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;

    const where: WhereOptions = {
      estacao_id: estacaoId,
    };

    // filtros exatos
    adicionarFiltroExato(where, "temperatura", temperatura);
    adicionarFiltroExato(where, "umidade", umidade);
    adicionarFiltroExato(where, "precipitacao", precipitacao);

    // ranges (usando casting para evitar erro de tipo do TS)
    const filtros = [
      {
        campo: "temperatura",
        range: construirRange(temperatura_min, temperatura_max),
      },
      { campo: "umidade", range: construirRange(umidade_min, umidade_max) },
      {
        campo: "precipitacao",
        range: construirRange(precipitacao_min, precipitacao_max),
      },
      {
        campo: "data_leitura",
        range: construirIntervaloData(criadaAntes, criadaDepois),
      },
    ];

    filtros.forEach((f) => {
      if (f.range) {
        Object.assign(where, {
          [f.campo]: f.range,
        });
      }
    });

    const order = construirOrdenacao(sort);

    console.log("OBJETO WHERE FINAL:", JSON.stringify(where, null, 2));
    console.log("FILTROS PROCESSADOS:", filtros);

    const leituras = await Leitura.findAll({
      where,
      include: [
        {
          model: Estacao,
          as: "estacao",
          attributes: ["id", "nome"],
        },
      ],
      order,
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(leituras);
  }

  async show(req: Request<Params>, res: Response) {
    const leitura = await Leitura.findByPk(req.params.id, {
      include: [
        {
          model: Estacao,
          as: "estacao",
          attributes: ["id", "nome"],
        },
      ],
    });

    if (!leitura) {
      return res.status(404).json();
    }

    return res.json(leitura);
  }

  async create(req: Request, res: Response) {
    try {
      // 1. Valida se a estação foi autenticada (middleware)
      if (!req.estacaoId) {
        return res.status(401).json({ erro: "Estação não autenticada." });
      }

      // 2. Valida o corpo da requisição (objeto ou array)
      let dados;
      try {
        dados = await bodySchema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
      } catch (err: any) {
        return res.status(400).json({ 
          erro: err.errors || "Dados inválidos. Envie um objeto ou array de leituras." 
        });
      }

      // 3. Normaliza para array, facilitando o processamento
      const leiturasArray = Array.isArray(dados) ? dados : [dados];

      // 4. Processa cada leitura
      const leiturasCriadas = [];
      let ultimaLeitura = null;

      for (const item of leiturasArray) {
        // Prepara o objeto com a data (usa a fornecida ou a atual)
        const leituraData = {
          estacao_id: req.estacaoId,
          temperatura: item.temperatura,
          umidade: item.umidade,
          precipitacao: item.precipitacao,
          data_leitura: item.data_leitura ? new Date(item.data_leitura) : new Date(),
        };

        // Adiciona à fila para processamento assíncrono
        await Queue.add(SaveLeituraJob.key, leituraData);

        // Guarda a última leitura para cache (será a última do array ou a única)
        ultimaLeitura = leituraData;
        leiturasCriadas.push(leituraData);
      }

      // 5. Atualiza o cache Redis com a última leitura (se houver)
      if (ultimaLeitura) {
        await redis.set(
          `estacao:${req.estacaoId}:ultima`,
          JSON.stringify(ultimaLeitura)
        );
      }

      // 6. Log para debug
      console.log(
        `${leiturasCriadas.length} leitura(s) recebida(s) para estação ${req.estacaoId}`
      );

      // 7. Resposta
      return res.status(202).json({
        mensagem: `${leiturasCriadas.length} leitura(s) recebida(s) e enfileirada(s).`,
        ultima: ultimaLeitura,
        total: leiturasCriadas.length,
      });

    } catch (err) {
      console.error("Erro ao processar leituras:", err);
      return res.status(500).json({
        erro: "Erro interno no servidor.",
      });
    }
  }

  async ultima(req: Request<Params>, res: Response) {
    const { estacaoId } = req.params;

    const estacaoExiste = await Estacao.findByPk(estacaoId);

    console.log(estacaoExiste);

    if (!estacaoExiste) {
      return res
        .status(404)
        .json({ erro: "Estação não encontrada no sistema." });
    }

    const ultimaLeitura = await redis.get(`estacao:${estacaoId}:ultima`);

    if (!ultimaLeitura) {
      return res.status(404).json();
    }

    return res.json(JSON.parse(ultimaLeitura));
  }
}

export default new LeiturasController();
