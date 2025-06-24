# Lastrear - Buscador de Imóveis 🏡

**Projeto acadêmico da FATEC Zona Leste em parceria com uma empresa imobiliária.**

## 📌 Descrição

**Lastrear** é um buscador de imóveis que realiza web scraping em sites de instituições financeiras como **Caixa**, **Santander**, **Bradesco** e **Itaú**, com o objetivo de reunir oportunidades de imóveis em leilão ou venda direta em uma única plataforma.
A aplicação exibe essas oportunidades de forma clara e organizada, com filtros e informações relevantes para facilitar a busca, comparação e marcação de favoritos.

## 🔍 Funcionalidades

* Coleta de dados de imóveis disponíveis em grandes portais de instituições financeiras;
* Interface intuitiva que exibe os imóveis logo na página inicial;
* Filtros para refinar a busca por localidade, tipo de imóvel, valor, entre outros;
* Possibilidade de adicionar imóveis aos favoritos;
* Exibição de informações relevantes dos imóveis para facilitar a tomada de decisão.

## 🧱 Estrutura do Projeto

O projeto está dividido em três containers via **Docker** e orquestrado por **Docker Compose**:

1. **Frontend**: Interface web desenvolvida com **Next.js**, responsável pela exibição dos imóveis e interação com o usuário.
2. **Backend de Scraping**: Serviço em **Python** responsável por coletar os dados nos sites-alvo utilizando bibliotecas como Selenium e BeautifulSoup.
3. **Banco de Dados**: Utiliza **MongoDB** para armazenar os imóveis extraídos e organizados.

### 🐳 Sobre o Docker

A aplicação utiliza **Docker Compose** para facilitar o ambiente de desenvolvimento e execução. Com um único comando, todos os serviços são iniciados em containers isolados:

* O container do **Next.js** executa a aplicação web.
* O container do **Python** realiza o scraping dos dados dos sites.
* O container do **MongoDB** armazena os dados persistentes.

*(Explicação técnica detalhada será ajustada posteriormente.)*

## 📚 Tecnologias Utilizadas

* **Python** (Selenium, BeautifulSoup)
* **Next.js (React)**
* **MongoDB**
* **Docker & Docker Compose**
* **Node.js**

## 🏫 Sobre o Projeto

Este projeto está sendo desenvolvido como parte de um trabalho acadêmico da **FATEC Zona Leste**, em parceria com uma empresa do ramo imobiliário. Seu objetivo é aplicar conhecimentos técnicos em um contexto real, ao mesmo tempo em que se propõe a resolver uma dor do mercado.
