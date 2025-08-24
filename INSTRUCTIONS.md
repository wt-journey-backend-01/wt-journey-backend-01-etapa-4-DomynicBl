# Instruções do Projeto da API do Departamento de Polícia
Siga os passos abaixo para configurar e rodar a aplicação e o banco de dados localmente.

## Pré-requisitos
- Docker e Docker Compose instalados.
- Node.js e npm instalados.

### 1. Iniciar o Banco de Dados
Para subir o contêiner do PostgreSQL com os dados persistindo em um volume, execute o seguinte comando na raiz do projeto:
```bash
docker-compose up -d
```

### 2. Instalar Dependências
Com o terminal na raiz do projeto, instale as dependências do Node.js:
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo .env.example  para .env e preencha as variáveis de ambiente, incluindo JWT_SECRET.

### 4. Configurar o Banco de Dados (Migrations & Seeds)
Para criar as tabelas e popular o banco com dados iniciais, execute os seguintes comandos:
```bash
# Para executar as migrations (criar as tabelas 'agentes' e 'casos')
npx knex migrate:latest

# Para executar as seeds (popular as tabelas com dados iniciais)
npx knex seed:run
```

### 5. Iniciar a Aplicação
Com o banco de dados rodando e configurado, inicie o servidor da API:
```bash
npm start
```

A API estará disponível em http://localhost:3000.
A documentação da API pode ser acessada em http://localhost:3000/docs.

---
---

## Fluxo de Autenticação
Para acessar os endpoints de ```bash/agentes``` e ```bash/casos```, você precisa de um token de autenticação. O fluxo é o seguinte:

1. Registre um novo usuário: Use o endpoint ```bash POST /auth/register``` para criar sua conta.

 2. Faça login: Use o endpoint ```bashPOST /auth/login``` com seu email e senha para receber um ```bash access_token```.

 3. Acesse as rotas protegidas: Inclua o token recebido no cabeçalho ```bash Authorization``` de todas as suas requisições para os endpoints protegidos.

### Exemplo: Como Usar o Token
Para fazer requisições aos endpoints protegidos, inclua o ```bash access_token``` no cabeçalho ```bash Authorization``` com o prefixo ```bash Bearer```.

Exemplo de requisição para uma rota protegida (usando ```bash curl```):

```bash
curl -X GET http://localhost:3000/agentes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_access_token_aqui"
```
---
---

## Comandos Adicionais
### Rodar os Testes
Para verificar se todos os endpoints e regras de negócio estão funcionando corretamente, execute a suíte de testes:
```bash
npm test
```

### Reset Completo do Banco de Dados
Para apagar as tabelas, recriá-las e repopulá-las de uma só vez, utilize o script de reset:
```bash
npm run db:reset
```