from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import JavascriptException
from time import sleep
import tempfile
from pymongo import MongoClient, errors

# Conectar ao MongoDB
try:
    client = MongoClient("mongodb://root:example@localhost:27018/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB com sucesso (local).")

    # Adicione estas linhas para limpar a collection ANTES de inserir
    collection = db["imoveis_itau"]
    collection.delete_many({})
    print("⚠️ Collection 'imoveis_itau' limpa.")

except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB (local):", err)
    exit(1)

# Configurar Chrome
options = Options()
# options.add_argument('--headless') # Remover para ver o navegador
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")

# Iniciar o navegador (certifique-se de que o chromedriver está no PATH ou especifique o caminho)
driver = webdriver.Chrome(options=options)

try:
    # Acessar o site
    driver.get("https://www.itau.com.br/imoveis-itau?estado=S%C3%83O+PAULO&cidade=S%C3%83O+PAULO")
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

        print(f"🔎 {len(dados)} imóveis encontrados (local).")

    def salvar_em_mongodb(imoveis, nome_collection):
        if not imoveis:
            print("⚠️ Nenhum dado para salvar no MongoDB (local).")
            return
        try:
            collection = db[nome_collection]
            inserted_count = 0
            for imovel in imoveis:
                # Verificar se um imóvel com o mesmo endereço já existe
                if collection.find_one({"endereco": imovel["endereco"]}) is None:
                    result = collection.insert_one(imovel)
                    if result.inserted_id:
                        inserted_count += 1
                else:
                    print(f"⚠️ Imóvel com endereço '{imovel['endereco']}' já existe. Ignorando.")
            print(f"✅ {inserted_count} novos documentos inseridos na collection '{nome_collection}' (local).")
        except Exception as e:
            print("❌ Erro ao salvar no MongoDB (local):", e)

    salvar_em_mongodb(dados, "imoveis_itau")

finally:
    driver.quit()