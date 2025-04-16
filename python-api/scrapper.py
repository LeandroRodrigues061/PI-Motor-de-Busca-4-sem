from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

def extrair_imoveis():
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    driver.get("https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp")

    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))).select_by_visible_text("SP")
    time.sleep(2)
    Select(wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))).select_by_visible_text("SAO PAULO")
    time.sleep(3)

    wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
    time.sleep(1)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    time.sleep(4)

    wait.until(EC.presence_of_element_located((By.ID, "listaimoveispaginacao")))

    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    lista_div = soup.find("div", id="listaimoveispaginacao")
    imoveis_divs = lista_div.find_all("div", class_="dadosimovel-col2")

    imoveis = []
    for div in imoveis_divs:
        dados = {}
        endereco = div.find("a")
        if endereco:
            dados["endereco"] = endereco.get_text(strip=True)

        for font in div.find_all("font"):
            texto = font.get_text(strip=True)
            if "Valor de avaliação" in texto:
                dados["valorAvaliacao"] = texto
            elif "Valor mínimo de venda" in texto:
                dados["valorMinimo"] = texto
            elif "Numero do imóvel" in texto:
                dados["numero"] = texto
            elif "Despesas do imóvel" in texto:
                dados["despesas"] = texto

        imoveis.append(dados)

    return imoveis
