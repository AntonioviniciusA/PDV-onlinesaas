const express = require("express");
const router = express.Router();
const {
  getAllPlanos,
  getPlanosByBilling_cycle,
  getPlanosPorId,
} = require("../controllers/planos.controller.js");

/**
 * @route GET /saas/plano
 * @desc Buscar todos os planos ativos
 * @access Public
 */
router.get("/", getAllPlanos);

/**
 * @route GET /saas/plano/:billing_cycle
 * @desc Buscar planos por ciclo de cobrança (monthly/yearly)
 * @access Public
 */
router.get("/ciclo/:billing_cycle", getPlanosByBilling_cycle);

/**
 * @route GET /saas/plano/:id
 * @desc Buscar plano específico por ID
 * @access Public
 */
router.get("/:id", getPlanosPorId);

// /**
//  * @route GET /saas/plano/ciclo/:ciclo
//  * @desc Buscar planos por ciclo de cobrança (monthly/yearly)
//  * @access Public
//  */
// router.get("/ciclo/:ciclo", planosController.buscarPlanosPorCiclo);

// /**
//  * @route GET /saas/plano/popular/destaque
//  * @desc Buscar plano em destaque (popular)
//  * @access Public
//  */
// router.get("/popular/destaque", planosController.buscarPlanoDestaque);

module.exports = router;
