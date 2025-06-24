import subprocess

scripts = [
    # 'ScrapingBradesco.py',
     'testeautomacaoSantander.py' ,
    # 'Scraping_Itau.py',
    # 'testeautomacaoCaixa.py',
]

for script in scripts:
    print(f'🚀 Executando {script}...')
    result = subprocess.run(['python', script], capture_output=True, text=True)
    
    print(f'📄 STDOUT de {script}:\n{result.stdout}')
    print(f'⚠️ STDERR de {script}:\n{result.stderr}')
    print('-' * 80)