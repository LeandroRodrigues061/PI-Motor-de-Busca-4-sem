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
    soup = BeautifulSoup(driver.page_source, "html.parser")
    lista_div = soup.find("div", id="listaimoveispaginacao")
    if not lista_div:
        return []
    imoveis_divs = lista_div.find_all("div", class_="dadosimovel-col2")

    imoveis = []
    for div in imoveis_divs:
        dados = {
            "estado": "SP",  # fixo do filtro
            "cidade": "SAO PAULO",
            "banco": "CAIXA"
        }

        endereco_a = div.find("a")
        if endereco_a:
            texto_endereco = endereco_a.get_text(strip=True)
            dados["endereco_completo_raw"] = texto_endereco

            # Ex: "SAO PAULO - RESIDENCIAL DI PETRA | R$ 189.533,30"
            partes = texto_endereco.split("|")
            if len(partes) == 2:
                localizacao, valor = partes
                dados["valor"] = valor.strip()
                dados["bairro"] = localizacao.strip().split("-")[-1].strip()
            else:
                dados["valor"] = None

            dados["link"] = "https://venda-imoveis.caixa.gov.br" + endereco_a["href"]

        infos = div.find_all("font")
        for font in infos:
            texto = font.get_text(strip=True)

            if "Valor de avaliação" in texto:
                dados["valor_avaliacao"] = texto.split(":", 1)[-1].strip()

            elif "Valor mínimo de venda" in texto:
                dados["valor_minimo"] = texto.split(":", 1)[-1].strip()

            elif "Numero do imóvel" in texto:
                match = re.search(r"Número do imóvel: ([\d\-\w]+)", texto)
                if match:
                    dados["numero_imovel"] = match.group(1).strip()

            elif "Despesas do imóvel" in texto or "Número do item" in texto:
                # Tenta extrair endereço e tipo do imóvel
                linhas = texto.split("Número do item")
                if len(linhas) > 1:
                    final = linhas[1]
                    partes_finais = final.split("\n")
                    for linha in partes_finais:
                        if "," in linha and "RUA" in linha:
                            dados["endereco"] = linha.strip()
                            if "-" in linha:
                                dados["bairro"] = linha.split("-")[-1].strip()

                # Tipo de imóvel (primeira parte antes de "- Leilão")
                tipo_match = re.search(r"^([\w\s]+?)\s*-\s*.*Leilão", texto)
                if tipo_match:
                    dados["tipo_imovel"] = tipo_match.group(1).strip()

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

        novos = 0
        atualizados = 0

        for imovel in imoveis:
            # Gera o _id único baseado em hash dos dados relevantes
            imovel['_id'] = gerar_id_unico(imovel)

            result = collection.update_one(
                {"_id": imovel["_id"]},   # chave única real
                {"$set": imovel},         # insere ou atualiza
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
    print(f"🔍 Total de imóveis extraídos: {len(dados)}")
    salvar_em_mongodb(dados, "imoveis_caixa")

