# 📌 Documentação do Projeto - Controle de Viagens Agrocontar

---

## 🎯 Objetivo do Projeto

A solução é responsável por **controlar e centralizar as viagens** feitas dentro da Agrocontar, oferecendo uma visão consolidada e organizada em um **relatório final para o time Administrativo**.

---

## 🚀 Funcionalidades

✅ Registro e acompanhamento das viagens realizadas.✅ Geração automática de relatórios consolidados em PDF.✅ Interface intuitiva para visualização dos dados.✅ Autenticação segura para acesso à plataforma.

---

## 👥 Público-Alvo

👔 **Time Administrativo** da Agrocontar, responsável por acompanhar, revisar e tomar decisões com base nos relatórios gerados.

---

## 🏗️ Arquitetura e Stack Tecnológica

### 📌 Stack Utilizada

- **Linguagem/Framework Principal:** Next.js (App Router)
- **Frameworks e Bibliotecas:**
  - [Puppeteer](https://pptr.dev/) – Geração de PDFs dinâmicos.
  - [Tailwind CSS](https://tailwindcss.com/) – Estilização da interface.
  - `axios`, `dotenv` e outras utilitárias.

### 🏛 Arquitetura da Solução

A aplicação é construída com **Next.js utilizando o App Router**, aproveitando renderização do lado do servidor (SSR) e geração de PDFs com Puppeteer.

---

## 💻 Como Executar o Projeto

### ✅ Requisitos

- Node.js instalado
- Git instalado

### 🔧 Passos para Execução

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/agrocontar/agrofinancas.git
   cd agrofinancas
   ```
2. **Instale as dependências:**
   ```sh
   npm install
   ```
3. **Inicie as migrations do Banco postgree:**
   ```sh
   npx prisma migrate dev
   npx prisma generate
   ```
4. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm run dev
   ```
5. **(Ubunto) Configura os headers necessários para o puppeter:**
   ```sh
      apt install -y \
      ca-certificates fonts-liberation libappindicator3-1 \
      libasound2t64 \
      libatk-bridge2.0-0t64 libatk1.0-0t64 libc6 libcairo2 \
      libcups2t64 libdbus-1-3 libexpat1 libfontconfig1 \
      libgbm1 libgcc-s1 libgdk-pixbuf2.0-0 libglib2.0-0t64 \
      libgtk-3-0t64 libnspr4 libnss3 libpango-1.0-0 \
      libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
      libxdamage1 libxext6 libxfixes3 libxrandr2 \
      xdg-utils wget
   ```
---

## 📡 Monitoramento e Logs

### 🔍 Como visualizar logs e erros?

Durante a execução do servidor, os **logs são exibidos diretamente no terminal**, permitindo acompanhar requisições, erros e ações realizadas.

### 📊 Como monitorar a solução?

Os logs são gerados dinamicamente enquanto o servidor está em execução. Para ambientes de produção, recomenda-se o uso de ferramentas de monitoramento como Sentry, LogRocket ou similares.

---

## 🔄 Atualização e Manutenção

### 🚀 Como fazer o deploy da solução?

Para gerar a build do projeto:

```sh
npm run build
```

Em seguida, o projeto pode ser hospedado em serviços como **Vercel**, **Render** ou em servidores Node.js próprios.

### 🛠️ Como gerenciar versões?

Controle de versão é feito via Git:

- Crie branches para novas funcionalidades e correções.
- Utilize tags para versões estáveis.
- Faça commits frequentes e bem documentados.

---

## 📡 API e Modelagem de Dados

### 🌐 A solução possui API?

Sim. A API utiliza o **padrão REST**, com autenticação via **HTTP Only Cookie**.

### 📑 Qual a modelagem de dados?

Atualmente, a solução **não possui modelagem formal de banco de dados**, sendo os dados estruturados conforme as necessidades dos relatórios de viagem.

---

## 📞 Contato e Suporte

Para dúvidas, sugestões ou suporte técnico, entre em contato com o time de desenvolvimento Agrofinanças.

---

📅 **Última atualização:** 13/06/2025
