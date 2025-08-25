// agentesRepository.js

const db = require('../db/db');

/**
 * Busca agentes no banco de dados com base em filtros.
 * Toda a lógica de construção da query fica aqui.
 * @param {object} filtros - Objeto com os filtros (ex: { cargo: 'delegado', sort: '-dataDeIncorporacao' }).
 * @returns {Promise<Array>} Uma promessa que resolve para um array de agentes.
 */
function findAll(filtros = {}) {
    // Validação robusta para paginação
    const page = Number.isInteger(+filtros.page) && +filtros.page > 0 ? +filtros.page : 1;
    const pageSize = Number.isInteger(+filtros.pageSize) && +filtros.pageSize > 0 ? +filtros.pageSize : 10;
    const offset = (page - 1) * pageSize;

    let query = db('agentes').select('*');

    // Filtro por cargo
    if (filtros.cargo) {
        query.where('cargo', 'ilike', `%${filtros.cargo}%`);
    }

    // Filtros por intervalo de data de incorporação
    if (filtros.dataDeIncorporacao_gte) { // gte = Greater Than or Equal
        query.where('dataDeIncorporacao', '>=', filtros.dataDeIncorporacao_gte);
    }
    if (filtros.dataDeIncorporacao_lte) { // lte = Less Than or Equal
        query.where('dataDeIncorporacao', '<=', filtros.dataDeIncorporacao_lte);
    }
    // FIM DA ADIÇÃO

    // Ordenação por dataDeIncorporacao
    if (filtros.sort) {
        const sortField = filtros.sort.startsWith('-') ? filtros.sort.substring(1) : filtros.sort;
        const sortOrder = filtros.sort.startsWith('-') ? 'desc' : 'asc';
        
        const allowedSortFields = ['id', 'nome', 'dataDeIncorporacao', 'cargo'];

        if (allowedSortFields.includes(sortField)) {
            query.orderBy(sortField, sortOrder);
        }
    }

    // Aplica os limites da paginação
    query.limit(pageSize).offset(offset);

    return query;
}

function findById(id) {
    return db('agentes').where({ id }).first();
}

async function create(agente) {
    const [novoAgente] = await db('agentes').insert(agente).returning('*');
    return novoAgente;
}

async function update(id, agenteAtualizado) {
    const [agente] = await db('agentes').where({ id }).update(agenteAtualizado).returning('*');
    return agente;
}

async function patch(id, dadosParciais) {
    const [agente] = await db('agentes').where({ id }).update(dadosParciais).returning('*');
    return agente;
}

function remove(id) {
    return db('agentes').where({ id }).del();
}

function findCasosByAgenteId(agenteId) {
    return db('casos').where({ agente_id: agenteId }).select('*');
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    patch,
    remove,
    findCasosByAgenteId
};