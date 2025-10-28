import subprocess
import sys
import os

scripts = [
    'ScrapingBradesco.py',
    'testeautomacaoSantander.py',
    'Scraping_Itau.py',
    'megaLeiloes.py',
    # 'testeautomacaoCaixa.py',
]

success = []
fail = []

for script in scripts:
    print(f'🚀 Executando {script}...')
    if not os.path.exists(script):
        print(f'❌ Script {script} não encontrado!')
        fail.append(script)
        continue

    try:
        result = subprocess.run(
            [sys.executable, script],
            capture_output=True,
            text=True,
            check=True
        )
        print(f'📄 STDOUT de {script}:\n{result.stdout}')
        print(f'⚠️ STDERR de {script}:\n{result.stderr}')
        success.append(script)
    except subprocess.CalledProcessError as e:
        print(f'❌ Erro ao executar {script}:')
        print(f'📄 STDOUT:\n{e.stdout}')
        print(f'⚠️ STDERR:\n{e.stderr}')
        fail.append(script)
    except Exception as e:
        print(f'❌ Erro inesperado ao executar {script}: {e}')
        fail.append(script)
    print('-' * 80)

print('\n===== RESUMO DA EXECUÇÃO =====')
print(f'Scripts executados com sucesso: {success}')
print(f'Scripts que falharam: {fail}')