const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleta todos os usuários existentes para começar do zero
  await knex('usuarios').del();

  // Cria o hash da senha
  // O hashSync é usado aqui por simplicidade dentro de um script de seed.
  const hashedPassword = bcrypt.hashSync('SenhaAdmin123@', 10);

  // Insere um usuário de exemplo
  await knex('usuarios').insert([
    {
      nome: 'Usuário Admin',
      email: 'admin@example.com',
      senha: hashedPassword
    }
  ]);
};