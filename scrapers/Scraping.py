from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from time import sleep
import csv
import tempfile

# Configuração do Chrome para Docker
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1920,1080')
options.add_argument(f'--user-data-dir={tempfile.mkdtemp()}')

driver = webdriver.Chrome(options=options)
driver.get("https://vitrinebradesco.com.br/auctions?type=realstate")

wait = WebDriverWait(driver, 20)

# Aguarda dropdown aparecer e clicar em "SP"
wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "select__control")))
dropdowns = driver.find_elements(By.CLASS_NAME, "select__control")

dropdowns[0].click()
wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'SP')]"))).click()

# Aguarda e seleciona "São Paulo - SP"
dropdowns = driver.find_elements(By.CLASS_NAME, "select__control")  
dropdowns[1].click()
wait.until(EC.element_to_be_clickable((By.XPATH, "(//div[contains(text(), 'São Paulo - SP')])[2]"))).click()

sleep(2)

def extrair_dados():
    cards = driver.find_elements(By.CLASS_NAME, "auction-container")
    dados = []

    for card in cards:
        try:
            ActionChains(driver).move_to_element(card).perform()
            sleep(0.5)
            imagem_element = card.find_element(By.CLASS_NAME, "thumbnail-container").find_element(By.TAG_NAME, "img")
            imagem = imagem_element.get_attribute("src")
        except:
            imagem = "N/A"

        try:
            descricao = card.find_element(By.CLASS_NAME, "description").text
        except:
            descricao = "N/A"

        try:
            valor = card.find_element(By.CLASS_NAME, "bottom").text.split("\n")[0]
        except:
            valor = "N/A"

        dados.append({
            "imagem": imagem,
            "descricao": descricao,
            "valor": valor
        })

    return dados

# Salvar no CSV
with open("imoveis3.csv", "w", newline="", encoding="utf-8") as arquivo_csv:
    writer = csv.DictWriter(arquivo_csv, fieldnames=["imagem", "descricao", "valor"])
    writer.writeheader()
    for dado in extrair_dados():
        writer.writerow(dado)

driver.quit()
