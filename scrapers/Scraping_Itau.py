from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from time import sleep
import csv
import tempfile
from pymongo import MongoClient

# Configurações do Chrome para Docker + Headless
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")

# Iniciar o driver com opções
driver = webdriver.Chrome(options=options)

# Acessar o site
driver.get("https://www.itau.com.br/imoveis-itau?leilao=true&estado=S%C3%83O+PAULO&cidade=S%C3%83O+PAULO")
sleep(5)  # Você pode trocar por WebDriverWait depois se quiser mais robustez

# Extrair dados dos cards dentro do Shadow DOM
cards = driver.execute_script("""
    const appRoot = document.querySelector("app-leiloes-list");
    if (!appRoot) return [];
    const shadow = appRoot.shadowRoot;
    if (!shadow) return [];
    const container = shadow.querySelector(".itau-leiloes-pagination-cards");
    return Array.from(container ? container.querySelectorAll(".itau-leiloes-card") : []);
""")

dados = []

for card in cards:
    try:
        imagem = driver.execute_script("return arguments[0].querySelector('img.itau-leiloes-carrousel-image')?.src;", card)
    except:
        imagem = "N/A"

    try:
        endereco = driver.execute_script("return arguments[0].querySelector('.itau-leiloes-card-info')?.textContent;", card)
    except:
        endereco = "N/A"

    print(f"Imagem: {imagem}")
    print(f"Endereço: {endereco}")
    print("---")

    dados.append({"imagem": imagem, "endereco": endereco})

# Salvar em CSV
with open("imoveis4.csv", "w", newline="", encoding="utf-8") as arquivo_csv:
    writer = csv.DictWriter(arquivo_csv, fieldnames=["imagem", "endereco"])
    writer.writeheader()
    for dado in dados:
        writer.writerow(dado)

driver.quit()
