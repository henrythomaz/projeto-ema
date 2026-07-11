// BIBLIOTECAS
#include <SPI.h>              // Comunicação SPI para o cartão SD
#include <SdFat.h>            // Biblioteca para manipulação de cartões SD
#include <Wire.h>             // Comunicação I2C (para RTC e LCD)
#include <RTClib.h>           // Biblioteca para o RTC DS3231
#include <LiquidCrystal_I2C.h>// Biblioteca para display LCD I2C (pode gerar aviso em ESP32, mas é funcional)
#include <DHT.h>              // Biblioteca para o sensor DHT22
#include <ArduinoJson.h>      // Biblioteca para manipulação de JSON
#include <WiFi.h>             // Conexão WiFi no ESP32
#include <HTTPClient.h>       // Cliente HTTP para enviar dados à API
#include <ArduinoOTA.h>       // Permite boot por WiFi

// PINOS
#define DHTPIN 4              // Pino do sensor DHT22
#define DHTTYPE DHT22         // Tipo do sensor
#define POTENCIOMETROPIN 32   // Pino do potenciômetro (entrada analógica)
#define BOTAO_LCD 26          // Pino do botão para ligar/desligar o backlight do LCD
#define BOTAO_TELA 27         // Pino do botão para alternar a tela (relógio vs sensores)
const uint8_t chipSelectSD = 5; // Pino CS (Chip Select) do cartão SD

// CONFIGURAÇÕES DA API
const char* apiUrl = "https://suspensive-scarabaeoid-pattie.ngrok-free.dev/leituras";
const char* apiKey = "9315b5ee-32d8-44f8-a945-e676a197d925";

// REDES WI-FI (LISTA DE SSID E SENA)
struct RedeWiFi {
  const char* ssid;
  const char* senha;
};

RedeWiFi redes[] = {
  { "H", "henry123" },
  { "Doce_arts", "megcovarde2224" },
  { "AOW POVO FEIO", "perguntaparapatroa" },
  { "Varone", "varone1621" }
};

const int TOTAL_REDES = sizeof(redes) / sizeof(redes[0]);

// OBJETOS
SdFat SD;                     // Objeto para o cartão SD
LiquidCrystal_I2C lcd(0x27, 16, 2); // LCD I2C (endereço 0x27, 16 colunas, 2 linhas)
DHT dht(DHTPIN, DHTTYPE);     // Sensor DHT
RTC_DS3231 rtc;               // RTC DS3231

// VARIÁVEIS GLOBAIS
float temperatura = 0;        // Última temperatura lida
float umidade = 0;            // Última umidade lida
int valorPotenciometro = 0;   // Última leitura do potenciômetro (0-1023)

// Temporizadores para controlar a frequência das ações
unsigned long ultimoDHT = 0;          // Última leitura do DHT
unsigned long ultimoRegistro = 0;     // Última gravação no SD
unsigned long ultimoEnvio = 0;        // Último envio para API
unsigned long ultimoStatusWiFi = 0;   // Última verificação de WiFi
unsigned long ultimoSerial = 0;       // Última impressão serial (agora a cada minuto)

bool lcdLigado = true;        // Estado do backlight do LCD
bool telaRTC = false;         // false = tela de sensores, true = tela de relógio

bool ultimoEstadoLCD = HIGH;  // Estado anterior do botão LCD (para detectar borda de descida)
bool ultimoEstadoTela = HIGH; // Estado anterior do botão de tela

// FUNÇÃO: CONECTA AO WI-FI (TENTA TODAS AS REDES DA LISTA)
bool conectarWiFi() {
  WiFi.mode(WIFI_STA);          // Modo estação
  WiFi.setSleep(false);         // Desativa o sleep para melhor desempenho

  for (int i = 0; i < TOTAL_REDES; i++) {
    Serial.println();
    Serial.print("[INFO] Tentando conectar em: ");
    Serial.println(redes[i].ssid);

    WiFi.begin(redes[i].ssid, redes[i].senha);

    int tentativas = 0;
    while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
      delay(500);
      Serial.print(".");
      tentativas++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[SUCESSO] WiFi conectado!");
      Serial.print("[INFO] Rede: ");
      Serial.println(redes[i].ssid);
      Serial.print("[INFO] IP: ");
      Serial.println(WiFi.localIP());
      Serial.print("[INFO] RSSI: ");
      Serial.println(WiFi.RSSI());
      return true;
    }

    WiFi.disconnect(true);      // Desconecta para tentar a próxima rede
    delay(1000);
  }

  Serial.println("[ERRO] Nenhuma rede conhecida disponível.");
  return false;
}

