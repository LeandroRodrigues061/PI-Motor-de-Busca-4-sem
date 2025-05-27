import subprocess

scripts = [
    # 'Scraping_Itau.py',
    # 'Scraping.py',
    # 'testeautomacaoCaixa.py',
     'testeautomacaoSantander.py'
]

for script in scripts:
    print(f'Executando {script}...')
    subprocess.run(['python', script])