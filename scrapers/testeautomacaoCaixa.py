from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from pymongo import MongoClient, errors
import time
import tempfile
import re
import hashlib
from collections import defaultdict



# Conectar ao MongoDB com verificação
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

def extrair_imoveis_da_pagina(driver):
    imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
    print(f"🔍 {len(imoveis_divs)} imóveis encontrados na página.")

    imoveis = []
    for div in imoveis_divs:
        dados = {
            "estado": "SP",
            "cidade": "SAO PAULO",
            "banco": "CAIXA"
        }

        try:
            # Número do imóvel (extraído do onclick do <img>)
            img_tag = div.find_element(By.CLASS_NAME, "fotoimovel-col1").find_element(By.TAG_NAME, "img")
            onclick = img_tag.get_attribute("onclick")
            numero_match = re.search(r"detalhe_imovel\((\d+)\)", onclick)
            if numero_match:
                numero_imovel = numero_match.group(1)
                dados["numero_imovel"] = numero_imovel
                dados["imagem"] = f"https://venda-imoveis.caixa.gov.br/fotos/F{numero_imovel}21.jpg"
                dados["link"] = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={numero_imovel}"

            # Bloco com os dados textuais
            dados_div = div.find_element(By.CLASS_NAME, "dadosimovel-col2")

            # Endereço e valor no <a>
            a_tag = dados_div.find_element(By.TAG_NAME, "a")
            texto_a = a_tag.text.strip()

            partes = texto_a.split("|")
            if len(partes) == 2:
                _, valor = partes
                dados["valor"] = valor.strip()
            else:
                dados["valor"] = None

            # Todos os <font> com dados textuais adicionais
            fontes = dados_div.find_elements(By.TAG_NAME, "font")
            for fonte in fontes:
                linhas = fonte.text.strip().splitlines()
                
                for linha in linhas:
                    linha = linha.strip()

                    if "Valor de avaliação" in linha:
                        dados["valor_avaliacao"] = linha.split(":", 1)[-1].strip()
                    elif "Valor mínimo de venda" in linha:
                        dados["valor_minimo"] = linha.split(":", 1)[-1].strip()
                    elif "Despesas do imóvel" in linha:
                        if "detalhes" not in dados:
                            dados["detalhes"] = {}
                        dados["detalhes"]["despesas"] = linha.split(":", 1)[-1].strip()
                    elif "Número do imóvel" in linha:
                        dados["numero_imovel"] = linha.split(":")[-1].strip().replace("-", "")
                        dados["imagem"] = f"https://venda-imoveis.caixa.gov.br/fotos/F{dados['numero_imovel']}21.jpg"
                        dados["link"] = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={dados['numero_imovel']}"
                    elif linha.upper().startswith("RUA") or linha.upper().startswith("AVENIDA"):
                        dados["endereco"] = linha.strip().title()
                    elif "Leilão" in linha and "-" in linha:
                        dados["tipo_imovel"] = linha.split("-")[0].strip()

        except Exception as e:
            print("⚠️ Erro ao processar imóvel:", e)

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

def gerar_id_unico(imovel):
    base = f"{imovel.get('numero_imovel', '')}_{imovel.get('endereco_completo_raw', '')}_{imovel.get('valor', '')}_{imovel.get('bairro', '')}_{imovel.get('link', '')}"
    return hashlib.md5(base.encode()).hexdigest()



def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("⚠️ Nenhum dado para salvar no MongoDB.")
        return
    try:
        collection = db[nome_collection]

        result = collection.insert_many(imoveis)

    except Exception as e:
        print("❌ Erro ao salvar no MongoDB:", e)

        if "_id" in imovel:
         print(f"ID gerado: {imovel['_id']}, Título: {imovel.get('titulo', '')}")


    ids = [gerar_id_unico(imovel) for imovel in imoveis]
    print(f"🎯 Total de imóveis: {len(imoveis)}")
    print(f"🔍 IDs únicos: {len(set(ids))}")
    duplicados = len(imoveis) - len(set(ids))
    if duplicados > 0:
        print(f"⚠️ Atenção: {duplicados} imóveis com _id duplicado detectados.")


if __name__ == "__main__":
    dados = extrair_imoveis_selenium()
    salvar_em_mongodb(dados, "imoveis_caixa")