// FUNÇÃO: ENVIA O CONTEÚDO DE dados.json PARA A API
void enviarDadosParaAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERRO] WiFi não está conectado! Não é possível enviar.");
    return;
  }

  Serial.println("[INFO] Iniciando envio para API...");

  FsFile arquivo = SD.open("dados.json", O_READ);
  if (!arquivo) {
    Serial.println("[ERRO] Não foi possível abrir dados.json para leitura.");
    return;
  }

  String jsonContent;
  while (arquivo.available()) {
    jsonContent += (char)arquivo.read();
  }
  arquivo.close();

  if (jsonContent.length() <= 2 || jsonContent == "[]") {
    Serial.println("[INFO] Nenhum dado novo para enviar (arquivo vazio).");
    return;
  }

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", apiKey);
  http.setTimeout(10000);

  int httpResponseCode = http.POST(jsonContent);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[INFO] Código HTTP: %d\n", httpResponseCode);
    Serial.println("[INFO] Resposta: " + response);

    if (httpResponseCode >= 200 && httpResponseCode < 300) {
      Serial.println("[INFO] Envio bem-sucedido! Limpando dados.json.");
      FsFile clearFile = SD.open("dados.json", O_WRITE | O_CREAT | O_TRUNC);
      if (clearFile) {
        clearFile.print("[]");
        clearFile.close();
        Serial.println("[INFO] dados.json limpo.");
      }
    } else {
      Serial.println("[AVISO] Falha no envio. Dados mantidos no SD.");
    }
  } else {
    Serial.printf("[ERRO] Falha na requisição HTTP: %d\n", httpResponseCode);
  }

  http.end();
  Serial.println("[INFO] Envio finalizado.");
}

// FUNÇÃO: LEITURA DO SENSOR DHT (ATUALIZA AS VARIÁVEIS GLOBAIS)
void lerSensorDHT() {
  float t = dht.readTemperature();
  float u = dht.readHumidity();
  if (!isnan(t) && !isnan(u)) {
    temperatura = t;
    umidade = u;
  } else {
    Serial.println("[AVISO] Falha na leitura do DHT (dados NaN).");
  }
}

// FUNÇÃO: LEITURA DO POTENCIÔMETRO
void lerPotenciometro() {
  valorPotenciometro = map(analogRead(POTENCIOMETROPIN), 0, 4095, 0, 1023);
}

// FUNÇÃO: ATUALIZA O DISPLAY LCD
void atualizarLCD(DateTime agora) {
  if (!lcdLigado) return; // Se o LCD estiver desligado, não faz nada

  if (!telaRTC) {
    // Tela de sensores
    lcd.setCursor(0, 0);
    lcd.print("T:");
    lcd.print(temperatura, 1);
    lcd.print((char)223);
    lcd.print("C");
    lcd.setCursor(9, 0);
    lcd.print("U:");
    lcd.print(umidade, 0);
    lcd.print("%");

    // Linha 1: potenciômetro + status Wi-Fi
    lcd.setCursor(0, 1);
    lcd.print("P:");
    lcd.print(valorPotenciometro);
    lcd.print(" W:");
    if (WiFi.status() == WL_CONNECTED) {
      lcd.print("ON ");
    } else {
      lcd.print("OFF");
    }
    // Limpa o restante da linha (até a coluna 15)
    for (int i = 0; i < 4; i++) lcd.print(" ");
  } else {
    // Tela de relógio
    lcd.setCursor(0, 0);
    if (agora.day() < 10) lcd.print('0');
    lcd.print(agora.day());
    lcd.print('/');
    if (agora.month() < 10) lcd.print('0');
    lcd.print(agora.month());
    lcd.print('/');
    lcd.print(agora.year());
    lcd.setCursor(0, 1);
    if (agora.hour() < 10) lcd.print('0');
    lcd.print(agora.hour());
    lcd.print(':');
    if (agora.minute() < 10) lcd.print('0');
    lcd.print(agora.minute());
    lcd.print(':');
    if (agora.second() < 10) lcd.print('0');
    lcd.print(agora.second());
  }
}

