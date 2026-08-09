# Sistema de Web Scraping de Livros

Este projeto implementa uma arquitetura distribuída para um sistema de pesquisa e extração de informações sobre livros. A solução está dividida em microsserviços para garantir escalabilidade, processamento assíncrono de tarefas pesadas e uma clara separação de responsabilidades.

---

## Estrutura do Repositório

```text
.
├── backend-laravel/     # API Central e orquestrador em Laravel
├── frontend-vue/        # Interface de utilizador em Vue.js
└── scraping-service/    # Microsserviço de scraping em Node.js
```

---

## Requisitos do Sistema

Para executar este projeto, certifique-se de que possui os seguintes softwares instalados no seu ambiente de desenvolvimento:

*   **Docker** e **Docker Compose** (recomendado para a execução dos serviços e bases de dados)
*   **PHP** >= 8.2 (caso execute o Laravel fora de contentor)
*   **Composer** (gestor de dependências do PHP)
*   **Node.js** >= 18.x e **npm** / **yarn** (para o frontend e o microsserviço Node.js)
*   **Redis** (servidor de filas, caso não utilize o Docker Compose)

---

## Variáveis de Ambiente

Crie e configure os ficheiros `.env` em cada microsserviço conforme as necessidades do seu ambiente. Abaixo encontram-se as principais variáveis de configuração utilizadas (com foco no microsserviço de scraping):

```env
# --- Redis / BullMQ ------------------------------------------------------------
REDIS_HOST=localhost
REDIS_PORT=6379

# --- Servidor Express (rota /scrape) --------------------------------------------
PORT=3000

SCRAPE_CONCURRENCY=3
SCRAPER_ENGINE=camoufox
# SCRAPER_HEADLESS=true

LARAVEL_API_URL=http://localhost:8000/api
```

---

## Arquitetura do Sistema

O sistema é composto pelas seguintes tecnologias e serviços principais:

*   **Frontend (Vue.js):** Interface de utilizador responsável por iniciar pedidos de scraping, consultar estados e apresentar os resultados das pesquisas de livros.
*   **Backend / API Principal (Laravel):** Atua como orquestrador central. Recebe os pedidos do frontend, gere a segurança, e comunica com o serviço de scraping.
*   **Worker de Scraping (Node.js):** Um microsserviço dedicado à execução assíncrona das tarefas de extração de dados.
*   **Mensageria e Filas (Redis + BullMQ):** Sistema escolhido para a gestão de jobs em background, devido à sua baixa latência e gestão nativa do estado das tarefas.

---

## Segurança e Fluxo de Comunicação

O sistema implementa fronteiras estritas de segurança entre os seus componentes:

| Origem | Destino | Finalidade | Mecanismo de Proteção |
| :--- | :--- | :--- | :--- |
| **Vue.js** | **Laravel** | Iniciar scraping, consultar estado e pesquisar livros. | API key, validação de origem (CORS) e rate limiting. |
| **Laravel** | **Node.js** | Enviar tarefas de scraping para a fila de processamento. | Comunicação interna de rede (isolada). |
| **Node.js** | **Laravel** | Enviar resultados (callbacks) e atualizar estados dos jobs. | Token partilhado validado pelo middleware `VerifyNodeApiKey`. |

---

## API de Scraping (Microsserviço Node.js)

O serviço Node.js expõe os seguintes endpoints internos para a gestão da fila de trabalhos (acessíveis apenas pelo Laravel):

### POST /scrape
Inicia um novo trabalho de scraping e coloca-o na fila BullMQ.
*   **Payload:** Requer `strategy`, `callback_url` e `run_token`.
*   **Respostas:**
    *   `202 Accepted`: Sucesso. Retorna o ID do job e o total de tarefas criadas.
    *   `400 Bad Request`: Erros de validação nos parâmetros enviados.

### GET /scrape/:id
Consulta o estado em tempo real de um trabalho de scraping.
*   **Respostas:**
    *   `200 OK`: Retorna o estado atual e a percentagem de progresso do job.
    *   `404 Not Found`: Caso o ID do job não exista na fila Redis.

---

## Decisões de Arquitetura: Fila de Processamento

Para o processamento assíncrono das tarefas de scraping, optou-se pela stack **Redis + BullMQ** em vez do tradicional RabbitMQ (AMQP). Os principais motivos incluem:

*   **Latência e Desempenho:** Acesso direto à memória com latência reduzida.
*   **Gestão de Estado:** Visibilidade nativa e simplificada do progresso do job, ideal para reportar o estado de volta ao Laravel e Vue.js.
*   **Complexidade Operacional:** Implementação mais limpa e de baixo consumo de recursos através de contentores Docker.

---

## Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-utilizador/seu-repositorio.git
   ```
2. Suba os serviços utilizando o Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Configure as variáveis de ambiente (`.env`) nos diretórios do Laravel e do Node.js, certificando-se de partilhar o token de segurança entre eles.
4. Execute as migrações do Laravel:
   ```bash
   php artisan migrate
   ```

---

## Testes

Para garantir a integridade do código e o correto funcionamento dos microsserviços, pode executar a bateria de testes disponível em cada módulo:

*   **Backend (Laravel):**
    ```bash
    php artisan test
    ```
*   **Microsserviço de Scraping (Node.js):**
    ```bash
    npm test
    ```

---

## Contribuição

Contribuições são sempre bem-vindas! Se encontrar algum *bug* ou tiver sugestões de melhoria:
1. Faça um *fork* do repositório.
2. Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-funcionalidade`).
3. Faça o *commit* das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`).
4. Envie para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um *Pull Request*.

---

## Direitos de Autor e Licença

Este projeto está licenciado sob a **MIT License**. Consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.
