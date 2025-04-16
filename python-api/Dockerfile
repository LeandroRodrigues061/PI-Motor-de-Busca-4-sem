FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Instala dependências do Chrome headless
RUN apt-get update && \
    apt-get install -y wget gnupg unzip && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome*.deb && \
    rm google-chrome*.deb

# Instala o ChromeDriver compatível
RUN CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+') && \
    wget -O chromedriver.zip https://chromedriver.storage.googleapis.com/${CHROME_VERSION}/chromedriver_linux64.zip && \
    unzip chromedriver.zip && mv chromedriver /usr/local/bin/ && chmod +x /usr/local/bin/chromedriver && rm chromedriver.zip

EXPOSE 5000
CMD ["python", "app.py"]
