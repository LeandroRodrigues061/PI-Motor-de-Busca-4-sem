import subprocess

scripts = [
    'Scraping_Itau.py',
    'Scraping.py',
    'testeautomacaoCaixa',
    'testeautomacaoSantander'
]

for script in scripts:
    print(f'Executando {script}...')
    subprocess.run(['python', script])