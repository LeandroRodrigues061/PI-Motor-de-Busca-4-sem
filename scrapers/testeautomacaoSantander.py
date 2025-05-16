from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import tempfile
import re
from datetime import datetime

from pymongo import MongoClient

client = MongoClient("mongodb://root:example@mongo:27017/MotorDeBusca?authSource=admin")
db = client["MotorDeBusca"]

def get_text_safe(el):
    return el.get_text(strip=True) if el else None

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

        card_data['valor_atual'] = None
        if body:
            valor_atual_el = body.select_one('.card-valor-atual')
            if valor_atual_el:
                porcento = valor_atual_el.find('p', class_='card-porcento')
                if porcento:
                    porcento.decompose()
                card_data['valor_atual'] = valor_atual_el.get_text(strip=True)
            else:
                card_data['valor_atual'] = None

        cod = body.find('small') if body else None
        card_data['codigo'] = get_text_safe(cod)

        data_info = body.find('div', class_='card-data') if body else None
        if data_info:
            data_hora = data_info.find_all('strong')
            if len(data_hora) >= 2:
                card_data['data'] = get_text_safe(data_hora[0])
                card_data['hora'] = get_text_safe(data_hora[1])
            else:
                card_data['data'] = card_data['hora'] = None
        else:
            card_data['data'] = card_data['hora'] = None

        if footer:
            textos = footer.find_all('p')
            for texto in textos:
                txt = get_text_safe(texto)
                if 'm²' in txt:
                    card_data['area'] = txt
                elif 'quarto' in txt:
                    card_data['quartos'] = txt
                elif 'vaga' in txt:
                    card_data['vagas'] = txt

        imoveis.append(card_data)

    return imoveis

def extrair_imoveis_com_paginacao():
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
            encontrou_atual = False

            for li in paginas:
                if 'active' in li.get_attribute('class'):
                    encontrou_atual = True
                    continue
                if encontrou_atual and li.text.strip().isdigit():
                    proxima_pagina = li.find_element(By.TAG_NAME, 'a')
                    driver.execute_script("arguments[0].click();", proxima_pagina)
                    encontrou_proxima = True
                    break

            if not encontrou_proxima:
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

    # Garante que 'url' seja único
    collection.create_index("url", unique=True)

    novos = 0
    atualizados = 0

    for imovel in imoveis:
        if not imovel.get("url"):
            continue  # Ignora se não tiver URL

        result = collection.update_one(
            {"url": imovel["url"]},  
            {"$set": imovel},        
            upsert=True              
        )

        if result.upserted_id:
            novos += 1
        elif result.modified_count > 0:
            atualizados += 1

    print(f"{novos} novos imóveis inseridos na collection '{nome_collection}'.")
    print(f"{atualizados} imóveis atualizados.")

if __name__ == "__main__":
    imoveis_extraidos = extrair_imoveis_com_paginacao()
    print(f"🔍 Total de imóveis extraídos: {len(imoveis_extraidos)}")
    salvar_em_mongodb(imoveis_extraidos, "imoveis_santander")

    

