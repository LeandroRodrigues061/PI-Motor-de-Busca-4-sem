import re
import unicodedata
from datetime import datetime
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from bs4 import BeautifulSoup
import time

try:
    client = MongoClient("mongodb+srv://usuario:senha@clusterlastrearimoveis.xhmcrgi.mongodb.net/")
    db = client["MotorDeBusca"]
    print("Conexão com MongoDB estabelecida.")
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    client = None
    db = None


def get_text_safe(el, strip=True):
    return el.get_text(strip=strip) if el else None

def parse_float(valor_str):
    if not valor_str:
        return None
    valor_str = valor_str.replace("R$", "").replace(".", "").replace(",", ".").strip()
    try:
        return float(valor_str)
    except (ValueError, TypeError):
        return None

def parse_datetime_mega(data_str):
    if not data_str:
        return None
    data_str = data_str.replace("às", "").strip()
    data_str = re.sub(r'\s+', ' ', data_str) 
    
    try:
        return datetime.strptime(data_str, "%d/%m/%Y %H:%M")
    except ValueError:
        try:
            return datetime.strptime(data_str, "%d/%m/%Y")
        except ValueError:
            print(f"Formato de data não reconhecido: {data_str}")
            return None

def extrair_dados_imoveis_mega(html):

    soup = BeautifulSoup(html, 'html.parser')
    
    cards = soup.select('div.cards-container div[data-key]')
    
    if not cards:
        print("BS4: Nenhum card com 'data-key' encontrado neste HTML.")
        return []

    imoveis = []

    for card in cards:
        card_data = {}
        card_data['banco'] = 'Mega Leilões'

        link_tag = card.find('a', class_='card-image')
        if link_tag:
            card_data['link'] = link_tag.get('href')
            card_data['imagem'] = link_tag.get('data-bg')
            if not card_data['imagem']:
                 img_interna = link_tag.find('img')
                 if img_interna:
                     card_data['imagem'] = img_interna.get('src')
        else:
            card_data['link'] = None
            card_data['imagem'] = None

        content_tag = card.find('div', class_='card-content')
        if content_tag:
            title_link_tag = content_tag.find('a', class_='card-title')
            endereco_completo = get_text_safe(title_link_tag)
            card_data['endereco'] = endereco_completo
            
            if endereco_completo:
                card_data['titulo'] = endereco_completo.split(' - ')[0].strip()
            else:
                card_data['titulo'] = None
            
            bairro = None
            if endereco_completo:
                 match = re.search(r'-\s*([^,-]+?)\s*-\s*S[aã]o Paulo', endereco_completo, re.IGNORECASE)
                 if match:
                     bairro = match.group(1).strip()

            card_data['bairro'] = bairro 
        else:
            card_data['titulo'] = None
            card_data['endereco'] = None
            card_data['bairro'] = None

        price_tag = card.find('div', class_='card-price')
        card_data['valor'] = parse_float(get_text_safe(price_tag))

        info_tag = card.find('div', class_='card-instance-info')
        if info_tag:
            praca_1_tag = info_tag.find('div', class_='instance first active')
            if praca_1_tag:
                data_1_tag = praca_1_tag.find('span', class_='card-first-instance-date')
                data_1_raw = get_text_safe(data_1_tag)
                if data_1_raw:
                    data_1_clean = re.sub(r'1ª Praça:|\<b>|\</b>', '', data_1_raw, flags=re.IGNORECASE).strip()
                    card_data['data_1_leilao'] = parse_datetime_mega(data_1_clean)
                
                valor_1_tag = praca_1_tag.find('span', class_='card-instance-value')
                card_data['valor_minimo_1_leilao'] = parse_float(get_text_safe(valor_1_tag))

            data_2_tag = info_tag.find('span', class_='card-second-instance-date')
            if data_2_tag:
                data_2_raw = get_text_safe(data_2_tag)
                data_2_clean = re.sub(r'2ª Praça:|\<b>|\</b>', '', data_2_raw, flags=re.IGNORECASE).strip()
                card_data['data_2_leilao'] = parse_datetime_mega(data_2_clean)

                valor_2_tag = data_2_tag.find_next_sibling('span', class_='card-instance-value')
                if not valor_2_tag:
                    valor_2_tag = data_2_tag.parent.find('span', class_='card-instance-value')
                
                card_data['valor_minimo_2_leilao'] = parse_float(get_text_safe(valor_2_tag))
        

        number_tag = card.find('div', class_='card-number')
        card_data['numero_imovel'] = get_text_safe(number_tag)

        card_data['uf'] = "SP"
        card_data['cidade'] = "São Paulo"
        card_data['favorito'] = False
        card_data['site'] = "Mega Leilões"

        imoveis.append(card_data)

    return imoveis


