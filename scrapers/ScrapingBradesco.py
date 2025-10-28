from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from time import sleep
import tempfile
from pymongo import MongoClient, errors
import re
import os

try:
    mongo_uri = os.environ.get("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client["MotorDeBusca"]  
    client.server_info()
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f'--user-data-dir={tempfile.mkdtemp()}')

driver = webdriver.Chrome(options=options)
driver.get("https://vitrinebradesco.com.br/auctions?city=9668&type=realstate&ufs=SP")

wait = WebDriverWait(driver, 20)
sleep(2)

def extrair_endereco_flex(descricao):
    if not isinstance(descricao, str) or descricao == "N/A":
        return "N/A"

    try:
        partes = descricao.split("|")
        if len(partes) > 1:
            endereco = partes[1].strip()
            if "Área" in endereco:
                endereco = endereco.split("Área")[0].strip()
            stopwords = ["Com direito", "c/ direito", "Apartamento", "Casa", "Prédio", "Sala", "Lote", "Galpão", "Terreno"]
            for sw in stopwords:
                if sw.lower() in endereco.lower():
                    endereco = re.split(sw, endereco, flags=re.IGNORECASE)[0].strip()
            endereco = re.sub(r'[-–—,;\\(.]*$', '', endereco).strip()
            if len(endereco) > 8:
                return endereco
    except Exception:
        pass

    padrao = r'(Rua|Avenida|Av\.|Travessa|Alameda|Praça|Rodovia|Estrada)[^\d\n|,]*\s?\d{1,5}'
    match = re.search(padrao, descricao, re.IGNORECASE)
    if match:
        endereco = match.group(0).strip()
        endereco = re.sub(r'[-–—,;\\(.]*$', '', endereco).strip()
        return endereco

    try:
        if "|" in descricao:
            trecho = descricao.split("|")[1]
            if "." in trecho:
                endereco = trecho.split(".")[0].strip()
                endereco = re.sub(r'[-–—,;\\(.]*$', '', endereco).strip()
                if len(endereco) > 8:
                    return endereco
    except Exception:
        pass
    return "N/A"

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
            data_do_leilao_str = descricao.split("|")[0].strip().split(":")[1].strip()
            data_leilao = datetime.strptime(data_do_leilao_str, "%d/%m/%Y")
            endereco_leilao = extrair_endereco_flex(descricao)            
            parceiro_scrap = card.find_element(By.CLASS_NAME, "bottom > p").text
            parceiro = parceiro_scrap.split(":")[1].strip()
            favorito = False
        except:
            data_leilao = "N/A"
            endereco_leilao = "N/A"
            parceiro = "N/A"
            favorito = False

        try:
            valor_element = card.find_element(By.CSS_SELECTOR, ".price > p")
            valor_texto = valor_element.text
            valor_limpo = valor_texto.replace("R$", "").replace(".", "").replace(",", ".").strip()
            valor_inicial = float(valor_limpo)
        except Exception as e:
            print("❌ Erro ao processar valor inicial:", e)
            valor_inicial = "N/A"

        try:
            link = card.get_attribute("href")
            if not link or link == "#":
                print("⚠️ Link vazio ou inválido encontrado.")
                continue
            if not link.startswith("http"):
                link = "https://vitrinebradesco.com.br" + link
        except Exception as e:
            print(f"❌ Erro ao extrair link para o card: {e}")
            continue

        dados.append({
            "imagem": imagem,
            "datas_leiloes": data_leilao,
            "endereco": endereco_leilao,
            "valor_inicial": valor_inicial,
            "site": "Bradesco",
            "link": link,
            "uf": "SP",
            "cidade": "SAO PAULO",
            "parceiro": parceiro,
            "favorito": favorito
        })
        
    for imovel in dados:
        for key, value in imovel.items():
            if key == "imagem":
                continue
            if key in ["valor_inicial", "valor_avaliacao", "valor_minimo_1_leilao", "valor_minimo_2_leilao"]:
                if value is None:
                    continue
            if value is None or value == "N/A":
                imovel[key] = "Não informado"

    print(f"🔎 {len(dados)} imóveis extraídos.")
    return dados

def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("⚠️ Nenhum dado para salvar no MongoDB.")
        return
    try:
        collection = db[nome_collection]

        try:
            collection.drop_index("descricao_1")
        except errors.OperationFailure:
            pass

        collection.create_index("link", unique=True)

        novos = 0
        atualizados = 0

        for imovel in imoveis:
            if not imovel.get("link"):
                continue

            result = collection.update_one(
                {"link": imovel["link"]},
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

if __name__ == "__main__":
    imoveis = extrair_dados()
    salvar_em_mongodb(imoveis, "imoveis")
    driver.quit()
