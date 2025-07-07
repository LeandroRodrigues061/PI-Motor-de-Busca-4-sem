import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient, errors
from datetime import datetime
import time, unicodedata, re
from bs4 import BeautifulSoup

# Proxy BrightData
BRIGHT_USERNAME = 'brd-customer-hl_3da95667-zone-residential_proxy1-session-24000_0-debug-none'
BRIGHT_PASSWORD = 'r3i1r5p8zviw'
BRIGHT_IP = '77.37.41.87'
BRIGHT_PORT = '24000'

PROXY = f"http://{BRIGHT_IP}:{BRIGHT_PORT}"
def padronizar_bairro(bairro):
    if not bairro:
        return None
    bairro = bairro.strip().upper()
    bairro = ''.join(c for c in unicodedata.normalize('NFD', bairro) if unicodedata.category(c) != 'Mn')
    bairro = re.sub(r'\s+', ' ', bairro)
    bairro = bairro.replace('JD ', 'JARDIM ').replace('JD. ', 'JARDIM ')
    bairro = bairro.replace('VL ', 'VILA ').replace('VL. ', 'VILA ')
    bairro = bairro.replace('PQ ', 'PARQUE ').replace('PQ. ', 'PARQUE ')
    bairro = bairro.replace('DIST ', 'DISTRITO ').replace('S ', 'SÃO ').replace('PAULIS', 'PAULISTA ')
    return bairro.rstrip('.,-')

def extrair_detalhes_imovel(driver, numero_imovel):
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    detalhes = {}

    h5 = soup.find("h5")
    detalhes["titulo"] = h5.text.strip() if h5 else "Não informado"

    endereco = ""
    for p in soup.find_all('p'):
        strong = p.find('strong')
        if strong and "Endereço" in strong.text:
            endereco = p.get_text(separator="\n", strip=True).split("\n", 1)[-1]
            break
    detalhes["endereco"] = endereco if endereco else "Não informado"

    bairro_match = re.search(r",\s*([^,]+)\s*-\s*CEP", endereco)
    bairro = bairro_match.group(1).strip() if bairro_match else None
    detalhes["bairro"] = padronizar_bairro(bairro) if bairro else "Não informado"

    detalhes["cidade"] = "São Paulo"
    detalhes["uf"] = "SP"

    for label, key in [
        ("Valor de avaliação", "valor_avaliacao"),
        ("Valor mínimo de venda 1º Leilão", "valor_minimo_1_leilao"),
        ("Valor mínimo de venda 2º Leilão", "valor_minimo_2_leilao")
    ]:
        match = re.search(fr"{label}:\s*R\$ [\d\.,]+", soup.text)
        valor = match.group(0).split(":", 1)[-1].strip() if match else None
        detalhes[key] = float(valor.replace("R$", "").replace(".", "").replace(",", ".")) if valor else "Não informado"

    datas_leiloes = []
    for span in soup.find_all("span"):
        if "Data do 1º Leilão" in span.text or "Data do 2º Leilão" in span.text:
            m = re.search(r"(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}h\d{2})", span.text.strip())
            if m:
                try:
                    dt = datetime.strptime(f"{m.group(1)} {m.group(2)}", "%d/%m/%Y %Hh%M")
                    datas_leiloes.append(dt)
                except:
                    datas_leiloes.append(span.text.strip())
    detalhes["datas_leiloes"] = datas_leiloes or ["Não informado"]

    pagamento_section = next((p for p in soup.find_all("p") if "FORMAS DE PAGAMENTO ACEITAS" in p.text), None)
    formas_pagamento = [i.next_sibling.strip() for i in pagamento_section.find_all("i") if i.next_sibling] if pagamento_section else []
    detalhes["formas_pagamento"] = formas_pagamento or ["Não informado"]

    tipo_imovel = next((span.find("strong").get_text(strip=True) for span in soup.select("div.content span") if "Tipo de imóvel" in span.text), "Não informado")
    detalhes["tipo_imovel"] = tipo_imovel

    detalhes["link"] = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={numero_imovel}"
    detalhes["imagem"] = f"https://venda-imoveis.caixa.gov.br/fotos/F{numero_imovel}21.jpg"
    detalhes["banco"] = "CAIXA"
    detalhes["favorito"] = False

    return detalhes

def coletar_lista_imoveis(driver):
    wait = WebDriverWait(driver, 20)
    lista, pagina_atual = [], 1
    while True:
        imoveis_divs = driver.find_elements(By.CLASS_NAME, "group-block-item")
        for idx, div in enumerate(imoveis_divs):
            try:
                onclick = div.find_element(By.CLASS_NAME, "fotoimovel-col1").find_element(By.TAG_NAME, "img").get_attribute("onclick")
                numero_match = re.search(r"detalhe_imovel\((\d+)\)", onclick)
                if numero_match:
                    lista.append({"numero_imovel": numero_match.group(1), "pagina": pagina_atual, "indice": idx})
            except: pass
        try:
            paginacao = driver.find_element(By.ID, "paginacao")
            links = paginacao.find_elements(By.TAG_NAME, "a")
            proximo = next((l for l in links if "carregaListaImoveis" in l.get_attribute("href") and int(l.text) > pagina_atual), None)
            if proximo:
                pagina_atual += 1
                driver.execute_script("arguments[0].click();", proximo)
                time.sleep(3)
            else:
                break
        except:
            break
    return lista

def processar_todos_imoveis_por_link(driver, lista_imoveis):
    wait = WebDriverWait(driver, 20)
    imoveis = []
    for item in lista_imoveis:
        try:
            driver.get(f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={item['numero_imovel']}")
            wait.until(EC.presence_of_element_located((By.ID, "dadosImovel")))
            detalhes = extrair_detalhes_imovel(driver, item['numero_imovel'])
            detalhes["numero_imovel"] = item["numero_imovel"]
            imoveis.append(detalhes)
        except Exception as e:
            print(f"Erro ao processar {item['numero_imovel']}: {e}")
    return imoveis

def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("⚠️ Nenhum dado para salvar no MongoDB.")
        return
    collection = db[nome_collection]
    collection.create_index("numero_imovel", unique=True, sparse=True)
    for imovel in imoveis:
        try:
            collection.update_one({"numero_imovel": imovel["numero_imovel"]}, {"$set": imovel}, upsert=True)
        except Exception as e:
            print(f"❌ Erro ao salvar {imovel['numero_imovel']}: {e}")

if __name__ == "__main__":
    options = uc.ChromeOptions()
    options.add_argument(f'--proxy-server=http://127.0.0.1/:24000')
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument('--start-maximized')
    
    driver = uc.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')
    time.sleep(5)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text("SP")
    time.sleep(5)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text("SAO PAULO")
    time.sleep(5)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group-block-item")))

    lista = coletar_lista_imoveis(driver)
    print(f"🔍 Total encontrados: {len(lista)}")

    imoveis = processar_todos_imoveis_por_link(driver, lista)

    driver.quit()
