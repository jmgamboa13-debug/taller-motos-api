const express = require("express");
const turnosController = require("../controllers/turnosController");

const router = express.Router();

router.get("/", turnosController.listarTurnos);
router.get("/:id", turnosController.obtenerTurno);
router.post("/", turnosController.crearTurno);
router.put("/:id", turnosController.actualizarTurno);
router.delete("/:id", turnosController.eliminarTurno);

module.exports = router;
