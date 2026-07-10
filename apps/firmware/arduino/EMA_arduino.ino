// BIBLIOTECAS

// Biblioteca para comunicação SPI (utilizada pelo cartão SD)
#include <SPI.h>

// Biblioteca SdFat (mais rápida e confiável que SD.h)
#include <SdFat.h>

// Biblioteca para comunicação I2C (LCD e RTC)
#include <Wire.h>

// Biblioteca do relógio de tempo real DS3231
#include <RTClib.h>

// Biblioteca para LCD I2C
#include <LiquidCrystal_I2C.h>

// Biblioteca do sensor DHT
#include <DHT.h>

// Biblioteca para manipulação de arquivos JSON
#include <ArduinoJson.h>



// PINOS

// Pino onde está conectado o DHT22
#define DHTPIN A1

// Define o modelo do sensor DHT
#define DHTTYPE DHT22

// Pino do potenciômetro
#define POTENCIOMETROPIN A0

// Botão que liga/desliga a iluminação do LCD
#define BOTAO_LCD 2

// Botão que troca entre as telas do LCD
#define BOTAO_TELA 3

// Pino Chip Select (CS) do módulo SD
const uint8_t chipSelectSD = 10;



// Cria um objeto da biblioteca SdFat chamado SD
SdFat SD;

// Cria um objeto para controlar um LCD I2C
// endereço 0x27 e tamanho 16 colunas x 2 linhas
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Cria um objeto do sensor DHT
DHT dht(DHTPIN, DHTTYPE);

// Cria um objeto do relógio DS3231
RTC_DS3231 rtc;



// Variável para armazenar a temperatura
float temperatura = 0;

// Variável para armazenar a umidade
float umidade = 0;

// Variável para armazenar o valor do potenciômetro
int valorPotenciometro = 0;



// Guarda o instante da última leitura do DHT
unsigned long ultimoDHT = 0;

// Guarda o instante do último registro no SD
unsigned long ultimoRegistro = 0;



// Indica se o LCD está ligado
bool lcdLigado = true;

// false = tela dos sensores
// true = tela do relógio
bool telaRTC = false;



// Guarda o último estado do botão do LCD
bool ultimoEstadoLCD = HIGH;

// Guarda o último estado do botão de troca de tela
bool ultimoEstadoTela = HIGH;

void setup() {

  // Inicializa a comunicação Serial
  Serial.begin(9600);

  // Inicializa o LCD
  lcd.init();

  // Liga a iluminação do LCD
  lcd.backlight();



  // Configura o botão do LCD como entrada com resistor pull-up interno
  pinMode(BOTAO_LCD, INPUT_PULLUP);

  // Configura o botão da troca de tela
  pinMode(BOTAO_TELA, INPUT_PULLUP);



  // Inicializa o sensor DHT
  dht.begin();



  // Inicializa o relógio RTC
  if (!rtc.begin()) {

    // Caso não encontre o RTC
    Serial.println("RTC nao encontrado!");

    // Para o programa para sempre
    while (true);
  }



  // Ajusta a data e hora do RTC usando
  // a data e hora da compilação.
  // Deve ser usado apenas uma vez.
  //
  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));


  // Inicializa o cartão SD
  if (!SD.begin(chipSelectSD, SD_SCK_MHZ(4))) {

    // Caso ocorra erro
    Serial.println("Erro ao iniciar SD");

    // Interrompe o programa
    while (true);
  }



  // Abre o arquivo dados.json.
  // O_RDWR -> leitura e escrita
  // O_CREAT -> cria se não existir
  // O_AT_END -> posiciona no final do arquivo
  File32 arquivo = SD.open("dados.json", O_RDWR | O_CREAT | O_AT_END);



  // Se abriu corretamente
  if (arquivo) {

    // Fecha o arquivo
    arquivo.close();

    // Informa sucesso
    Serial.println("SD inicializado. Arquivo dados.json pronto.");

  } else {

    // Caso não consiga abrir
    Serial.println("Erro ao abrir dados.json no setup.");
  }



  // Limpa o LCD
  lcd.clear();
}

