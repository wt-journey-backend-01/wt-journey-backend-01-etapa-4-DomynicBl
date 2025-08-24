const request = require('supertest');
const app = require('../app');
const db = require('../db/db');

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  // Limpar usuários antes de cada teste de autenticação
  await db('usuarios').del();
});

afterAll(async () => {
  await db.destroy();
});

describe('Endpoints de Autenticação', () => {
  describe('POST /auth/register', () => {
    it('Deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Novo Teste',
          email: 'novo@teste.com',
          senha: 'SenhaValida123@'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('novo@teste.com');
      expect(res.body).not.toHaveProperty('senha');
    });

    it('Deve retornar 400 se o email já estiver em uso', async () => {
      await request(app).post('/auth/register').send({
        nome: 'Primeiro Usuario',
        email: 'duplicado@teste.com',
        senha: 'SenhaValida123@'
      });
      
      const res = await request(app).post('/auth/register').send({
        nome: 'Segundo Usuario',
        email: 'duplicado@teste.com',
        senha: 'OutraSenha123@'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Este email já está em uso.');
    });

    it('Deve retornar 400 se a senha for fraca', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Novo Teste',
          email: 'fraco@teste.com',
          senha: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toHaveProperty('senha');
    });

    it('Deve retornar 400 se faltar algum campo obrigatório', async () => {
        const res = await request(app)
          .post('/auth/register')
          .send({
            nome: 'Incompleto',
            email: 'incompleto@teste.com'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.message).toContain('obrigatórios');
      });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Garante que existe um usuário para testar o login
      await request(app).post('/auth/register').send({
        nome: 'Login Test',
        email: 'login@teste.com',
        senha: 'SenhaValida123@'
      });
    });

    it('Deve logar com sucesso e retornar um token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@teste.com',
          senha: 'SenhaValida123@'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('Deve retornar 401 para senha incorreta', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@teste.com',
          senha: 'senhaerrada'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Credenciais inválidas.');
    });

    it('Deve retornar 401 para um email que não existe', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'naoexiste@teste.com',
          senha: 'SenhaValida123@'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
});