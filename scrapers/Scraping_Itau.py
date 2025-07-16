from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (NoSuchElementException, StaleElementReferenceException)
from selenium.webdriver.support.ui import WebDriverWait
import time
import tempfile
from pymongo import MongoClient, errors
import os

try:
    mongo_uri = os.environ.get("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client["pi_motor"]  
    client.server_info()
    print("✅ Conectado ao MongoDB com sucesso.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

options = Options()
options.headless = False
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1366,768')
options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

driver = webdriver.Chrome(options=options)

try:
    driver.get("https://www.itau.com.br/imoveis-itau?estado=S%C3%83O+PAULO&cidade=S%C3%83O+PAULO")
    time.sleep(5)

    wait = WebDriverWait(driver, 30)
    wait.until(lambda d: d.execute_script("return document.querySelector('app-leiloes-list') !== null"))

    app_root = driver.find_element(By.CSS_SELECTOR, "app-leiloes-list")
    shadow_root = driver.execute_script("return arguments[0].shadowRoot", app_root)

    while True:
        try:
            carregar_mais_button = shadow_root.find_element(By.CSS_SELECTOR, ".itau-leiloes-pagination-button button")
            driver.execute_script("arguments[0].click();", carregar_mais_button)
            time.sleep(2)
        except NoSuchElementException:
            print("🏁 Todos os imóveis foram carregados.")
            break
        except StaleElementReferenceException:
            print("⚠️ Botão obsoleto. Recarregando referência...")
            time.sleep(2)
            shadow_root = driver.execute_script("return arguments[0].shadowRoot", app_root)
        except Exception as e:
            print(f"❌ Erro ao clicar em 'Carregar mais': {e}")
            break

    container = shadow_root.find_element(By.CSS_SELECTOR, ".itau-leiloes-pagination-cards")
    cards = container.find_elements(By.CSS_SELECTOR, ".itau-leiloes-card")
    print(f"🔎 {len(cards)} imóveis encontrados.")

    dados = []
    for card in cards:
        encerramento = "N/A"
        numero_imovel = "N/A"
        datas_leiloes = None

        try:
            imagem = card.find_element(By.CSS_SELECTOR, "img.itau-leiloes-carrousel-image").get_attribute("src")
        except NoSuchElementException:
            imagem = "N/A"

        try:
            tags = card.find_elements(By.CSS_SELECTOR, "span.itau-leiloes-tag-label.--xsmall")
            for tag in tags:
                text = tag.text.lower()
                if "encerra em" in text:
                    encerramento = text.replace("encerra em", "").strip()
                    try:
                        datas_leiloes = datetime.strptime(encerramento, "%d/%m/%Y")
                    except ValueError:
                        datas_leiloes = None
                elif "código do imovel:" in text:
                    numero_imovel = text.replace("código do imovel:", "").strip()
        except Exception:
            pass

        link_imovel = f"https://www.itau.com.br/imoveis-itau/detalhes?id={numero_imovel}"

        try:
            endereco = card.find_element(By.CSS_SELECTOR, ".itau-leiloes-card-info-street_address").text
            valor_texto = card.find_element(By.CSS_SELECTOR, ".itau-leiloes-card-info-current_price").text
            valor_limpo = valor_texto.replace("R$", "").replace(".", "").replace(",", ".").strip()
            valor_inicial = float(valor_limpo)
        except NoSuchElementException:
            endereco = "N/A"
            valor_inicial = 0.0

        dados.append({
            "cidade": "SAO PAULO",
            "uf": "SP",
            "link": link_imovel,
            "banco": "Itau",
            "imagem": imagem.strip(),
            "endereco": endereco.strip(),
            "valor_inicial": valor_inicial,
            "numero_imovel": numero_imovel,
            "datas_leiloes": datas_leiloes,
            "favorito": False
        })
    
    for imovel in dados:
        for key, value in imovel.items():
            if key == "imagem":
                continue
            if key in ["valor_inicial", "valor_avaliacao", "valor_minimo_1_leilao", "valor_minimo_2_leilao"]:
                if value is None:
                    continue
            if value is None or value == "N/A" or (isinstance(value, str) and value.strip() == ""):
                imovel[key] = "Não informado"

    def salvar_em_mongodb(imoveis, nome_collection):
        imoveis = [d for d in imoveis if d.get("numero_imovel") not in (None, "", "N/A")]
        if not imoveis:
            print("⚠️ Nenhum dado válido para salvar no MongoDB.")
            return
        try:
            collection = db[nome_collection]
            try:
                collection.drop_index("numero_imovel_1")
            except errors.OperationFailure:
                pass

            collection.create_index("numero_imovel", unique=True, sparse=True)

            novos = 0
            atualizados = 0

            for imovel in imoveis:
                if "imagem" not in imovel or not imovel["imagem"]:
                    imovel["imagem"] = f"sem_imagem_{imovel['numero_imovel']}"

                result = collection.update_one(
                    {"numero_imovel": imovel["numero_imovel"]},
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

    salvar_em_mongodb(dados, "imoveis")

finally:
    driver.quit()