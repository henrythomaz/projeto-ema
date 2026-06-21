# Projeto EMA — Estações Meteorológicas Automáticas

Sistema completo para coleta, armazenamento, processamento e visualização de dados meteorológicos em tempo real.

![Logotipo do projeto](/images/cover.png)

O Projeto EMA é uma iniciativa acadêmica desenvolvida no Instituto Federal de Mato Grosso do Sul (IFMS) com o objetivo de construir uma plataforma integrada de monitoramento meteorológico capaz de coletar dados ambientais, armazená-los, disponibilizá-los através de APIs e gerar análises estatísticas e espaciais a partir de múltiplas estações meteorológicas.

---

# Objetivos

* Coletar dados meteorológicos em tempo real
* Armazenar informações de forma estruturada
* Disponibilizar dados através de APIs
* Permitir visualização e análise dos dados
* Realizar processamento estatístico dos dados coletados
* Aplicar técnicas de triangulação e interpolação espacial
* Servir como plataforma de pesquisa e aprendizado

---

# Arquitetura do Sistema

O sistema é dividido em três componentes principais.

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
* Integrar os serviços de processamento

### Tecnologias

* Node.js
* Express
* Sequelize
* PostgreSQL
* PostGIS
* Redis
* Docker

---

## 3. Processamento Científico

Responsável por:

* Tratamento de dados meteorológicos
* Cálculos estatísticos
* Triangulação espacial entre estações
* Interpolação de valores geográficos
* Geração de informações derivadas

### Tecnologias

* C++
* Algoritmos numéricos
* Geometria computacional
* Processamento de dados

---

## 4. Frontend

Responsável por:

* Visualização dos dados em tempo real
* Dashboards meteorológicos
* Exibição de históricos
* Consumo da API
* Visualização geográfica das estações
* Consulta de métricas ambientais

### Tecnologias

* React
* TypeScript
* Vite
* Tailwind CSS

---

# Estrutura do Projeto

```text
projeto-ema/
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   └── docker/
│   │
│   └── web/
│       ├── src/
│       └── public/
│
├── infra/
│   ├── docker/
│   └── nginx/
│
├── images/
│
├── Dockerfile.api
├── package.json
└── README.md
```

---

# Funcionalidades

## Implementadas

* Cadastro e autenticação de usuários
* Recebimento de dados meteorológicos
* API REST
* Banco de dados PostgreSQL
* Interface web para visualização
* Gerenciamento de estações
* Histórico de medições

## Em Desenvolvimento

* Triangulação automática entre estações
* Interpolação espacial de dados
* Dashboards avançados
* Sistema de alertas meteorológicos
* Múltiplas estações simultâneas
* Mapas meteorológicos

---

# Fluxo de Dados

```text
Estações Meteorológicas
           │
           ▼
        Backend
           │
           ▼
 PostgreSQL/PostGIS
           │
    ┌──────┴──────┐
    ▼             ▼
Processamento     API
 em C++
    │
    ▼
 Frontend
```

---

# Tecnologias Utilizadas

* TypeScript
* Node.js
* Express
* React
* PostgreSQL
* PostGIS
* Redis
* Docker
* Nginx
* C++
* Git
* Linux

---

# Desenvolvimento

## Clonando o projeto

```bash
git clone https://github.com/henryifms/projeto-ema.git
```

## Instalação

```bash
yarn install
```

## Executando o frontend

```bash
yarn web
```

## Executando a API

```bash
yarn api
```

## Ambiente Docker

```bash
cd infra/docker
docker compose up --build
```

---

# Aplicações Acadêmicas

O Projeto EMA pode ser utilizado em estudos envolvendo:

* Meteorologia
* Estatística
* Geoprocessamento
* Sistemas Distribuídos
* Banco de Dados Geográficos
* Programação Científica
* Internet das Coisas (IoT)

---

# Contribuição

Contribuições são bem-vindas.

Para reportar problemas ou sugerir melhorias:

* Abra uma Issue
* Envie um Pull Request

---

# Autor

Henry Thomaz

Instituto Federal de Mato Grosso do Sul (IFMS)

---

# Licença

Este projeto é livre para uso, estudo, modificação e distribuição, para fins acadêmicos, educacionais, comerciais ou pessoais.

