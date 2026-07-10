# Firmware ESP32 – Estação Meteorológica Conectada (EMA)

## Visão geral

Este firmware é responsável pelo funcionamento da estação meteorológica conectada do projeto **EMA (Estação Meteorológica Automática)**.

Além de realizar as leituras dos sensores e armazenar os dados em um cartão SD, esta versão utiliza a conectividade Wi-Fi do ESP32 para enviar automaticamente as medições para a API do sistema.

O cartão SD funciona como um mecanismo de persistência local, garantindo que nenhuma leitura seja perdida caso a estação fique temporariamente sem acesso à Internet. Assim que a conexão é restabelecida, todos os dados pendentes são enviados para a API.

---

# Componentes utilizados

| Componente    | Função                              |
| ------------- | ----------------------------------- |
| ESP32         | Controlador principal               |
| DHT22         | Temperatura e umidade               |
| Potenciômetro | Simulação do sensor de precipitação |
| RTC DS3231    | Data e hora                         |
| LCD I2C 16x2  | Interface com o usuário             |
| Módulo SD     | Armazenamento local                 |
| Wi-Fi         | Comunicação com a API               |

---

# Fluxo geral do firmware

```text
                Inicialização
                      │
                      ▼
     Configuração dos periféricos
      LCD • RTC • SD • Wi-Fi • DHT
                      │
                      ▼
               Loop principal
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
 Leitura        Atualização      Verificação
 dos sensores      do LCD          do Wi-Fi
      │               │                │
      └───────────────┼────────────────┘
                      │
                      ▼
        Gravação dos dados no SD
                      │
                      ▼
      Existe conexão com a Internet?
              │                 │
             Sim               Não
              │                 │
              ▼                 ▼
     Envia dados à API     Mantém dados
      e limpa JSON          armazenados
```

---

# Processo de inicialização

Quando o ESP32 é ligado, o firmware executa as seguintes etapas:

1. Inicializa a comunicação Serial.
2. Inicializa o sensor DHT22.
3. Inicializa a comunicação I2C.
4. Configura o conversor ADC.
5. Inicializa a comunicação SPI.
6. Inicializa o LCD.
7. Configura os botões.
8. Inicializa o RTC DS3231.
9. Inicializa o cartão SD.
10. Cria o arquivo `dados.json`, caso não exista.
11. Realiza uma varredura das redes Wi-Fi disponíveis.
12. Tenta conectar automaticamente utilizando uma lista de redes previamente cadastradas.
13. Inicia o loop principal.

Caso algum componente crítico, como o RTC ou o cartão SD, não seja inicializado corretamente, a execução é interrompida.

---

# Gerenciamento da conexão Wi-Fi

O firmware possui uma lista de redes Wi-Fi conhecidas.

Durante a inicialização, cada rede é testada até que uma conexão seja estabelecida.

Caso nenhuma rede esteja disponível, o sistema continua operando normalmente em modo offline.

Durante a execução, a conexão também é monitorada periodicamente. Se houver perda de sinal, uma nova tentativa de conexão é realizada automaticamente.

---

# Loop principal

Após a inicialização, o firmware executa continuamente o método `loop()`.

Cada funcionalidade possui seu próprio intervalo de execução utilizando `millis()`, evitando bloqueios causados por atrasos longos.

---

## 1. Controle do LCD

O botão conectado ao pino **26** alterna entre:

* LCD ligado;
* LCD desligado.

Quando desligado, apenas o backlight é desativado.

---

## 2. Troca de telas

O botão conectado ao pino **27** alterna entre duas telas.

### Tela dos sensores

São exibidos:

* temperatura;
* umidade;
* valor da precipitação (potenciômetro);
* status da conexão Wi-Fi.

### Tela do relógio

São exibidos:

* data;
* hora obtida pelo RTC.

---

## 3. Leitura do potenciômetro

O potenciômetro é lido continuamente.

Como o ADC do ESP32 possui resolução diferente da utilizada no Arduino Uno, o valor é convertido para a faixa de **0 a 1023**, mantendo compatibilidade com o restante do projeto.

---

## 4. Leitura do DHT22

O sensor é atualizado a cada **2 segundos**.

Após cada leitura válida são atualizadas:

* temperatura;
* umidade.

Caso a leitura retorne valores inválidos (`NaN`), os dados anteriores são preservados.

---

## 5. Atualização do LCD

O display é atualizado continuamente.

Dependendo da tela selecionada pelo usuário, são exibidas informações dos sensores ou do relógio em tempo real.

---

## 6. Monitoramento da conexão

A cada **30 segundos**, o firmware verifica se ainda existe conexão com a rede Wi-Fi.

