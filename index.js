const express = require("express");
const turnosRoutes = require("./routes/turnosRoutes");
const turnosController = require("./controllers/turnosController");

const app = express();

app.use(express.json());
app.use("/api/turnos", turnosRoutes);
app.use(turnosController.rutaNoEncontrada);
app.use(turnosController.manejarError);

const puerto = process.env.PORT || 3000;

app.listen(puerto, () => {
  console.log(`API del taller de motos en http://localhost:${puerto}/api/turnos`);
});
