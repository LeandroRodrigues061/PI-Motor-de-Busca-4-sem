from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.common.exceptions import JavascriptException, NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.shadowroot import ShadowRoot
from time import sleep
import time
import tempfile
from pymongo import MongoClient, errors

# Conectar ao MongoDB
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB com sucesso.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

# Configurar Chrome headless
options = Options()
options.headless = False
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36")
options.add_argument('--window-size=1366,768')
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")


driver = webdriver.Chrome(options=options)

try:
    driver.get("https://www.itau.com.br/imoveis-itau?estado=S%C3%83O+PAULO&cidade=SAO+PAULO")

    time.sleep(5)  # deixa a página carregar scripts JS

    wait = WebDriverWait(driver, 30)  
    wait.until(lambda d: d.execute_script("return document.querySelector('app-leiloes-list') !== null"))

    app_root = driver.find_element(By.CSS_SELECTOR, "app-leiloes-list")
    shadow_root = driver.execute_script("return arguments[0].shadowRoot", app_root)

    # Aguardar até os cards estarem carregados
    container = shadow_root.find_element(By.CSS_SELECTOR, ".itau-leiloes-pagination-cards")
    cards = container.find_elements(By.CSS_SELECTOR, ".itau-leiloes-card")

    dados = []
    for card in cards:
        try:
            imagem_element = card.find_element(By.CSS_SELECTOR, "img.itau-leiloes-carrousel-image")
            imagem = imagem_element.get_attribute("src")
        except NoSuchElementException:
            imagem = "N/A"

        try:
            endereco_element = card.find_element(By.CSS_SELECTOR, ".itau-leiloes-card-info")
            endereco = endereco_element.text
        except NoSuchElementException:
            endereco = "N/A"

        dados.append({"imagem": imagem.strip(), "endereco": endereco.strip()})

    print(f"🔎 {len(dados)} imóveis encontrados.")

    def salvar_em_mongodb(imoveis, nome_collection):
        if not imoveis:
            print("⚠️ Nenhum dado para salvar no MongoDB.")
            return
        try:
            collection = db[nome_collection]

            # Cria índice único no campo 'imagem'
            collection.create_index("imagem", unique=True)

            novos = 0
            atualizados = 0

            for imovel in imoveis:
                if not imovel.get("imagem"):
                    continue  # Ignora se não houver imagem

                result = collection.update_one(
                    {"imagem": imovel["imagem"]},  # chave única
                    {"$set": imovel},
                    upsert=True
                )

                if result.upserted_id:
                    novos += 1
                elif result.modified_count > 0:
                    atualizados += 1

            print(f"✅ {novos} novos imóveis inseridos na collection '{nome_collection}'.")
            print(f"🔄 {atualizados} imóveis atualizados.")

        except Exception as e:
            print("❌ Erro ao salvar no MongoDB:", e)
            
    salvar_em_mongodb(dados, "imoveis_itau")


finally:
    driver.quit()