// FUNÇÃO: GRAVAÇÃO DOS DADOS NO SD (JSON E TXT)
void gravarNoSD(DateTime agora) {
  Serial.println("[INFO] Iniciando gravação periódica no SD...");

  // Atualiza dados.json (formato JSON)
  FsFile arquivoJson = SD.open("dados.json", O_RDWR | O_CREAT);
  if (!arquivoJson) {
    Serial.println("[ERRO] Não foi possível abrir dados.json para escrita.");
  } else {
    uint32_t tamanho = arquivoJson.size();

    // Usa JsonDocument (recomendado) em vez de StaticJsonDocument (deprecated)
    JsonDocument doc;
    char dataISO[25];
    sprintf(dataISO, "%04d-%02d-%02dT%02d:%02d:%02d.000Z",
            agora.year(), agora.month(), agora.day(),
            agora.hour(), agora.minute(), agora.second());

    doc["temperatura"] = temperatura;
    doc["umidade"] = umidade;
    doc["precipitacao"] = valorPotenciometro;
    doc["data_leitura"] = dataISO;

    String novoObjeto;
    serializeJson(doc, novoObjeto);

    if (tamanho == 0 || tamanho == 2) {
      // Se o arquivo estiver vazio ou contiver apenas "[]", escreve o primeiro objeto
      if (tamanho == 0) arquivoJson.print("[");
      else {
        arquivoJson.seek(0);
        arquivoJson.print("[");
      }
      arquivoJson.print(novoObjeto);
      arquivoJson.print("]");
    } else {
      // Caso contrário, insere vírgula e novo objeto antes do colchete final
      arquivoJson.seek(tamanho - 1);
      arquivoJson.print(",");
      arquivoJson.print(novoObjeto);
      arquivoJson.print("]");
    }
    arquivoJson.close();
  }

  // Atualiza dados.txt (formato texto separado por ponto e vírgula)
  FsFile arquivoTxt = SD.open("dados.txt", O_RDWR | O_CREAT | O_AT_END);
  if (!arquivoTxt) {
    Serial.println("[ERRO] Não foi possível abrir dados.txt para escrita.");
  } else {
    char dataStr[11], horaStr[9];
    sprintf(dataStr, "%02d/%02d/%04d", agora.day(), agora.month(), agora.year());
    sprintf(horaStr, "%02d:%02d:%02d", agora.hour(), agora.minute(), agora.second());
    arquivoTxt.print(dataStr);
    arquivoTxt.print(";");
    arquivoTxt.print(horaStr);
    arquivoTxt.print(";");
    arquivoTxt.print(temperatura, 1);
    arquivoTxt.print(";");
    arquivoTxt.print(umidade, 1);
    arquivoTxt.print(";");
    arquivoTxt.println(valorPotenciometro);
    arquivoTxt.close();
  }

  // Impressão serial dos dados (a cada minuto)
  char dataHora[20];  
  sprintf(dataHora, "%02d/%02d/%04d %02d:%02d:%02d", agora.day(), agora.month(), agora.year(), agora.hour(), agora.minute(), agora.second());

  Serial.print("[DADO] ");
  Serial.print(dataHora);
  Serial.print(" | Temp: ");
  Serial.print(temperatura, 1);
  Serial.print(" C | Umidade: ");
  Serial.print(umidade, 1);
  Serial.print("% | Precipitação: ");
  Serial.print(valorPotenciometro);
  Serial.print(" | WiFi: ");
  Serial.print(WiFi.status() == WL_CONNECTED ? "ON" : "OFF");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" (RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.print(")");
  }
  Serial.println();

  Serial.println("[INFO] Gravação periódica concluída.");
}

