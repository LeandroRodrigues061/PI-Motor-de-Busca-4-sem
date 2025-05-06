from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from pymongo import MongoClient, errors
import time
import tempfile

# Conectar ao MongoDB com verificação
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

# Extração dos imóveis de uma única página
def extrair_imoveis_da_pagina(driver):
    soup = BeautifulSoup(driver.page_source, "html.parser")
    lista_div = soup.find("div", id="listaimoveispaginacao")
    if not lista_div:
        return []
    imoveis_divs = lista_div.find_all("div", class_="dadosimovel-col2")

    imoveis = []
    for div in imoveis_divs:
        dados = {}
        endereco = div.find("a")
        if endereco:
            dados["endereco"] = endereco.get_text(strip=True)

        infos = div.find_all("font")
        for font in infos:
            texto = font.get_text(strip=True)
            if "Valor de avaliação" in texto:
                dados["valor_avaliacao"] = texto
            elif "Valor mínimo de venda" in texto:
                dados["valor_minimo"] = texto
            elif "Numero do imóvel" in texto:
                dados["numero_imovel"] = texto
            elif "Despesas do imóvel" in texto:
                dados["despesas"] = texto

        imoveis.append(dados)
    return imoveis

# Função principal do Selenium
def extrair_imoveis_selenium():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')

    try:
        # Seleciona Estado e Cidade
        Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text("SP")
        time.sleep(2)
        Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text("SAO PAULO")
        time.sleep(3)

        # Avançar etapas
        wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
        time.sleep(1)
        wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
        time.sleep(4)

        wait.until(EC.presence_of_element_located((By.ID, "listaimoveispaginacao")))

        todos_os_imoveis = []
        pagina_atual = 1

        while True:
            imoveis = extrair_imoveis_da_pagina(driver)
            todos_os_imoveis.extend(imoveis)
            print(f"📄 Página {pagina_atual}: {len(imoveis)} imóveis. Total acumulado: {len(todos_os_imoveis)}")

            try:
                paginacao = driver.find_element(By.ID, "paginacao")
                links = paginacao.find_elements(By.TAG_NAME, "a")

                proximo_link = None
                for link in links:
                    href = link.get_attribute("href")
                    if href and "carregaListaImoveis" in href:
                        numero_pagina = int(href.split("carregaListaImoveis(")[1].split(")")[0])
                        if numero_pagina > pagina_atual:
                            proximo_link = link
                            pagina_atual = numero_pagina
                            break

                if proximo_link:
                    driver.execute_script("arguments[0].click();", proximo_link)
                    time.sleep(6)
                    wait.until(EC.presence_of_element_located((By.ID, "listaimoveispaginacao")))
                else:
                    print("✅ Fim da paginação.")
                    break

            except Exception as e:
                print("⚠️ Erro ou última página:", e)
                break

    finally:
        driver.quit()

    return todos_os_imoveis

# Salvar dados no MongoDB
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

# Execução principal
if __name__ == "__main__":
    dados = extrair_imoveis_selenium()

    for i, imovel in enumerate(dados, 1):
        print(f"🏠 Imóvel #{i}")
        for k, v in imovel.items():
            print(f"{k.capitalize()}: {v}")
        print("-" * 40)

    salvar_em_mongodb(dados, "imoveis_caixa")
