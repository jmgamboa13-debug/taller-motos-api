// Gamboa Velandia es el primero por apellido y tiene el número oficial 4.
const N = 4;
const porcentajeRecargo = N * 2;

const turnos = [];
let siguienteId = 1;

function calcularTotal(precioBase, prioritario) {
  if (!prioritario) {
    return precioBase;
  }

  const totalPagar = precioBase + precioBase * porcentajeRecargo / 100;
  return Number(totalPagar.toFixed(2));
}

function prepararDatos(datos) {
  const prioritario = datos.prioritario === true;

  return {
    cliente: datos.cliente.trim(),
    telefono: datos.telefono.trim(),
    placa: datos.placa.trim().toUpperCase(),
    servicio: datos.servicio.trim(),
    fecha: datos.fecha.trim(),
    precioBase: datos.precioBase,
    prioritario: prioritario,
    totalPagar: calcularTotal(datos.precioBase, prioritario)
  };
}

function obtenerTurnos() {
  return turnos;
}

function obtenerTurnoPorId(id) {
  return turnos.find((turno) => turno.id === id);
}

function crearTurno(datos) {
  const turno = {
    id: siguienteId,
    ...prepararDatos(datos)
  };

  siguienteId++;
  turnos.push(turno);
  return turno;
}

function actualizarTurno(id, datos) {
  const turno = obtenerTurnoPorId(id);
  Object.assign(turno, prepararDatos(datos));
  return turno;
}

function eliminarTurno(id) {
  const posicion = turnos.findIndex((turno) => turno.id === id);

  if (posicion === -1) {
    return false;
  }

  turnos.splice(posicion, 1);
  return true;
}

module.exports = {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno
};
