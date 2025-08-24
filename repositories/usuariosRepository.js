//usuariosRepository.js
const db = require('../db/db');

async function create(usuario) {
    const [novoUsuario] = await db('usuarios').insert(usuario).returning('*');
    return novoUsuario;
}

function findByEmail(email) {
    return db('usuarios').where({ email }).first();
}

function findById(id) {
    return db('usuarios').where({ id }).first();
}

function remove(id) {
    return db('usuarios').where({ id }).del();
}

module.exports = { create, findByEmail, findById, remove };