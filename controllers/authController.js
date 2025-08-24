//authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');
const errorHandler = require('../utils/errorHandler');

// Regex para validar a senha forte
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

async function register(req, res) {
    try {
        const { nome, email, senha } = req.body;

        // Validações básicas
        if (!nome || !email || !senha) {
            return errorHandler.sendInvalidParameterError(res, { message: "Nome, email e senha são obrigatórios." });
        }
        
        // Validação da senha forte
        if (!passwordRegex.test(senha)) {
            return errorHandler.sendInvalidParameterError(res, { 
                senha: "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial." 
            });
        }

        const existingUser = await usuariosRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Este email já está em uso." });
        }

        const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o "salt rounds"
        
        const novoUsuario = await usuariosRepository.create({
            nome,
            email,
            senha: hashedPassword
        });

        // Não retornar a senha na resposta
        const { senha: _, ...userResponse } = novoUsuario;
        res.status(201).json(userResponse);

    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return errorHandler.sendInvalidParameterError(res, { message: "Email e senha são obrigatórios." });
        }

        const usuario = await usuariosRepository.findByEmail(email);
        if (!usuario) {
            // Mensagem genérica para não informar se o email existe ou não
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const isPasswordValid = await bcrypt.compare(senha, usuario.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        
        const payload = { id: usuario.id, email: usuario.email, nome: usuario.nome };

        const accessToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(200).json({
            access_token: accessToken
        });

    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function logout(req, res) {
    // Para um logout stateless, apenas informamos ao cliente que ele pode remover o token.
    res.status(200).json({ message: "Logout realizado com sucesso. Por favor, descarte o token." });
}


async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }

        const userExists = await usuariosRepository.findById(id);
        if (!userExists) {
            return errorHandler.sendNotFoundError(res, "Usuário não encontrado.");
        }

        await usuariosRepository.remove(id);
        res.status(204).send();

    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

module.exports = { register, login, logout, deleteUser };