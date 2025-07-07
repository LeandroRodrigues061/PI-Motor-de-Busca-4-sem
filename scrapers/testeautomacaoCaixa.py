from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from pymongo import MongoClient, errors
import time, unicodedata, re, zipfile, os
from datetime import datetime

BRIGHT_USERNAME = 'brd-customer-hl_3da95667-zone-datacenter_proxy1'
BRIGHT_PASSWORD = '9tkyy9wey6i6'
BRIGHT_PROXY = 'brd.superproxy.io'
BRIGHT_PORT = '33335'

def create_proxy_auth_extension(proxy_host, proxy_port, proxy_username, proxy_password, scheme='http', plugin_path='proxy_auth_plugin.zip'):
    manifest_json = """
    {
        "version": "1.0.0",
        "manifest_version": 2,
        "name": "Chrome Proxy",
        "permissions": [
            "proxy",
            "tabs",
            "unlimitedStorage",
            "storage",
            "<all_urls>",
            "webRequest",
            "webRequestBlocking"
        ],
        "background": {
            "scripts": ["background.js"]
        }
    }
    """

    background_js = f"""
    var config = {{
        mode: "fixed_servers",
        rules: {{
            singleProxy: {{
                scheme: "{scheme}",
                host: "{proxy_host}",
                port: parseInt({proxy_port})
            }},
            bypassList: ["localhost"]
        }}
    }};
    chrome.proxy.settings.set({{value: config, scope: "regular"}}, function() {{}});

    chrome.webRequest.onAuthRequired.addListener(
        function(details) {{
            return {{
                authCredentials: {{
                    username: "{proxy_username}",
                    password: "{proxy_password}"
                }}
            }};
        }},
        {{urls: ["<all_urls>"]}},
        ['blocking']
    );
    """

    with zipfile.ZipFile(plugin_path, 'w') as zp:
        zp.writestr("manifest.json", manifest_json)
        zp.writestr("background.js", background_js)

    return plugin_path

# Cria a extensão com autenticação
plugin_path = create_proxy_auth_extension(BRIGHT_PROXY, BRIGHT_PORT, BRIGHT_USERNAME, BRIGHT_PASSWORD)

try:
    client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client["MotorDeBusca"]
    client.server_info()
    print("✅ Conectado ao MongoDB.")
except errors.ServerSelectionTimeoutError as err:
    print("❌ Erro ao conectar ao MongoDB:", err)
    exit(1)

def padronizar_bairro(bairro):
    if not bairro:
        return None
    bairro = bairro.strip()
    bairro = bairro.upper()
    bairro = ''.join(
        c for c in unicodedata.normalize('NFD', bairro)
        if unicodedata.category(c) != 'Mn'
    )
    bairro = re.sub(r'\s+', ' ', bairro)
    bairro = bairro.replace('JD ', 'JARDIM ')
    bairro = bairro.replace('JD. ', 'JARDIM ')
    bairro = bairro.replace('VL ', 'VILA ')
    bairro = bairro.replace('VL. ', 'VILA ')
    bairro = bairro.replace('PQ ', 'PARQUE ')
    bairro = bairro.replace('PQ. ', 'PARQUE ')
    bairro = bairro.replace('DIST ', 'DISTRITO ')
    bairro = bairro.replace('S ', 'SÃO ')
    bairro = bairro.replace('PAULIS', 'PAULISTA ')
    bairro
    bairro = bairro.rstrip('.,-')
    return bairro

