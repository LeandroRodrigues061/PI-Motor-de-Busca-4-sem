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

# Conectar ao MongoDB
try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

def extrair_detalhes_imovel(driver, numero_imovel):
    import re
    import time
    from bs4 import BeautifulSoup

    time.sleep(2)  # Aguarda o carregamento da página
    soup = BeautifulSoup(driver.page_source, "html.parser")
    detalhes = {}

    # Título do imóvel (ex: "VILA AUSTRIA")
    titulo = None
    h5 = soup.find("h5")
    if h5:
        titulo = h5.text.strip()
    detalhes["titulo"] = titulo

    # Endereço completo
    endereco = None
    endereco_match = re.search(r"Endere[cç]o:\s*(.+)", soup.text)
    if endereco_match:
        endereco = endereco_match.group(1).strip()
    detalhes["endereco"] = endereco

    # Bairro (tenta extrair do endereço)
    bairro = None
    if endereco:
        # Procura padrão " - BAIRRO - CEP:" ou " - BAIRRO - CEP"
        bairro_match = re.search(r",\s*([^,]+)\s*-\s*CEP", endereco)
        if bairro_match:
            bairro = bairro_match.group(1).strip()
    detalhes["bairro"] = bairro

    detalhes["cidade"] = "São Paulo"
    detalhes["uf"] = "SP"

    # Valor de avaliação
    valor_avaliacao = None
    match = re.search(r"Valor de avaliação:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_avaliacao = match.group(0).split(":", 1)[-1].strip()
    detalhes["valor_avaliacao"] = valor_avaliacao

    # Valor mínimo de venda 1º Leilão
    valor_minimo_1 = None
    match = re.search(r"Valor mínimo de venda 1º Leilão:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_minimo_1 = match.group(0).split(":", 1)[-1].strip()
    detalhes["valor_minimo_1_leilao"] = valor_minimo_1

    # Valor mínimo de venda 2º Leilão
    valor_minimo_2 = None
    match = re.search(r"Valor mínimo de venda 2º Leilão:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_minimo_2 = match.group(0).split(":", 1)[-1].strip()
    detalhes["valor_minimo_2_leilao"] = valor_minimo_2

    # Datas dos leilões
    datas = []
    for span in soup.find_all("span"):
        if "Data do 1º Leilão" in span.text or "Data do 2º Leilão" in span.text:
            datas.append(span.text.strip())
    detalhes["datas_leiloes"] = datas

    # Formas de pagamento
    formas_pagamento = []
    pagamento_section = None
    for p in soup.find_all("p"):
        if "FORMAS DE PAGAMENTO ACEITAS" in p.text:
            pagamento_section = p
            break
    if pagamento_section:
        for item in pagamento_section.find_all("i", class_="fa fa-info-circle"):
            texto = item.next_sibling
            if texto:
                formas_pagamento.append(texto.strip())
    detalhes["formas_pagamento"] = formas_pagamento
    
    tipo_imovel = None
    for tipo in soup.find_all("p"):
        if "Tipo de Imóvel:" in tipo.text:
            tipo_imovel = tipo.text.split(":", 1)[-1].strip()
            break
    detalhes["tipo_imovel"] = tipo_imovel
    
    detalhes["link"] = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={numero_imovel}"
    
    detalhes["imagem"] = f"https://venda-imoveis.caixa.gov.br/fotos/F{numero_imovel}21.jpg"
    
    detalhes["banco"] = "CAIXA"
    
    detalhes["favorito"] = False

    return detalhes

# def coletar_lista_imoveis(driver):
#     wait = WebDriverWait(driver, 20)
#     lista = []
#     pagina_atual = 1
#     while True:
#         imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
#         for idx, div in enumerate(imoveis_divs):
#             try:
#                 img_tag = div.find_element(By.CLASS_NAME, "fotoimovel-col1").find_element(By.TAG_NAME, "img")
#                 onclick = img_tag.get_attribute("onclick")
#                 numero_match = re.search(r"detalhe_imovel\((\d+)\)", onclick)
#                 if numero_match:
#                     numero_imovel = numero_match.group(1)
#                     lista.append({
#                         "numero_imovel": numero_imovel,
#                         "pagina": pagina_atual,
#                         "indice": idx
#                     })
#             except Exception as e:
#                 print("Erro ao coletar imóvel:", e)
#         # Paginação
#         try:
#             paginacao = driver.find_element(By.ID, "paginacao")
#             links = paginacao.find_elements(By.TAG_NAME, "a")
#             proximo_link = None
#             for link in links:
#                 if "carregaListaImoveis" in link.get_attribute("href"):
#                     numero_pagina = int(link.get_attribute("href").split("carregaListaImoveis(")[1].split(")")[0])
#                     if numero_pagina > pagina_atual:
#                         proximo_link = link
#                         pagina_atual = numero_pagina
#                         break
#             if proximo_link:
#                 driver.execute_script("arguments[0].click();", proximo_link)
#                 time.sleep(3)
#                 wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
#             else:
#                 break
#         except Exception as e:
#             print("Fim da paginação ou erro:", e)
#             break
#     return lista

def coletar_lista_imoveis(driver):
    wait = WebDriverWait(driver, 20)
    lista = []
    imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
    for idx, div in enumerate(imoveis_divs):
        try:
            img_tag = div.find_element(By.CLASS_NAME, "fotoimovel-col1").find_element(By.TAG_NAME, "img")
            onclick = img_tag.get_attribute("onclick")
            numero_match = re.search(r"detalhe_imovel\((\d+)\)", onclick)
            if numero_match:
                numero_imovel = numero_match.group(1)
                lista.append({
                    "numero_imovel": numero_imovel,
                    "pagina": 1,
                    "indice": idx
                })
        except Exception as e:
            print("Erro ao coletar imóvel:", e)
    return lista

def navegar_ate_imovel(driver, estado, cidade, pagina, indice):
    wait = WebDriverWait(driver, 20)
    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')
    # Seleciona Estado e Cidade
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text(estado)
    time.sleep(1)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text(cidade)
    time.sleep(1)
    # Avançar etapas
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
    time.sleep(1)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
    # Avançar até a página correta
    for _ in range(1, pagina):
        paginacao = driver.find_element(By.ID, "paginacao")
        links = paginacao.find_elements(By.TAG_NAME, "a")
        proximo_link = None
        for link in links:
            if "carregaListaImoveis" in link.get_attribute("href"):
                proximo_link = link
                break
        if proximo_link:
            driver.execute_script("arguments[0].click();", proximo_link)
            time.sleep(3)
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
    # Retorna o div do imóvel desejado
    imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
    return imoveis_divs[indice]

def processar_todos_imoveis_por_link(driver, lista_imoveis):
    imoveis = []
    wait = WebDriverWait(driver, 20)
    for item in lista_imoveis:
        try:
            url = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={item['numero_imovel']}"
            driver.get(url)
            wait.until(EC.presence_of_element_located((By.ID, "dadosImovel")))        
            detalhes = extrair_detalhes_imovel(driver, item['numero_imovel'])
            detalhes["numero_imovel"] = item["numero_imovel"]    
            imoveis.append(detalhes)
        except Exception as e:
            print(f"Erro ao processar imóvel {item['numero_imovel']}: {e}")
    return imoveis

def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("⚠️ Nenhum dado para salvar no MongoDB.")
        return
    try:
        collection = db[nome_collection]
        result = collection.insert_many(imoveis)
        print(f"✅ {len(imoveis)} imóveis salvos no MongoDB.")
    except Exception as e:
        print("❌ Erro ao salvar no MongoDB:", e)

if __name__ == "__main__":
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')
    # Faça a primeira busca normalmente
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text("SP")
    time.sleep(1)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text("SAO PAULO")
    time.sleep(1)
    wait.until(EC.visibility_of_element_located((By.ID, "btn_next0")))
    botao = driver.find_element(By.ID, "btn_next0")
    driver.execute_script("arguments[0].scrollIntoView(true);", botao)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", botao)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
    # Coleta a lista de imóveis
    lista_imoveis = coletar_lista_imoveis(driver)
    print(f"Total de imóveis encontrados: {len(lista_imoveis)}")
    # Processa cada imóvel reaplicando os filtros
    imoveis = processar_todos_imoveis_por_link(driver, lista_imoveis)
    salvar_em_mongodb(imoveis, "imoveis_caixa")
    driver.quit()