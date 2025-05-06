# Base com Python e suporte ao Chrome
FROM python:3.11-slim

# Atualiza pacotes e instala dependências do Chrome e Selenium
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libgbm1 \
    chromium \
    chromium-driver \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Variável de ambiente para rodar Chrome no modo headless
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_BIN=/usr/bin/chromedriver

# Diretório de trabalho
WORKDIR /app

# Copia o código
COPY . /app

# Instala dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Comando padrão (pode trocar por run_all.py ou qualquer script)
CMD ["python", "run_all.py"]
