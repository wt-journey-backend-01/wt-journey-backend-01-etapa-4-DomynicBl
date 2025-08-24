const request = require('supertest');
const app = require('../app');
const db = require('../db/db');

let token;

beforeAll(async () => {
  await db.migrate.latest();
  
  await db('casos').del();
  await db('agentes').del();
  await db('usuarios').del();
  
  const testUser = {
    nome: 'Test User Agents',
    email: 'test.agents@example.com',
    senha: 'Password123@'
  };
  
  await request(app).post('/auth/register').send(testUser);
  const loginRes = await request(app).post('/auth/login').send({
    email: testUser.email,
    senha: testUser.senha
  });

  token = loginRes.body.access_token;
});

beforeEach(async () => {
  await db('casos').del();
  await db('agentes').del();
  await db.seed.run();
});

afterAll(async () => {
  await db('casos').del();
  await db('agentes').del();
  await db('usuarios').del();
  await db.destroy();
});

describe('Endpoints de /agentes', () => {

  it('Deve retornar 401 Unauthorized se não houver token', async () => {
    const res = await request(app).get('/agentes');
    expect(res.statusCode).toBe(401);
  });
  
  it('Deve retornar 401 Unauthorized se o token for inválido', async () => {
    const res = await request(app)
      .get('/agentes')
      .set('Authorization', 'Bearer tokeninvalido123');
    expect(res.statusCode).toBe(401);
  });

  describe('GET /agentes', () => {
    it('Deve listar todos os 6 agentes da seed', async () => {
      const res = await request(app).get('/agentes').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(6);
      expect(res.body[0]).toHaveProperty('id');
    });

    it('Deve filtrar agentes pelo cargo "agente"', async () => {
      const res = await request(app).get('/agentes?cargo=agente').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('Deve retornar um array vazio para um cargo que não existe', async () => {
      const res = await request(app).get('/agentes?cargo=inexistente').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('Deve ordenar agentes por data de incorporação descendente', async () => {
      const res = await request(app).get('/agentes?sort=-dataDeIncorporacao').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body[0].nome).toBe('Domynic Barros Lima');
      expect(res.body[5].nome).toBe('Rommel Carneiro');
    });

    it('Deve paginar os resultados, mostrando 3 agentes na página 2', async () => {
        const res = await request(app).get('/agentes?pageSize=3&page=2').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(3);
        expect(res.body[0].nome).toBe('Fernanda Souza');
    });
  });

  describe('GET /agentes/:id', () => {
    it('Deve retornar um agente específico pelo ID', async () => {
        const agente = await db('agentes').where({ nome: 'Ana Oliveira' }).first();
        const res = await request(app).get(`/agentes/${agente.id}`).set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nome).toBe('Ana Oliveira');
    });

    it('Deve retornar 404 para um ID de agente que não existe', async () => {
        const res = await request(app).get('/agentes/9999').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /agentes', () => {
    it('Deve criar um novo agente com sucesso', async () => {
      const novoAgente = { nome: 'Mariana Costa', dataDeIncorporacao: '2024-01-10', cargo: 'analista' };
      const res = await request(app).post('/agentes').set('Authorization', `Bearer ${token}`).send(novoAgente);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.nome).toBe('Mariana Costa');
      
      const agenteNoBanco = await db('agentes').where({ id: res.body.id }).first();
      expect(agenteNoBanco).toBeDefined();
    });

    it('Deve retornar 400 se o nome não for fornecido', async () => {
        const novoAgente = { dataDeIncorporacao: '2024-01-10', cargo: 'analista' };
        const res = await request(app).post('/agentes').set('Authorization', `Bearer ${token}`).send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('nome');
    });

    it('Deve retornar 400 se a data estiver em formato inválido', async () => {
        const novoAgente = { nome: 'Mariana Costa', dataDeIncorporacao: '10-01-2024', cargo: 'analista' };
        const res = await request(app).post('/agentes').set('Authorization', `Bearer ${token}`).send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('dataDeIncorporacao');
    });

    it('Deve retornar 400 se a data de incorporação for no futuro', async () => {
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 5);
        const dataFuturaString = dataFutura.toISOString().split('T')[0];
        const novoAgente = { nome: 'Viajante do Tempo', dataDeIncorporacao: dataFuturaString, cargo: 'observador' };

        const res = await request(app).post('/agentes').set('Authorization', `Bearer ${token}`).send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.dataDeIncorporacao).toBe('Data de incorporação não pode ser no futuro.');
    });
  });

  describe('PATCH /agentes/:id', () => {
    it('Deve atualizar parcialmente um agente', async () => {
        const agente = await db('agentes').where({ nome: 'Carlos Silva' }).first();
        const res = await request(app).patch(`/agentes/${agente.id}`).set('Authorization', `Bearer ${token}`).send({ cargo: 'agente especial' });
        expect(res.statusCode).toBe(200);
        expect(res.body.cargo).toBe('agente especial');
        expect(res.body.nome).toBe('Carlos Silva');
    });

    it('Deve retornar 400 se o corpo da requisição estiver vazio', async () => {
        const agente = await db('agentes').first();
        const res = await request(app).patch(`/agentes/${agente.id}`).set('Authorization', `Bearer ${token}`).send({});
        expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /agentes/:id', () => {
    it('Deve deletar um agente que não possui casos', async () => {
        const agenteParaDeletar = await db('agentes').insert({ nome: 'Agente Descartável', dataDeIncorporacao: '2025-01-01', cargo: 'temporario' }).returning('id');
        const res = await request(app).delete(`/agentes/${agenteParaDeletar[0].id}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });
    
    it('Deve retornar erro 400 ao tentar deletar um agente com casos associados', async () => {
        const agenteComCasos = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
        const res = await request(app).delete(`/agentes/${agenteComCasos.id}`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.delecao).toContain('associado a casos existentes');
    });
  });

  describe('GET /agentes/:id/casos', () => {
    it('Deve listar os 2 casos do agente Rommel Carneiro', async () => {
        const agente = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
        const res = await request(app).get(`/agentes/${agente.id}/casos`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('Deve retornar uma lista vazia para um agente sem casos', async () => {
        const novoAgente = await db('agentes').insert({ nome: 'Agente Novo', dataDeIncorporacao: '2025-01-01', cargo: 'recruta' }).returning('id');
        const res = await request(app).get(`/agentes/${novoAgente[0].id}/casos`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });
  });
});