def extrair_imoveis_com_paginacao_mega():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--log-level=3') 
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(options=options)
    
    wait = WebDriverWait(driver, 30) 
    cookie_wait = WebDriverWait(driver, 15) 
    
    url = 'https://www.megaleiloes.com.br/imoveis/sp/sao-paulo?tov=igbr&valor_max=5000000&tipo%5B0%5D=1&tipo%5B1%5D=2'
    print(f"Acessando URL: {url}")
    driver.get(url)

    try:
        COOKIE_BUTTON_ID = "adopt-accept-all-button"
        COOKIE_BANNER_ID = "cookie-banner"

        print(f"Aguardando botão de cookie (ID: {COOKIE_BUTTON_ID})...")
        
        cookie_button = cookie_wait.until(
            EC.element_to_be_clickable((By.ID, COOKIE_BUTTON_ID))
        )
        
        print("Botão de cookie encontrado! Clicando...")
        driver.execute_script("arguments[0].click();", cookie_button)

        print("Aguardando banner de cookie desaparecer...")
        cookie_wait.until(
            EC.invisibility_of_element_located((By.ID, COOKIE_BANNER_ID))
        )
        print("✅ Banner de cookie desapareceu. Continuando...")

    except TimeoutException:
        print("(!) Aviso: Botão de cookie não encontrado ou não desapareceu a tempo. O script pode falhar.")
    except Exception as e:
        print(f"❌ Erro inesperado ao tentar clicar no cookie: {e}")

    

    SELETOR_CONTAINER = (By.CLASS_NAME, "cards-container")
    SELETOR_DOS_CARDS = (By.CSS_SELECTOR, "div.cards-container div[data-key]")
    
    try:
        print("Aguardando CONTAINER 'div#cards-container'...")
        wait.until(EC.presence_of_element_located(SELETOR_CONTAINER))
        print("✅ Container 'cards-container' encontrado!")
        
        print("Aguardando CARDS 'div[data-key]' dentro do container...")
        wait.until(EC.presence_of_element_located(SELETOR_DOS_CARDS))
        print("✅ Cards 'data-key' encontrados!")
        
    except TimeoutException:
        print("❌ Erro: Mesmo após o cookie, os cards não apareceram.")
        print("Salvando screenshot de depuração em 'debug_timeout.png'...")
        driver.save_screenshot('debug_timeout.png')
        driver.quit()
        return []
    
    todos_os_imoveis = []
    page_num = 1

    while True:
        print(f"🔄 Processando página {page_num}...")
        
        try:
            wait.until(EC.visibility_of_element_located(SELETOR_DOS_CARDS))
        except TimeoutException:
            print(f"A página {page_num} não carregou cards a tempo. Encerrando.")
            break
        
        html = driver.page_source
        imoveis_pagina = extrair_dados_imoveis_mega(html)
        
        if not imoveis_pagina:
            print("Função 'extrair_dados_imoveis_mega' não encontrou imóveis. Encerrando.")
            break
        
        print(f"   Encontrados {len(imoveis_pagina)} imóveis.")
        todos_os_imoveis.extend(imoveis_pagina)

        try:
            primeiro_card_atual = driver.find_element(*SELETOR_DOS_CARDS)
            
            next_li = driver.find_element(By.CSS_SELECTOR, "li.next:not(.disabled)")
            next_link = next_li.find_element(By.TAG_NAME, 'a')
            
            print(f"Indo para a página {page_num + 1}...")
            driver.execute_script("arguments[0].click();", next_link)
            
            print(f"Aguardando carregamento da página {page_num + 1}...")
            wait.until(EC.staleness_of(primeiro_card_atual))
            
            page_num += 1

        except NoSuchElementException:
            print("✅ Fim da paginação (não encontrou mais um botão 'next' ativo).")
            break
        except Exception as e:
            print(f"❌ Erro inesperado ao tentar paginar: {e}")
            driver.save_screenshot('debug_paginacao.png')
            break

    driver.quit()
    return todos_os_imoveis

def salvar_em_mongodb(imoveis, nome_collection):
    if client is None or db is None:
        print("Conexão com MongoDB não disponível. Pulando salvamento.")
        return

    if not imoveis:
        print("Nenhum dado para salvar no MongoDB.")
        return

    collection = db[nome_collection]
    collection.create_index("link", unique=True) 

    novos = 0
    atualizados = 0

    for imovel in imoveis:
        if not imovel.get("link"):
            print(f"Imóvel sem link, pulando: {imovel.get('titulo')}")
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

    print(f"--- Resultado MongoDB ---")
    print(f"✅ {novos} novos imóveis inseridos na collection '{nome_collection}'.")
    print(f"🔄 {atualizados} imóveis atualizados.")


if __name__ == "__main__":
    print("Iniciando scraper Mega Leilões...")
    imoveis_extraidos = extrair_imoveis_com_paginacao_mega()
    
    if imoveis_extraidos:
        print(f"🔍 Total de imóveis extraídos: {len(imoveis_extraidos)}")
        
        salvar_em_mongodb(imoveis_extraidos, "imoveis")
    else:
        print("Nenhum imóvel foi extraído.")