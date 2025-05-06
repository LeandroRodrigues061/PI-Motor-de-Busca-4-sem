from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import JavascriptException
from time import sleep
import tempfile
from pymongo import MongoClient, errors

# Conectar ao MongoDB
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()  # Força uma conexão para verificar se está tudo certo
    print("✅ Conectado ao MongoDB com sucesso.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

# Configurar Chrome no modo headless para uso em Docker
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")

# Iniciar o navegador
driver = webdriver.Chrome(options=options)

try:
    # Acessar o site
    driver.get("https://www.itau.com.br/imoveis-itau?estado=S%C3%83O+PAULO&cidade=SAO+PAULO")
    sleep(5)  # Idealmente use WebDriverWait com ExpectedConditions

    # Extrair os cards dentro do Shadow DOM
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
            imagem = driver.execute_script(
                "return arguments[0].querySelector('img.itau-leiloes-carrousel-image')?.src;", card
            ) or "N/A"
        except JavascriptException:
            imagem = "N/A"

        try:
            endereco = driver.execute_script(
                "return arguments[0].querySelector('.itau-leiloes-card-info')?.textContent;", card
            ) or "N/A"
        except JavascriptException:
            endereco = "N/A"

        dados.append({"imagem": imagem.strip(), "endereco": endereco.strip()})

    print(f"🔎 {len(dados)} imóveis encontrados.")

    def salvar_em_mongodb(imoveis, nome_collection):
        if not imoveis:
            print("⚠️ Nenhum dado para salvar no MongoDB.")
            return
        try:
            collection = db[nome_collection]
            result = collection.insert_many(imoveis)
            print(f"✅ {len(result.inserted_ids)} documentos inseridos na collection '{nome_collection}'.")
        except Exception as e:
            print("❌ Erro ao salvar no MongoDB:", e)

    salvar_em_mongodb(dados, "imoveis_itau")

finally:
    driver.quit()