// FUNÇÃO: VERIFICA E RECONECTA O WI-FI SE NECESSÁRIO
void verificarConexaoWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[AVISO] WiFi desconectado. Tentando reconectar usando a lista...");
    if (conectarWiFi()) {
      Serial.println("[INFO] WiFi reconectado com sucesso!");
    } else {
      Serial.println("[ERRO] Falha na reconexão. Nenhuma rede disponível.");
    }
  }
}

// SETUP
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n[INFO] INICIALIZAÇÃO DO SISTEMA");
  Serial.println("[INFO] Versão: 2.1 - Com funções organizadas e serial limpa");

  // Inicializa sensor DHT
  dht.begin();
  Serial.println("[INFO] Sensor DHT inicializado.");

  // Inicializa I2C (pinos padrão do ESP32: SDA=21, SCL=22)
  Wire.begin(21, 22);
  Serial.println("[INFO] I2C inicializado (pinos 21,22).");

  // Configura a atenuação do ADC para leitura de tensões até ~3.6V
  analogSetAttenuation(ADC_11db);
  Serial.println("[INFO] ADC configurado (atenuação 11dB).");

  // Inicializa SPI para o cartão SD (pinos: SCK=18, MISO=19, MOSI=23, CS=5)
  SPI.begin(18, 19, 23, 5);
  Serial.println("[INFO] SPI inicializado.");

  // Inicializa LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  Serial.println("[INFO] LCD inicializado (endereço 0x27).");

  // Configura botões com pull-up interno
  pinMode(BOTAO_LCD, INPUT_PULLUP);
  pinMode(BOTAO_TELA, INPUT_PULLUP);
  Serial.println("[INFO] Botões configurados como INPUT_PULLUP.");

  // Inicializa RTC DS3231
  if (!rtc.begin()) {
    Serial.println("[ERRO] RTC DS3231 não encontrado! Verifique a fiação.");
    while (true);
  }
  Serial.println("[INFO] RTC DS3231 inicializado.");
  
  // Verifica se o RTC perdeu energia (bateria descarregada)
  if (rtc.lostPower()) {
    Serial.println("[INFO] RTC com hora inválida! Ajustando com hora da compilação...");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  } else {
    Serial.println("[INFO] RTC está com hora válida.");
  }

  // Inicializa cartão SD
  Serial.print("[INFO] Inicializando cartão SD...");
  if (!SD.begin(chipSelectSD, SD_SCK_MHZ(4))) {
    Serial.println("\n[ERRO] Falha ao iniciar SD! Verifique o cartão e os pinos.");
    while (true);
  }
  Serial.println(" OK!");

  // Cria o arquivo dados.json se não existir
  FsFile arquivo = SD.open("dados.json", O_RDWR | O_CREAT);
  if (arquivo) {
    if (arquivo.size() == 0) {
      arquivo.print("[]");
      Serial.println("[INFO] dados.json criado com '[]'.");
    }
    arquivo.close();
  } else {
    Serial.println("[ERRO] Não foi possível criar/abrir dados.json.");
  }

  // CONEXÃO WI-FI USANDO A LISTA DE REDES
  Serial.println("\n[INFO] INICIANDO CONEXÃO WI-FI");
  
  // Faz um scan para mostrar as redes disponíveis (apenas informativo)
  Serial.println("[INFO] Realizando scan de redes WiFi...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("[ERRO] Nenhuma rede WiFi encontrada.");
  } else {
    Serial.print("[INFO] ");
    Serial.print(n);
    Serial.println(" redes encontradas:");
    for (int i = 0; i < n; i++) {
      Serial.print("  ");
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" (");
      Serial.print(WiFi.RSSI(i));
      Serial.print(" dBm) ");
      Serial.println(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "Aberta" : "Protegida");
    }
  }
  WiFi.scanDelete();

  // Tenta conectar usando a lista
  if (conectarWiFi()) {
    Serial.println("[INFO] WiFi conectado com sucesso.");
    
    // ===== CONFIGURAÇÃO DO OTA =====
    ArduinoOTA.setHostname("ESP32_Estacao_Meteo");   // Nome que aparecerá na rede
    ArduinoOTA.setPassword("admin");                 // Senha para atualização (opcional, mas recomendado)

    // Callbacks (opcionais, mas úteis para depuração)
    ArduinoOTA.onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH) {
        type = "sketch";
      } else { // U_SPIFFS
        type = "filesystem";
      }
      Serial.println("[OTA] Iniciando atualização: " + type);
    });
    ArduinoOTA.onEnd([]() {
      Serial.println("\n[OTA] Atualização concluída!");
    });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("[OTA] Progresso: %u%%\r", (progress / (total / 100)));
    });
    ArduinoOTA.onError([](ota_error_t error) {
      Serial.printf("[OTA] Erro[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Falha de autenticação");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Falha ao iniciar");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Falha de conexão");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Falha ao receber dados");
      else if (error == OTA_END_ERROR) Serial.println("Falha ao finalizar");
    });

    ArduinoOTA.begin();
    Serial.println("[INFO] OTA inicializado e pronto para atualizações.");
    Serial.println("[INFO] Hostname: ESP32_Estacao_Meteo");
    Serial.println("[INFO] Senha OTA: admin");
    
  } else {
    Serial.println("[INFO] Operando em modo offline. OTA não disponível.");
  }

  lcd.clear();
  Serial.println("[INFO] Setup concluído. Entrando no loop principal.\n");
}