void loop() {

  // Botão liga/desliga LCD
  // Verifica se o botão foi pressionado (estado LOW) e antes estava solto (HIGH)
  bool estadoLCD = digitalRead(BOTAO_LCD);

  if (estadoLCD == LOW && ultimoEstadoLCD == HIGH) {
    lcdLigado = !lcdLigado; // Inverte o estado do LCD

    if (lcdLigado) {
      lcd.backlight(); // Liga a luz de fundo
      lcd.clear(); // Limpa a tela ao ligar
    } else {
      lcd.noBacklight(); // Desliga a luz de fundo
    }

    delay(1000); // Pequeno delay para evitar leituras falsas (debounce)
  }

  ultimoEstadoLCD = estadoLCD; // Atualiza o estado anterior do botão

  // Botão troca de tela
  // Verifica se o botão foi pressionado e o LCD está ligado
  bool estadoTela = digitalRead(BOTAO_TELA);

  if (estadoTela == LOW && ultimoEstadoTela == HIGH) {
    if (lcdLigado) { // Só troca a tela se o LCD estiver ligado, senão não faz sentido
      telaRTC = !telaRTC; // Alterna entre a tela de sensores e a tela do relógio
      lcd.clear(); // Limpa a tela para mostrar a nova informação
    }
    delay(50); // Debounce do botão
  }

  ultimoEstadoTela = estadoTela; // Atualiza o estado anterior do botão

  // Leitura do potenciômetro
  // Converte o valor analógico (0-1023) para um valor digital
  valorPotenciometro = analogRead(POTENCIOMETROPIN);

  // Leitura do DHT a cada 2 segundos
  // Não faz sentido ler o sensor a todo momento, pois ele é lento e gasta processamento
  if (millis() - ultimoDHT >= 2000) {
    ultimoDHT = millis(); // Atualiza o tempo da última leitura

    float t = dht.readTemperature(); // Lê a temperatura
    float u = dht.readHumidity(); // Lê a umidade

    // Verifica se a leitura foi bem sucedida (não retornou NaN - Not a Number)
    if (!isnan(t) && !isnan(u)) {
      temperatura = t; // Atualiza a variável global com a nova temperatura
      umidade = u; // Atualiza a variável global com a nova umidade
    }
  }

  DateTime agora = rtc.now(); // Obtém a data e hora atual do RTC

  // Exibe a tela atual apenas se o LCD estiver ligado
  if (lcdLigado) {
    if (!telaRTC) {
      // Tela 1: Sensores (Temperatura, Umidade, Potenciômetro)
      // Mostra as informações dos sensores na primeira linha
      lcd.setCursor(0, 0);
      lcd.print("T:"); // Temperatura
      lcd.print(temperatura, 1); // Mostra com 1 casa decimal
      lcd.print((char)223); // Símbolo de grau
      lcd.print("C");

      lcd.setCursor(9, 0);
      lcd.print("U:"); // Umidade
      lcd.print(umidade, 0); // Mostra sem casas decimais
      lcd.print("%");

      // Mostra o valor do potenciômetro na segunda linha
      lcd.setCursor(0, 1);
      lcd.print("P:"); // Potenciômetro
      lcd.print(valorPotenciometro);
      lcd.print("    "); // Limpa caracteres residuais da tela

    } else {
      // Tela 2: Data e Hora do RTC
      // Mostra a data no formato DD/MM/AAAA
      lcd.setCursor(0, 0);

      if (agora.day() < 10) lcd.print('0'); // Adiciona zero à esquerda se necessário
      lcd.print(agora.day());
      lcd.print('/');

      if (agora.month() < 10) lcd.print('0');
      lcd.print(agora.month());
      lcd.print('/');
      lcd.print(agora.year());

      // Mostra a hora no formato HH:MM:SS
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

  // Serial monitor - Mostra todas as informações no monitor serial
  // Isso é útil para debug e para ver os dados sem precisar do LCD
  Serial.print(agora.day());
  Serial.print('/');

  if (agora.month() < 10) Serial.print('0');
  Serial.print(agora.month());

  Serial.print('/');
  Serial.print(agora.year());

  Serial.print(" ");

  if (agora.hour() < 10) Serial.print('0');
  Serial.print(agora.hour());
  Serial.print(':');

  if (agora.minute() < 10) Serial.print('0');
  Serial.print(agora.minute());
  Serial.print(':');

  if (agora.second() < 10) Serial.print('0');
  Serial.print(agora.second());

  Serial.print(" | Temp: ");
  Serial.print(temperatura, 1);
  Serial.print(" C | Umidade: ");
  Serial.print(umidade, 1);
  Serial.print("% | Pot: ");
  Serial.println(valorPotenciometro);

  // Registro no SD em formato JSON a cada 1 minuto
  // Guarda os dados tanto em formato JSON quanto em TXT para diferentes usos
  if (millis() - ultimoRegistro >= 60000) {
    ultimoRegistro = millis(); // Atualiza o tempo do último registro

    // Abre os dois arquivos simultaneamente
    File32 arquivoJson = SD.open("dados.json", O_RDWR | O_CREAT | O_AT_END);
    File32 arquivoTxt  = SD.open("dados.txt", O_RDWR | O_CREAT | O_AT_END);

    // Verifica se ambos os arquivos foram abertos com sucesso
    if (!arquivoJson || !arquivoTxt) {
      Serial.println("Erro ao abrir os arquivos!");

      // Fecha os arquivos que foram abertos para não vazar memória
      if (arquivoJson) arquivoJson.close();
      if (arquivoTxt) arquivoTxt.close();

    } else {

      // Cria um documento JSON para armazenar os dados
      JsonDocument doc;                               

      // Formata a data e hora como strings para facilitar a leitura
      char dataStr[11];
      sprintf(dataStr, "%02d/%02d/%04d", agora.day(), agora.month(), agora.year());

      char horaStr[9];
      sprintf(horaStr, "%02d:%02d:%02d", agora.hour(), agora.minute(), agora.second());

      // Preenche o documento JSON com os dados
      doc["data"] = dataStr;
      doc["hora"] = horaStr;
      doc["temperatura"] = temperatura;
      doc["umidade"] = umidade;
      doc["potenciometro"] = valorPotenciometro;

      // Salva no formato JSON (bom para sistemas, fácil de parsear)
      serializeJson(doc, arquivoJson);
      arquivoJson.println(); // Adiciona uma quebra de linha para separar as entradas

      // Salva no formato TXT (bom para humanos, fácil de ler)
      // Usa ponto e vírgula como separador para facilitar importação em planilhas
      arquivoTxt.print(dataStr);
      arquivoTxt.print(";");
      arquivoTxt.print(horaStr);
      arquivoTxt.print(";");
      arquivoTxt.print(temperatura, 1);
      arquivoTxt.print(";");
      arquivoTxt.print(umidade, 1);
      arquivoTxt.print(";");
      arquivoTxt.println(valorPotenciometro);

      // Fecha os arquivos para garantir que os dados foram salvos
      arquivoJson.close();/
      arquivoTxt.close();

      Serial.println("Arquivos JSON e TXT salvos com sucesso!");
    }
  }

  delay(20); // Pequena pausa para dar um tempinho ao processador
}