Caso a conexão tenha sido perdida, uma nova tentativa de reconexão é realizada automaticamente utilizando todas as redes cadastradas.

---

## 7. Gravação no cartão SD

A cada **60 segundos**, as leituras são armazenadas localmente.

São atualizados dois arquivos:

* `dados.json`;
* `dados.txt`.

Mesmo quando existe conexão com a Internet, os dados são gravados primeiro no cartão SD, garantindo persistência caso ocorra alguma falha durante o envio.

---

# Estrutura dos arquivos

## dados.json

Os registros são armazenados em um único vetor JSON.

Exemplo:

```json
[
  {
    "temperatura": 28.3,
    "umidade": 65.4,
    "precipitacao": 415,
    "data_leitura": "2026-07-10T18:00:00.000Z"
  },
  {
    "temperatura": 28.5,
    "umidade": 64.9,
    "precipitacao": 420,
    "data_leitura": "2026-07-10T18:01:00.000Z"
  }
]
```

Esse formato permite enviar diversos registros em uma única requisição HTTP.

---

## dados.txt

Também é mantido um arquivo texto contendo os mesmos registros em formato tabular.

Exemplo:

```text
10/07/2026;18:00:00;28.3;65.4;415
10/07/2026;18:01:00;28.5;64.9;420
```

Esse arquivo facilita inspeções manuais e importação em planilhas eletrônicas.

---

# Processo de envio para a API

A cada **60 segundos**, o firmware verifica se existe conexão com a Internet.

## Caso exista conexão

1. Abre o arquivo `dados.json`.
2. Lê todo o conteúdo armazenado.
3. Envia os dados para a API utilizando uma requisição HTTP POST.
4. Inclui a chave de autenticação (`x-api-key`) no cabeçalho da requisição.
5. Aguarda a resposta do servidor.

Se o servidor responder com sucesso (HTTP 2xx), o arquivo `dados.json` é limpo, permanecendo apenas um vetor vazio (`[]`).

---

## Caso ocorra falha

Se ocorrer qualquer erro durante o envio:

* perda da conexão;
* erro HTTP;
* indisponibilidade da API;

os dados permanecem armazenados no cartão SD.

Na próxima tentativa, todo o conteúdo ainda pendente será reenviado.

Esse mecanismo evita perda de informações mesmo durante longos períodos sem acesso à Internet.

---

# Persistência dos dados

O firmware utiliza o cartão SD como uma fila persistente.

O fluxo de armazenamento segue a seguinte lógica:

```text
Leitura dos sensores
        │
        ▼
Grava no cartão SD
        │
        ▼
Existe Wi-Fi?
   │          │
  Não        Sim
   │          │
   ▼          ▼
Aguarda    Envia para API
 conexão       │
               ▼
        Servidor respondeu?
           │            │
          Sim          Não
           │            │
           ▼            ▼
 Limpa dados.json   Mantém dados
```

Dessa forma, nenhuma leitura é descartada por falhas de comunicação.

---

# Controle de tempo

O firmware utiliza `millis()` para executar tarefas independentes.

| Intervalo   | Operação                   |
| ----------- | -------------------------- |
| Contínuo    | Leitura do potenciômetro   |
| Contínuo    | Atualização do LCD         |
| 2 segundos  | Leitura do DHT22           |
| 30 segundos | Verificação do Wi-Fi       |
| 60 segundos | Gravação no cartão SD      |
| 60 segundos | Envio dos dados para a API |

Essa abordagem permite que todas as tarefas sejam executadas de forma praticamente simultânea, sem bloquear a execução do programa.

---

# Organização do firmware

O código foi dividido em funções responsáveis por tarefas específicas:

* conexão Wi-Fi;
* reconexão automática;
* leitura dos sensores;
* atualização do LCD;
* gravação dos dados;
* envio para a API.

Essa organização reduz o acoplamento entre as funcionalidades e facilita futuras manutenções.

---

# Resumo do funcionamento

```text
Liga o ESP32
       │
       ▼
Inicializa sensores, RTC, LCD, SD e Wi-Fi
       │
       ▼
Entra no loop principal
       │
       ├── Lê sensores
       ├── Atualiza LCD
       ├── Verifica Wi-Fi
       ├── Salva dados no cartão SD
       ├── Envia dados para a API
       └── Remove do SD apenas os registros enviados com sucesso
```

Este firmware foi desenvolvido para operar de forma autônoma em estações meteorológicas conectadas, garantindo alta disponibilidade dos dados por meio do armazenamento local e do envio automático para a infraestrutura do projeto EMA sempre que houver conectividade com a Internet.

