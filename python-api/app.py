from flask import Flask, jsonify
from scrapper import extrair_imoveis

app = Flask(__name__)

@app.route('/imoveis', methods=['GET'])
def buscar_imoveis():
    try:
        imoveis = extrair_imoveis()
        return jsonify(imoveis)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