// LOOP PRINCIPAL
void loop() {
  ArduinoOTA.handle(); // Mantém o OTA ativo para receber atualizações
  
  // Leitura dos botões (com debounce simples)
  bool estadoLCD = digitalRead(BOTAO_LCD);
  if (estadoLCD == LOW && ultimoEstadoLCD == HIGH) {
    lcdLigado = !lcdLigado;
    if (lcdLigado) {
      lcd.backlight();
      lcd.clear();
      Serial.println("[INFO] LCD ligado (backlight ON).");
    } else {
      lcd.noBacklight();
      Serial.println("[INFO] LCD desligado (backlight OFF).");
    }
    delay(1000); // Debounce
  }
  ultimoEstadoLCD = estadoLCD;

  bool estadoTela = digitalRead(BOTAO_TELA);
  if (estadoTela == LOW && ultimoEstadoTela == HIGH) {
    if (lcdLigado) {
      telaRTC = !telaRTC;
      lcd.clear();
      Serial.print("[INFO] Tela LCD alternada para: ");
      Serial.println(telaRTC ? "Relógio" : "Sensores");
    }
    delay(50); // Debounce
  }
  ultimoEstadoTela = estadoTela;

  // Leitura do potenciômetro (a cada loop)
  lerPotenciometro();

  // Leitura do DHT a cada 2 segundos
  if (millis() - ultimoDHT >= 2000) {
    ultimoDHT = millis();
    lerSensorDHT();
  }

  // Data/hora atual (do RTC)
  DateTime agora = rtc.now();

  // Atualiza o LCD (se ligado)
  atualizarLCD(agora);

  // Verificação periódica do Wi-Fi (a cada 30 segundos)
  if (millis() - ultimoStatusWiFi >= 30000) {
    ultimoStatusWiFi = millis();
    verificarConexaoWiFi();
  }

  // Gravação no SD e impressão serial a cada 1 minuto
  if (millis() - ultimoRegistro >= 60000) {
    ultimoRegistro = millis();
    gravarNoSD(agora);
  }

  // Envio para API a cada 1 minuto (separado da gravação, mas no mesmo ciclo)
  // A cada 60 segundos, também tentamos enviar.
  if (millis() - ultimoEnvio >= 60000) {
    ultimoEnvio = millis();
    Serial.println("[INFO] CICLO DE ENVIO");

    if (WiFi.status() == WL_CONNECTED) {
      enviarDadosParaAPI();
    } else {
      Serial.println("[ERRO] WiFi desconectado! Tentando reconectar...");
      if (conectarWiFi()) {
        Serial.println("[INFO] WiFi reconectado com sucesso!");
        enviarDadosParaAPI();
      } else {
        Serial.println("[ERRO] Falha na reconexão. Envio adiado.");
      }
    }
    Serial.println("[INFO] CICLO DE ENVIO FINALIZADO \n");
  }

  delay(20); // Pequeno atraso para evitar loop muito rápido
}

