from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from time import sleep
import tempfile
from pymongo import MongoClient, errors

# Conectar ao MongoDB com validação
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()  # Força a verificação de conexão
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

# Configuração do Chrome para ambiente headless (Docker)
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f'--user-data-dir={tempfile.mkdtemp()}')

driver = webdriver.Chrome(options=options)
driver.get("https://vitrinebradesco.com.br/auctions?type=realstate")

wait = WebDriverWait(driver, 20)

# Selecionar estado SP
wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "select__control")))
dropdowns = driver.find_elements(By.CLASS_NAME, "select__control")
dropdowns[0].click()
wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'SP')]"))).click()

# Selecionar cidade São Paulo - SP
dropdowns = driver.find_elements(By.CLASS_NAME, "select__control")  
dropdowns[1].click()
wait.until(EC.element_to_be_clickable((By.XPATH, "(//div[contains(text(), 'São Paulo - SP')])[2]"))).click()

sleep(2)

def extrair_dados():
    cards = driver.find_elements(By.CLASS_NAME, "auction-container")
    dados = []

    for card in cards:
        try:
            ActionChains(driver).move_to_element(card).perform()
            sleep(0.5)
            imagem_element = card.find_element(By.CLASS_NAME, "thumbnail-container").find_element(By.TAG_NAME, "img")
            imagem = imagem_element.get_attribute("src") or "N/A"
        except:
            imagem = "N/A"

        try:
            descricao = card.find_element(By.CLASS_NAME, "description").text.strip()
        except:
            descricao = "N/A"

        try:
            valor = card.find_element(By.CLASS_NAME, "bottom").text.split("\n")[0].strip()
        except:
            valor = "N/A"

        dados.append({
            "imagem": imagem,
            "descricao": descricao,
            "valor": valor
        })

    print(f"🔎 {len(dados)} imóveis extraídos.")
    return dados

def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("⚠️ Nenhum dado para salvar no MongoDB.")
        return
    try:
        collection = db[nome_collection]
        result = collection.insert_many(imoveis)
        print(f"{len(result.inserted_ids)} documentos inseridos na collection '{nome_collection}'.")
    except Exception as e:
        print("Erro ao salvar no MongoDB:", e)

# Executar scraping e salvar no MongoDB
dados = extrair_dados()
salvar_em_mongodb(dados, "imoveis_bradesco")

driver.quit()
