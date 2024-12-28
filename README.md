# Exportação de Produtos - Portal Rede Âncora

Este script realiza a exportação de todos os produtos disponíveis no portal Rede Âncora. Ele utiliza o login e senha configurados no arquivo `.env` e armazena informações de autenticação em uma tabela MySQL simples.

---

## **Requisitos**

### **1. Dependências**

- **Node.js** e **npm** instalados.
- Banco de dados **MySQL** configurado.
- Credenciais de login para o portal Rede Âncora.

### **2. Configuração do `.env`**

Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente:

```
ANCORA_LOGIN=seu_login
ANCORA_PASS=sua_senha
```

### **3. Configuração do Banco de Dados**

Execute a seguinte consulta SQL para criar a tabela necessária no MySQL:

```sql
CREATE TABLE auth_ancora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cookie1 TEXT NOT NULL,
    cookie2 TEXT NOT NULL,
    cookie3 TEXT NOT NULL,
    valid_date DATETIME NOT NULL
);
```

---

## **Como Funciona**

### **1. Autenticação**
O script autentica o usuário no portal Rede Âncora, gerando cookies de sessão necessários para realizar as requisições subsequentes. Os cookies são armazenados no banco de dados e reutilizados até expirar o prazo de validade.

### **2. Busca de Produtos**
O script utiliza a API do portal para buscar produtos baseados nas marcas disponíveis. Ele itera sobre todas as marcas e páginas, consolidando as informações de produtos.

### **3. Exportação para Excel**
Os dados coletados são exportados para arquivos `.xlsx`, divididos em partes conforme a quantidade de marcas processadas.

---

## **Execução**

### **1. Instalar Dependências**
No diretório do projeto, execute:

```bash
npm install dotenv node-fetch exceljs
```

### **2. Executar o Script**
Para iniciar a exportação, execute:

```bash
node index.js
```

O script irá gerar arquivos Excel na raiz do projeto, com os produtos organizados por marca.

---

## **Estrutura do Excel**
Cada arquivo Excel conterá as seguintes colunas:

| Coluna            | Descrição                           |
|-------------------|-------------------------------------|
| catalogo_id       | ID do catálogo                     |
| cna               | Código CNA                         |
| codigoReferencia  | Código de referência               |
| marca             | Marca do produto                   |
| nomeProduto       | Nome do produto                    |
| gtin              | Código GTIN                        |
| ncm               | Código NCM                         |
| ativo             | Status de atividade                |
| peso_liquido      | Peso líquido do produto            |
| peso_bruto        | Peso bruto do produto              |
| medida_venda      | Unidade de medida de venda         |
| origem_label      | Origem do produto                  |
| cest              | Código CEST                        |
| preco_vigente     | Preço vigente                      |
| qtd_disponivel    | Quantidade disponível              |
| qtd_projetada     | Quantidade projetada               |
| giro30            | Giro em 30 dias                   |
| giro60            | Giro em 60 dias                   |
| giro90            | Giro em 90 dias                   |
| descontinuado     | Status de descontinuação           |
| bloqueado         | Status de bloqueio                 |
| qtd_pedidos       | Quantidade de pedidos              |
| qtd_pedidos_faturando | Pedidos faturando            |
| qtd_pendencias    | Quantidade de pendências           |
| imagemReal        | URL da imagem real do produto      |

---

## **Melhorias Futuras**

1. **Controle de Erros**:
   - Implementar estratégias mais robustas para lidar com falhas nas requisições.

2. **Configuração Dinâmica**:
   - Permitir configurações dinâmicas para o número de marcas ou páginas processadas por execução.

3. **Interface de Usuário**:
   - Criar uma interface simples para facilitar a interação com o script.

---

Em caso de dúvidas ou problemas, entre em contato com o responsável pelo desenvolvimento do script.
