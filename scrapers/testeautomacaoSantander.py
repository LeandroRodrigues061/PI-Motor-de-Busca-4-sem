from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import tempfile
import re
from datetime import datetime

from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017")
db = client["MotorDeBusca"]

def parse_valor(valor_str):
    if not valor_str:
        return None
    valor_str = valor_str.replace("R$", "").replace(".", "").replace(",", ".").strip()
    try:
        return float(valor_str)
    except ValueError:
        return None

def parse_area(area_str):
    if not area_str:
        return None
    match = re.search(r'([\d,.]+)', area_str.replace(".", "").replace(",", "."))
    return float(match.group(1)) if match else None

def parse_int_from_text(text):
    if not text:
        return None
    match = re.search(r'\d+', text)
    return int(match.group()) if match else None

def parse_datetime(data_str, hora_str):
    try:
        return datetime.strptime(f"{data_str} {hora_str}", "%d/%m/%Y %Hh%M")
    except Exception:
        return None

def extrair_dados_imoveis(html):
    soup = BeautifulSoup(html, 'html.parser')
    cards = soup.find_all('a', class_='card')

    def get_text_safe(el):
        return el.get_text(strip=True) if el else None

    imoveis = []
    for card in cards:
        card_data = {}

        header = card.find('a', class_='card-header')
        body = card.find('div', class_='card-body')
        footer = card.find('div', class_='card-footer')

        card_data['url'] = header['href'] if header and header.has_attr('href') else None

        style = header.get('style', '') if header else ''
        if 'url(' in style:
            card_data['imagem'] = style.split('url("')[1].split('")')[0]
        else:
            card_data['imagem'] = None

        badge = header.find('span', class_='badge badge-dark') if header else None
        card_data['tipo_leilao'] = get_text_safe(badge)

        svg = header.find('svg') if header else None
        card_data['endereco'] = svg.find_next_sibling(string=True).strip() if svg else None

        valor_ant = body.find('div', class_='card-valor-ant') if body else None
        valor_atual = body.find('div', class_='card-valor-atual') if body else None
        card_data['valor_anterior'] = parse_valor(get_text_safe(valor_ant))
        card_data['valor_atual'] = parse_valor(get_text_safe(valor_atual))

        cod = body.find('small') if body else None
        card_data['codigo'] = get_text_safe(cod)

        data_info = body.find('div', class_='card-data') if body else None
        if data_info:
            data_hora = data_info.find_all('strong')
            if len(data_hora) >= 2:
                data_str = get_text_safe(data_hora[0])
                hora_str = get_text_safe(data_hora[1])
                card_data['data_hora_leilao'] = parse_datetime(data_str, hora_str)
            else:
                card_data['data_hora_leilao'] = None
        else:
            card_data['data_hora_leilao'] = None

        # Inicializar como None
        area, quartos, vagas = None, None, None

        if footer:
            textos = footer.find_all('p')
            for texto in textos:
                txt = get_text_safe(texto)
                if 'm²' in txt:
                    area = parse_area(txt)
                elif 'quarto' in txt:
                    quartos = parse_int_from_text(txt)
                elif 'vaga' in txt:
                    vagas = parse_int_from_text(txt)

        card_data['area'] = area
        card_data['quartos'] = quartos
        card_data['vagas'] = vagas

        imoveis.append(card_data)

    return imoveis

def extrair_imoveis_com_paginacao():
    # Headless configurado corretamente
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-http2')
    options.add_argument(f'--user-data-dir={tempfile.mkdtemp()}')
    
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    driver.get('https://www.santanderimoveis.com.br/?txtsearch=S%C3%A3o+Paulo&cidade=S%C3%A3o+Paulo')
    
    wait.until(EC.presence_of_element_located((By.ID, 'autocomplete-list')))

    todos_os_imoveis = []

    while True:
        time.sleep(2)
        html = driver.page_source
        imoveis = extrair_dados_imoveis(html)
        todos_os_imoveis.extend(imoveis)

        try:
            paginacao = driver.find_element(By.CSS_SELECTOR, 'section.content-pagination ul')
            paginas = paginacao.find_elements(By.TAG_NAME, 'li')

            encontrou_proxima = False
            proxima_pagina = None
            encontrou_atual = False

            for li in paginas:
                classe = li.get_attribute('class')
                if 'active' in classe:
                    encontrou_atual = True
                    continue
                if encontrou_atual and li.text.strip().isdigit():
                    proxima_pagina = li
                    encontrou_proxima = True
                    break

            if encontrou_proxima and proxima_pagina:
                link = proxima_pagina.find_element(By.TAG_NAME, 'a')
                driver.execute_script("arguments[0].click();", link)
            else:
                print("Fim da paginação.")
                break

        except Exception as e:
            print("Erro ao tentar paginar:", e)
            break

    driver.quit()
    return todos_os_imoveis

def salvar_em_mongodb(imoveis, nome_collection):
    if not imoveis:
        print("Nenhum dado para salvar no MongoDB.")
        return
    collection = db[nome_collection]
    collection.insert_many(imoveis)
    print(f"{len(imoveis)} documentos inseridos na collection '{nome_collection}'.")

if __name__ == "__main__":
    dados = extrair_imoveis_com_paginacao()
    print(f"\nTotal de imóveis extraídos: {len(dados)}")
    salvar_em_mongodb(dados, "imoveis_santander")
