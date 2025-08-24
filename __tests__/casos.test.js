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
    nome: 'Test User Casos',
    email: 'test.casos@example.com',
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

describe('Endpoints de /casos', () => {
    
  it('Deve retornar 401 Unauthorized se não houver token', async () => {
    const res = await request(app).get('/casos');
    expect(res.statusCode).toBe(401);
  });
    
  describe('GET /casos', () => {
    it('Deve listar todos os 7 casos da seed', async () => {
      const res = await request(app).get('/casos').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(7);
    });

    it('Deve filtrar casos pelo agente_id', async () => {
      const agente = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
      const res = await request(app).get(`/casos?agente_id=${agente.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('Deve retornar erro 400 para um status de filtro inválido', async () => {
      const res = await request(app).get('/casos?status=pendente').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toHaveProperty('status');
      expect(res.body.errors.status).toContain('inválido');
    });
  });

  describe('POST /casos', () => {
    it('Deve criar um novo caso com sucesso', async () => {
      const agente = await db('agentes').first();
      const novoCaso = { titulo: 'Novo K_so', descricao: 'Desc', status: 'aberto', agente_id: agente.id };
      const res = await request(app).post('/casos').set('Authorization', `Bearer ${token}`).send(novoCaso);
      expect(res.statusCode).toBe(201);
      expect(res.body.titulo).toBe('Novo K_so');
    });

    it('Deve retornar 404 ao tentar criar um caso com um agente_id que não existe', async () => {
      const novoCaso = { titulo: 'Caso Órfão', descricao: 'Desc', status: 'aberto', agente_id: 9999 };
      const res = await request(app).post('/casos').set('Authorization', `Bearer ${token}`).send(novoCaso);
      expect(res.statusCode).toBe(404);
    });

    it('Deve retornar 400 se o status for inválido', async () => {
        const agente = await db('agentes').first();
        const novoCaso = { titulo: 'Caso Inválido', descricao: 'Desc', status: 'errado', agente_id: agente.id };
        const res = await request(app).post('/casos').set('Authorization', `Bearer ${token}`).send(novoCaso);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('status');
    });
  });
  
  describe('PUT /casos/:id', () => {
    it('Deve atualizar um caso por completo (PUT)', async () => {
        const caso = await db('casos').first();
        const agente = await db('agentes').orderBy('id', 'desc').first();
        const dadosAtualizados = { 
            titulo: 'Título Atualizado via PUT', 
            descricao: 'Descrição totalmente nova.', 
            status: 'solucionado', 
            agente_id: agente.id 
        };
        const res = await request(app).put(`/casos/${caso.id}`).set('Authorization', `Bearer ${token}`).send(dadosAtualizados);
        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe('Título Atualizado via PUT');
        expect(res.body.agente_id).toBe(agente.id);
    });

    it('Deve retornar 400 se faltar um campo obrigatório no PUT', async () => {
        const caso = await db('casos').first();
        const agente = await db('agentes').first();
        const dadosIncompletos = { descricao: 'Incompleto', status: 'solucionado', agente_id: agente.id };
        const res = await request(app).put(`/casos/${caso.id}`).set('Authorization', `Bearer ${token}`).send(dadosIncompletos);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('titulo');
    });
  });

  describe('GET /casos/:id/agente', () => {
    it('Deve retornar os dados completos do agente responsável pelo caso', async () => {
        const caso = await db('casos').where({ titulo: 'Fraude em Licitação' }).first();
        const res = await request(app).get(`/casos/${caso.id}/agente`).set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.nome).toBe('Fernanda Souza');
    });

    it('Deve retornar 404 se o caso não existir', async () => {
        const res = await request(app).get('/casos/9999/agente').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });
  });
});