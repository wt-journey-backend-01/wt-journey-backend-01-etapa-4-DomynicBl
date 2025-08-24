require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');
const authRouter = require('./routes/authRoutes'); // <--- IMPORTAR

const app = express();

// Carrega o arquivo YAML de especificação da API
const swaggerDocument = YAML.load(path.join(__dirname, './docs/api-spec.yaml'));

app.use(express.json());

// Rota para a documentação da API
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
app.use(authRouter); // <--- USAR
app.use(agentesRouter);
app.use(casosRouter);

// Middleware para tratamento de erros genéricos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

module.exports = app;