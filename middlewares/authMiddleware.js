const jwt = require('jsonwebtoken');
const errorHandler = require('../utils/errorHandler');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não fornecido ou em formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adiciona os dados do usuário decodificados ao objeto `req`, para que possam ser usados nos controllers das rotas protegidas.
        req.user = decoded; 
        
        next(); // Se o token for válido, continua para a próxima função (o controller)

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado.' });
        }
        return res.status(401).json({ message: 'Token inválido.' });
    }
}

module.exports = authMiddleware;