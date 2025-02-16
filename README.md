﻿
# API de Feriados

Este projeto é uma API para consultar, adicionar e remover feriados municipais e estaduais no Brasil, utilizando Node.js, Express, TypeScript e Swagger para documentação.

##  📌Tecnologias

*   Node.js
*   Express
*   TypeScript
*   Drizzle ORM
*   Swagger (para documentação)

##  Como rodar o projeto

1.  Clone o repositório:

    ```bash
    git clone [https://github.com/Alexsandrodev/api_feriados_node.git]
    cd seu-repositorio
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:

    Crie um arquivo `.env` na raiz do projeto e adicione:

    ```makefile
    DATABASE_URL=seu_banco_de_dados
    PORT=8000
    ```

4.  Inicie o servidor:

    ```bash
    npm start
    ```

    A API estará rodando em `http://localhost:8000` 

##  Documentação da API

Após iniciar o servidor, acesse:

*    Swagger UI → `http://localhost:8000/docs`

##  Rotas da API

*    Buscar feriado

    ```http
    GET /feriados/:codigo_ibge/:data/
    ```

    Exemplo de resposta:

    ```json
    {
        "name": "Consciência Negra"
    }
    ```

*    Adicionar feriado

    ```http
    PUT /feriados/:codigo_ibge/:data/
    ```

    Body:

    ```json
    {
        "name": "Feriado Teste"
    }
    ```

    Exemplo de resposta:

    ```json
    {
        "message": "Feriado adicionado com sucesso!"
    }
    ```

*    Remover feriado

    ```http
    DELETE /feriados/:codigo_ibge/:data/
    ```

    Exemplo de resposta:

    ```json
    {
        "message": "Feriado removido com sucesso!"
    }
    ```