def extrair_detalhes_imovel(driver, numero_imovel):
    import re
    import time
    from bs4 import BeautifulSoup

    time.sleep(2)  
    soup = BeautifulSoup(driver.page_source, "html.parser")
    detalhes = {}

    titulo = None
    h5 = soup.find("h5")
    if h5:
        titulo = h5.text.strip()
    detalhes["titulo"] = titulo

    for p in soup.find_all('p'):
        strong = p.find('strong')
        if strong and "Endereço" in strong.text:
            endereco = p.get_text(separator="\n", strip = True).split("\n", 1)[-1]
            detalhes["endereco"] = endereco
            break

    bairro = None
    if endereco:
        bairro_match = re.search(r",\s*([^,]+)\s*-\s*CEP", endereco)
        if bairro_match:
            bairro = bairro_match.group(1).strip()
    detalhes["bairro"] = bairro
    bairro_original = detalhes.get('bairro')
    detalhes['bairro'] = padronizar_bairro(bairro_original) if bairro_original else None

    detalhes["cidade"] = "São Paulo"
    detalhes["uf"] = "SP"

    valor_avaliacao_num = None
    match = re.search(r"Valor de avaliação:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_avaliacao_str = match.group(0).split(":", 1)[-1].strip()
        valor_avaliacao_num = float(valor_avaliacao_str.replace("R$", "").replace(".", "").replace(",", "."))
    detalhes["valor_avaliacao"] = valor_avaliacao_num

    valor_minimo1_num = None
    match = re.search(r"Valor mínimo de venda 1º Leilão:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_minimo_1_str = match.group(0).split(":", 1)[-1].strip()
        valor_minimo1_num = float(valor_minimo_1_str.replace("R$", "").replace(".", "").replace(",", "."))
    detalhes["valor_minimo_1_leilao"] = valor_minimo1_num

    valor_minimo2_num = None
    match = re.search(r"Valor mínimo de venda 2º Leilão:\s*R\$ [\d\.,]+", soup.text)
    if match:
        valor_minimo_2_str = match.group(0).split(":", 1)[-1].strip()
        valor_minimo2_num = float(valor_minimo_2_str.replace("R$", "").replace(".", "").replace(",", "."))
    detalhes["valor_minimo_2_leilao"] = valor_minimo2_num

    datas = []
    datas_leiloes = []
    for span in soup.find_all("span"):
        if "Data do 1º Leilão" in span.text or "Data do 2º Leilão" in span.text:
            texto = span.text.strip()
            m = re.search(r"(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}h\d{2})", texto)
            if m:
                data_str = m.group(1)
                hora_str = m.group(2)
                try:
                    dt = datetime.strptime(f"{data_str} {hora_str}", "%d/%m/%Y %Hh%M")
                    datas_leiloes.append(dt)
                except Exception as e:
                    print(f"Erro ao converter data: {e}")
            else:
                datas_leiloes.append(texto)  # Se não conseguir converter, salva o texto original
    detalhes["datas_leiloes"] = datas_leiloes

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
    
    spans = soup.select("div.content span")

    tipo_imovel = None
    for span in spans:
        if "Tipo de imóvel" in span.text:
            strong = span.find("strong")
            if strong:
                tipo_imovel = strong.get_text(strip=True)
            break

    detalhes["tipo_imovel"] = tipo_imovel

    detalhes["tipo_imovel"] = tipo_imovel
    
    detalhes["link"] = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={numero_imovel}"
    
    detalhes["imagem"] = f"https://venda-imoveis.caixa.gov.br/fotos/F{numero_imovel}21.jpg"
    
    detalhes["banco"] = "CAIXA"
    
    detalhes["favorito"] = False
    
    for key, value in detalhes.items():
        if key == "imagem":
            continue
        if key in ["valor_inicial", "valor_avaliacao", "valor_minimo_1_leilao", "valor_minimo_2_leilao"]:
                if value is None:
                    continue
        if value is None:
            detalhes[key] = "Não informado"

    return detalhes

def coletar_lista_imoveis(driver):
    wait = WebDriverWait(driver, 20)
    lista = []
    pagina_atual = 1
    while True:
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
                        "pagina": pagina_atual,
                        "indice": idx
                    })
            except Exception as e:
                print("Erro ao coletar imóvel:", e)
        # Paginação
        try:
            paginacao = driver.find_element(By.ID, "paginacao")
            links = paginacao.find_elements(By.TAG_NAME, "a")
            proximo_link = None
            for link in links:
                if "carregaListaImoveis" in link.get_attribute("href"):
                    numero_pagina = int(link.get_attribute("href").split("carregaListaImoveis(")[1].split(")")[0])
                    if numero_pagina > pagina_atual:
                        proximo_link = link
                        pagina_atual = numero_pagina
                        break
            if proximo_link:
                driver.execute_script("arguments[0].click();", proximo_link)
                time.sleep(3)
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
            else:
                break
        except Exception as e:
            print("Fim da paginação ou erro:", e)
            break
    return lista

# def coletar_lista_imoveis(driver):
#     wait = WebDriverWait(driver, 20)
#     lista = []
#     imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
#     for idx, div in enumerate(imoveis_divs):
#         try:
#             img_tag = div.find_element(By.CLASS_NAME, "fotoimovel-col1").find_element(By.TAG_NAME, "img")
#             onclick = img_tag.get_attribute("onclick")
#             numero_match = re.search(r"detalhe_imovel\((\d+)\)", onclick)
#             if numero_match:
#                 numero_imovel = numero_match.group(1)
#                 lista.append({
#                     "numero_imovel": numero_imovel,
#                     "pagina": 1,
#                     "indice": idx
#                 })
#         except Exception as e:
#             print("Erro ao coletar imóvel:", e)
#     return lista

# def navegar_ate_imovel(driver, estado, cidade, pagina, indice):
#     wait = WebDriverWait(driver, 40)
#     driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')
#     time.sleep(5)
#     Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text(estado)
#     time.sleep(1)
#     Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text(cidade)
#     time.sleep(1)
#     wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
#     time.sleep(1)
#     wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
#     time.sleep(2)
#     wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
#     for _ in range(1, pagina):
#         paginacao = driver.find_element(By.ID, "paginacao")
#         links = paginacao.find_elements(By.TAG_NAME, "a")
#         proximo_link = None
#         for link in links:
#             if "carregaListaImoveis" in link.get_attribute("href"):
#                 proximo_link = link
#                 break
#         if proximo_link:
#             driver.execute_script("arguments[0].click();", proximo_link)
#             time.sleep(3)
#             wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
#     imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
#     return imoveis_divs[indice]

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

    collection = db[nome_collection]
    try:
        collection.drop_index("numero_imovel_1") 
    except Exception:
        pass  

    collection.create_index("numero_imovel", unique=True, sparse=True)

    for imovel in imoveis:
        try:
            collection.update_one(
                {"numero_imovel": imovel["numero_imovel"]},  
                {"$set": imovel},  
                upsert=True  
            )
        except Exception as e:
            print(f"❌ Erro ao salvar imóvel {imovel['numero_imovel']}: {e}")



if __name__ == "__main__":
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_extension(plugin_path)
    
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')
    time.sleep(5)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text("SP")
    time.sleep(5)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text("SAO PAULO")
    time.sleep(5)
    wait.until(EC.visibility_of_element_located((By.ID, "btn_next0")))
    botao = driver.find_element(By.ID, "btn_next0")
    driver.execute_script("arguments[0].scrollIntoView(true);", botao)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", botao)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))
    lista_imoveis = coletar_lista_imoveis(driver)
    print(f"Total de imóveis encontrados: {len(lista_imoveis)}")
    imoveis = processar_todos_imoveis_por_link(driver, lista_imoveis)
    salvar_em_mongodb(imoveis, "imoveis")
    driver.quit()
