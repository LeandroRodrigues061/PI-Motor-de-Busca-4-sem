from selenium import webdriver
from time import sleep
import csv

driver = webdriver.Chrome()
driver.get("https://www.itau.com.br/imoveis-itau?leilao=true&estado=S%C3%83O+PAULO&cidade=S%C3%83O+PAULO")
sleep(5)

# Acessa os cards via shadowRoot
cards = driver.execute_script("""
    const appRoot = document.querySelector("app-leiloes-list");
    const shadow = appRoot.shadowRoot;
    const container = shadow.querySelector(".itau-leiloes-pagination-cards");
    return Array.from(container.querySelectorAll(".itau-leiloes-card"));
""")

dados = []

for card in cards:
    try:
        imagem = driver.execute_script("return arguments[0].querySelector('img.itau-leiloes-carrousel-image')?.src;", card)
    except:
        imagem = "N/A"

    try:
        endereco = driver.execute_script("return arguments[0].querySelector('.itau-leiloes-card-info')?.textContent;", card)
    except:
        endereco = "N/A"

    print(f"Imagem: {imagem}")
    print(f"Endereço: {endereco}")
    print("---")

    dados.append({"imagem": imagem, "endereco": endereco})

# Salvar em CSV
with open("imoveis4.csv", "w", newline="", encoding="utf-8") as arquivo_csv:
    writer = csv.DictWriter(arquivo_csv, fieldnames=["imagem", "endereco"])
    writer.writeheader()
    for dado in dados:
        writer.writerow(dado)

driver.quit()
