# Projeto EMA — Estações Meteorológicas Automáticas

Sistema completo para coleta, armazenamento, processamento e visualização de dados meteorológicos em tempo real.

O Projeto EMA é uma iniciativa acadêmica desenvolvida no Instituto Federal de Mato Grosso do Sul (IFMS) com o objetivo de construir uma plataforma integrada de monitoramento meteorológico capaz de coletar dados ambientais, armazená-los, disponibilizá-los através de APIs e gerar previsões utilizando técnicas de Inteligência Artificial.

---

# Objetivos

* Coletar dados meteorológicos em tempo real
* Armazenar informações de forma estruturada
* Disponibilizar dados através de APIs
* Permitir visualização e análise dos dados
* Desenvolver modelos de previsão meteorológica com redes neurais
* Servir como plataforma de pesquisa e aprendizado

---

# Arquitetura do Sistema

O sistema é dividido em quatro componentes principais:

## 1. Estações Meteorológicas

Responsáveis pela aquisição dos dados ambientais.

Exemplos de sensores:

* Temperatura
* Umidade relativa do ar
* Pressão atmosférica
* Luminosidade
* Velocidade do vento
* Pluviosidade

---

## 2. Backend

Responsável por:

* Receber dados das estações
* Validar informações recebidas
* Armazenar dados históricos
* Disponibilizar API REST
* Gerenciar autenticação e acesso

### Tecnologias

* Node.js
* Express
* Sequelize
* PostgreSQL
* Docker

---

## 3. Serviço de Inteligência Artificial

Responsável por:

* Processamento de séries temporais
* Treinamento de redes neurais
* Geração de previsões meteorológicas
* Avaliação de modelos

### Tecnologias

* C++
* Redes neurais desenvolvidas do zero
* Processamento numérico

---

## 4. Frontend

Responsável por:

* Visualização dos dados em tempo real
* Dashboards meteorológicos
* Exibição de históricos
* Consumo da API
* Visualização de previsões

### Tecnologias

* React
* JavaScript
* HTML
* CSS

---

# Estrutura do Projeto

```text
projeto-ema/
│
├── backend/
│   ├── src/
│   ├── database/
│   └── docker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── assets/
│
├── ia/
│   ├── datasets/
│   ├── models/
│   └── src/
│
├── docs/
│   ├── pesquisa/
│   ├── diagramas/
│   └── relatorios/
│
└── README.md
```

---

# Funcionalidades

## Implementadas

* Recebimento de dados meteorológicos
* API REST para acesso aos dados
* Armazenamento em banco de dados
* Interface web para visualização

## Em Desenvolvimento

* Dashboards avançados
* Sistema de alertas meteorológicos
* Múltiplas estações simultâneas
* Treinamento automático de modelos
* Previsões meteorológicas baseadas em IA

---

# Fluxo de Dados

```text
Estação Meteorológica
          │
          ▼
      Backend
          │
 ┌────────┴────────┐
 ▼                 ▼
Banco de Dados     IA
 │                 │
 └────────┬────────┘
          ▼
      Frontend
```

---

# Desenvolvimento

## Clonando o projeto

```bash
git clone https://github.com/henryifms/projeto-ema.git
```

## Instalando dependências

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Executando

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

# Documentação

A documentação técnica e acadêmica está localizada na pasta:

```text
docs/
```

Conteúdo:

* Plano de pesquisa
* Diagramas de arquitetura
* Relatórios técnicos
* Documentação da API
* Estudos sobre redes neurais

---

# Tecnologias Utilizadas

* JavaScript
* Node.js
* Express
* React
* PostgreSQL
* Sequelize
* Docker
* C++
* Git
* Linux

---

# Contribuição

Contribuições são bem-vindas.

Para reportar problemas ou sugerir melhorias:

* Abra uma Issue
* Envie um Pull Request
* Consulte a documentação do projeto

---

# Autor

Henry Thomaz

Instituto Federal de Mato Grosso do Sul (IFMS)

---

# Licença

Este projeto é desenvolvido para fins acadêmicos, pesquisa e aprendizado.

