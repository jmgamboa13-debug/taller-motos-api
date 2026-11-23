const turnosService = require("../services/turnosService");

function validarTurno(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return "Debes enviar un objeto JSON con los datos del turno.";
  }

  const camposTexto = ["cliente", "telefono", "placa", "servicio", "fecha"];

  for (const campo of camposTexto) {
    if (typeof datos[campo] !== "string" || datos[campo].trim() === "") {
      return `El campo ${campo} es obligatorio y debe ser un texto no vacío.`;
    }
  }

  if (Number.isNaN(Date.parse(datos.fecha))) {
    return "El campo fecha debe contener una fecha válida.";
  }

  if (typeof datos.precioBase !== "number" || !Number.isFinite(datos.precioBase) || datos.precioBase <= 0) {
    return "El campo precioBase debe ser un número mayor que cero.";
  }

  if (datos.prioritario !== undefined && typeof datos.prioritario !== "boolean") {
    return "El campo prioritario debe ser true o false, sin comillas.";
  }

  return null;
}

function listarTurnos(req, res) {
  const turnos = turnosService.obtenerTurnos();
  res.status(200).json(turnos);
}

function obtenerTurno(req, res) {
  const turno = turnosService.obtenerTurnoPorId(Number(req.params.id));

  if (!turno) {
    return res.status(404).json({ mensaje: "Turno no encontrado." });
  }

  res.status(200).json(turno);
}

function crearTurno(req, res) {
  const error = validarTurno(req.body);

  if (error) {
    return res.status(400).json({ mensaje: error });
  }

  const turno = turnosService.crearTurno(req.body);
  res.status(201).json(turno);
}

function actualizarTurno(req, res) {
  const id = Number(req.params.id);
  const turnoExistente = turnosService.obtenerTurnoPorId(id);

  if (!turnoExistente) {
    return res.status(404).json({ mensaje: "Turno no encontrado." });
  }

  const error = validarTurno(req.body);

  if (error) {
    return res.status(400).json({ mensaje: error });
  }

  const turno = turnosService.actualizarTurno(id, req.body);
  res.status(200).json(turno);
}

function eliminarTurno(req, res) {
  const eliminado = turnosService.eliminarTurno(Number(req.params.id));

  if (!eliminado) {
    return res.status(404).json({ mensaje: "Turno no encontrado." });
  }

  res.status(200).json({ mensaje: "Turno eliminado correctamente." });
}

function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: "Ruta no encontrada." });
}

function manejarError(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo de la solicitud debe ser un JSON válido." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ mensaje: "El cuerpo de la solicitud es demasiado grande." });
  }

  console.error(error.message);
  res.status(500).json({ mensaje: "Ocurrió un error interno en el servidor." });
}

module.exports = {
  listarTurnos,
  obtenerTurno,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  rutaNoEncontrada,
  manejarError
};
