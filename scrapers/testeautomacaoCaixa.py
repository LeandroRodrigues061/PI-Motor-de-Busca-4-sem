from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup
import time
import csv

def extrair_imoveis_da_pagina(driver):
    soup = BeautifulSoup(driver.page_source, "html.parser")
    lista_div = soup.find("div", id="listaimoveispaginacao")
    imoveis_divs = lista_div.find_all("div", class_="dadosimovel-col2")  # Ajustar conforme necessário

    imoveis = []
    for div in imoveis_divs:
        dados = {}
        endereco = div.find("a")
        if endereco:
            dados["endereço"] = endereco.get_text(strip=True)

        infos = div.find_all("font")
        for font in infos:
            texto = font.get_text(strip=True)
            if "Valor de avaliação" in texto:
                dados["valorA"] = texto
            elif "Valor mínimo de venda" in texto:
                dados["valorMin"] = texto
            elif "Numero do imóvel" in texto:
                dados["numImov"] = texto
            elif "Despesas do imóvel" in texto:
                dados["despesas"] = texto

        imoveis.append(dados)
    return imoveis

def extrair_imoveis_selenium():
   
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 20)

    driver.get('https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp')

    # Seleciona Estado e Cidade
    select_estado = wait.until(EC.presence_of_element_located((By.ID, "cmb_estado")))
    Select(select_estado).select_by_visible_text("SP")
    time.sleep(2)

    select_cidade = wait.until(EC.presence_of_element_located((By.ID, "cmb_cidade")))
    Select(select_cidade).select_by_visible_text("SAO PAULO")
    time.sleep(4)

    # Clica nos botões de avançar
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next0"))).click()
    time.sleep(1)
    wait.until(EC.element_to_be_clickable((By.ID, "btn_next1"))).click()
    time.sleep(4)

    # Espera os imóveis carregarem
    wait.until(EC.presence_of_element_located((By.ID, "listaimoveispaginacao")))

    todos_os_imoveis = []

    while True:
        imoveis = extrair_imoveis_da_pagina(driver)
        todos_os_imoveis.extend(imoveis)
        print(f"Página carregada - {len(imoveis)} imóveis encontrados. Total acumulado: {len(todos_os_imoveis)}")

        # Tenta clicar em "Próxima"
        try:
            # Procura a div de paginação e pega os links válidos
            paginacao = driver.find_element(By.ID, "paginacao")
            links = paginacao.find_elements(By.TAG_NAME, "a")

            proximo_link = None
            for link in links:
                href = link.get_attribute("href")
                if href and "carregaListaImoveis" in href:
                    pagina = int(href.split("carregaListaImoveis(")[1].split(")")[0])
                    if pagina > len(todos_os_imoveis) // len(imoveis):  # só avança se for próxima
                        proximo_link = link
                        break

            if proximo_link:
                driver.execute_script("arguments[0].click();", proximo_link)
                time.sleep(8)
                wait.until(EC.presence_of_element_located((By.ID, "listaimoveispaginacao")))
            else:
                break 
            
        except Exception as e:
            print("Erro ou última página:", e)
            break

    driver.quit()
    return todos_os_imoveis

def salvar_em_csv(imoveis, nome_arquivo = 'imoveis2.csv'):
    if not imoveis:
        print("Nenhum imóvel encontrado.")
        return
    chaves = imoveis[0].keys()
    with open(nome_arquivo, 'w', newline='', encoding='utf-8') as arquivo_csv:
        writer = csv.DictWriter(arquivo_csv, fieldnames=chaves)
        writer.writeheader()
        for imovel in imoveis:
            writer.writerow(imovel)



if __name__ == "__main__":
    dados = extrair_imoveis_selenium()
    for i, imovel in enumerate(dados, 1):
        print(f"Imóvel #{i}")
        for k, v in imovel.items():
            print(f"{k.capitalize()}: {v}")
        print("-" * 40)
        
    salvar_em_csv(dados)