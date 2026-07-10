# Firmware Arduino – Estação Meteorológica de Campo (EMA)

## Visão geral

Este firmware é responsável pelo funcionamento da estação meteorológica de campo do projeto **EMA (Estação Meteorológica Automática)**.

Diferentemente da versão baseada em ESP32, esta estação **não possui conexão com a Internet**. Todas as leituras são armazenadas localmente em um cartão SD, permitindo que os dados sejam coletados posteriormente para análise.

O sistema realiza continuamente:

* leitura dos sensores;
* exibição das informações em um display LCD;
* atualização da data e hora através do RTC;
* armazenamento periódico dos dados em arquivos JSON e TXT.

---

# Componentes utilizados

| Componente    | Função                              |
| ------------- | ----------------------------------- |
| Arduino Uno   | Controlador principal               |
| DHT22         | Temperatura e umidade               |
| Potenciômetro | Simulação do sensor de precipitação |
| RTC DS3231    | Data e hora                         |
| LCD I2C 16x2  | Exibição das informações            |
| Módulo SD     | Armazenamento dos dados             |

---

# Fluxo geral do firmware

```text
Inicialização
      │
      ▼
Configuração dos periféricos
(LCD, RTC, DHT e SD)
      │
      ▼
Loop principal
      │
      ├──────────────► Leitura dos botões
      │
      ├──────────────► Leitura do potenciômetro
      │
      ├──────────────► Leitura do DHT (2 s)
      │
      ├──────────────► Atualização do LCD
      │
      ├──────────────► Envio para Serial
      │
      └──────────────► Gravação no SD (60 s)
```

---

# Processo de inicialização

Quando o Arduino é ligado, o firmware executa as seguintes etapas:

1. Inicializa a comunicação Serial.
2. Inicializa o display LCD.
3. Configura os botões com `INPUT_PULLUP`.
4. Inicializa o sensor DHT22.
5. Inicializa o RTC DS3231.
6. Inicializa o cartão SD.
7. Cria (caso não exista) o arquivo `dados.json`.
8. Limpa o display.
9. Entra no loop principal.

Caso o RTC ou o cartão SD apresentem falha durante a inicialização, a execução é interrompida para evitar perda de dados.

---

# Loop principal

Após a inicialização, o firmware executa continuamente o método `loop()`.

Durante cada iteração são realizadas diversas tarefas independentes.

## 1. Controle do LCD

O botão conectado ao pino **2** alterna entre:

* LCD ligado
* LCD desligado

Quando desligado, apenas a iluminação do display é desativada.

---

## 2. Troca de telas

O botão conectado ao pino **3** alterna entre duas telas.

### Tela dos sensores

Exibe:

* temperatura;
* umidade;
* valor do potenciômetro.

### Tela do relógio

Exibe:

* data;
* hora atual obtida pelo RTC.

---

## 3. Leitura do potenciômetro

O potenciômetro é lido continuamente através da entrada analógica.

Seu valor representa a simulação do sensor de precipitação.

---

## 4. Leitura do DHT22

O sensor DHT22 é atualizado **a cada 2 segundos**.

Essa limitação evita leituras excessivas, já que o sensor possui baixa frequência de atualização.

Após cada leitura válida são atualizadas:

* temperatura;
* umidade.

Caso a leitura seja inválida (`NaN`), os valores anteriores são mantidos.

---

## 5. Atualização do RTC

A cada ciclo é obtida a data e hora atual utilizando o módulo DS3231.

Essas informações são utilizadas para:

* exibição no LCD;
* monitor Serial;
* armazenamento no cartão SD.

---

## 6. Monitor Serial

Durante toda a execução, o firmware envia informações para o monitor Serial.

São exibidos:

* data;
* hora;
* temperatura;
* umidade;
* valor do potenciômetro.

Essa saída é utilizada principalmente para testes e depuração do sistema.

---

## 7. Registro no cartão SD

A cada **60 segundos** é realizado o armazenamento das leituras.

São abertos dois arquivos:

* `dados.json`
* `dados.txt`

Caso algum deles não possa ser aberto, uma mensagem de erro é enviada para a Serial.

---

# Estrutura dos arquivos

## dados.json

Cada registro é salvo como um objeto JSON contendo:

* data;
* hora;
* temperatura;
* umidade;
* potenciômetro.

Exemplo:

```json
{
  "data": "10/07/2026",
  "hora": "15:30:00",
  "temperatura": 27.4,
  "umidade": 63.2,
  "potenciometro": 512
}
```

---

## dados.txt

Também é criado um arquivo texto para facilitar a visualização e importação em planilhas.

Formato:

```text
10/07/2026;15:30:00;27.4;63.2;512
```

Cada linha representa uma leitura realizada.

---

# Controle de tempo

O firmware utiliza `millis()` para controlar tarefas periódicas.

| Intervalo   | Operação              |
| ----------- | --------------------- |
| Contínuo    | Potenciômetro         |
| 2 segundos  | DHT22                 |
| Contínuo    | Atualização do LCD    |
| Contínuo    | Monitor Serial        |
| 60 segundos | Gravação no cartão SD |

Esse método evita o uso de atrasos longos (`delay`) e permite que todas as tarefas funcionem de maneira praticamente simultânea.

---

# Organização do sistema

O firmware foi dividido em responsabilidades independentes:

* inicialização dos periféricos;
* leitura dos sensores;
* interface com o usuário (LCD);
* gerenciamento de data e hora;
* armazenamento dos dados;
* monitoramento via Serial.

Essa organização facilita futuras modificações e a migração para outras plataformas, como o ESP32.

---

# Resumo do funcionamento

```text
Liga o Arduino
        │
        ▼
Inicializa LCD, RTC, DHT e SD
        │
        ▼
Entra no loop infinito
        │
        ├── Lê botões
        ├── Atualiza LCD
        ├── Lê potenciômetro
        ├── Atualiza DHT a cada 2 s
        ├── Atualiza data e hora
        ├── Exibe informações na Serial
        └── Salva JSON e TXT a cada 60 s
```

Este firmware foi desenvolvido para garantir o registro contínuo dos dados meteorológicos em locais sem acesso à Internet, armazenando todas as informações de forma segura no cartão SD para posterior coleta e processamento.

