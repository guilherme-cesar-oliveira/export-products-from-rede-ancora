import dotenv from 'dotenv';
import {inserirDados} from '../src/sql.mjs'
import fetch from 'node-fetch';
import ExcelJS from 'exceljs';


dotenv.config();

const ANCORA_LOGIN = process.env.ANCORA_LOGIN
const ANCORA_PASS = process.env.ANCORA_PASS

const jsonData = {
    login: ANCORA_LOGIN,
    senha: ANCORA_PASS
  };

async function buscartoken() {
    const query = `SELECT * FROM auth_ancora ORDER BY valid_date DESC`;
      
    try {
        const results = await inserirDados(query);
        return results;
    } catch (error) {
        console.error('Erro ao inserir/atualizar dados:', error);
        throw error;
    }
  }


async function fazerlogin(cok,jsonData) {


const url = 'https://app.redeancora.com.br/portal/api/usuario/login';

const requestOptions2 = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // Adicione outros headers conforme necessário
    },
    body: JSON.stringify(jsonData)
  };



// Faz a requisição usando fetch
return fetch(url, requestOptions2)
  .then(response => {
    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    // Obtém os cookies da resposta
    const cookies = response.headers.get('Set-Cookie');
    const firstCookie = cookies.split(';');

    let jsessionId;
    for (const cookie of firstCookie) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'JSESSIONID') {
        jsessionId = value;
        break;
      }
    }
    // Retorna a resposta em formato JSON
    return 'JSESSIONID=' +  jsessionId
  })
  .then(data => {
    // Faça algo com os dados recebidos na resposta
    cok.push(data)
    return data
  })
  .catch(error => {
    console.error('Erro:', error);
  });


}

async function redirect(cok) {


    const url = 'https://app.redeancora.com.br/portal/api/usuario/redirect/4';
    
    const requestOptions2 = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cok[0]
          // Adicione outros headers conforme necessário
        },
      };
    
    
    
    // Faz a requisição usando fetch
    return fetch(url, requestOptions2)
      .then(response => {
        // Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
    
        // Obtém os cookies da resposta
        const cookies = response.headers.get('Set-Cookie');
        const firstCookie = cookies.split(';')


    let jsessionId;
    for (const cookie of firstCookie) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'JSESSIONID') {
        jsessionId = value;
        break;
      }
    }

    
        // Retorna a resposta em formato JSON
        return 'JSESSIONID=' +  jsessionId
      })
      .then(data => {
        // Faça algo com os dados recebidos na resposta
        const jsessionIdIndex = cok.findIndex(item => item.startsWith('JSESSIONID='));

        if (jsessionIdIndex !== -1) {
          // Se existir, substitui o valor na posição encontrada
          cok[jsessionIdIndex] = data;
        } else {
          // Se não existir, adiciona um novo item ao array
          cok.push(data);
        }
        return data
      })
      .catch(error => {
        console.error('Erro:', error);
      });
    
    
}

async function profile(xsrf,cok) {

  let portalB2BSessionValue

    const cookiesString = cok.join(';');

    const url = 'https://app.redeancora.com.br/b2b/api/api/v1/profile';
  
    const requestOptions2 = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookiesString
          // Adicione outros headers conforme necessário
        },
      };
    
    
    
    // Faz a requisição usando fetch
    return fetch(url, requestOptions2)
      .then(response => {
        // Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
    
        // Obtém os cookies da resposta
        const cookies = response.headers.get('Set-Cookie');
        const regex = /portal_b2b_session=([^;]+)/;
        let match = cookies.match(regex);
         portalB2BSessionValue = match[1];


        const firstCookie = cookies.split(';');

 
    let jsessionId2;
    for (const cookie of firstCookie) {
      let [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        xsrf = value.replace(/%3D$/, '=')
        jsessionId2 = 'XSRF-TOKEN=' + value;
        break;
      }
    }

    let bb = {a:'portal_b2b_session='+ portalB2BSessionValue, b:jsessionId2}


        // Retorna a resposta em formato JSON
        return bb
    })
      .then(data => {
        cok.push(data.a)
        cok.push(data.b)

        // Faça algo com os dados recebidos na resposta
        return data
      })
      .catch(error => {
        console.error('Erro:', error);
      });
    
    
}


async function autenticar(jsonData){

  let cok = []
  let xsrf


  let bbb = await buscartoken()
  if(bbb.length > 0){
  const ultimaData = bbb[0].valid_date;

  const dataAtual = new Date();
  if (ultimaData < dataAtual) {
    console.log('Gerou tokens')

    await fazerlogin(cok,jsonData)
    await redirect(cok)
    await profile(xsrf,cok)
    inserirDados(`INSERT INTO auth_ancora (cookie1, cookie2, cookie3) VALUES ('${cok[0]}','${cok[1]}','${cok[2]}')`)

    let aaa = cok[2]

    const regex = /XSRF-TOKEN=([^;]+)/;
        let match = aaa.match(regex);
        xsrf = match[1];
        xsrf = xsrf.replace(/%3D$/, '=')

  }else{

    cok.push(bbb[0].cookie1)
    cok.push(bbb[0].cookie2)
    cok.push(bbb[0].cookie3)

    let aaa = bbb[0].cookie3

    const regex = /XSRF-TOKEN=([^;]+)/;
        let match = aaa.match(regex);
        xsrf = match[1];
        xsrf = xsrf.replace(/%3D$/, '=')

  }

}else{
    console.log('Não achou nada e gerou')

    await fazerlogin(cok,jsonData)
    await redirect(cok)
    await profile(xsrf,cok)
    inserirDados(`INSERT INTO auth_ancora (cookie1, cookie2, cookie3) VALUES ('${cok[0]}','${cok[1]}','${cok[2]}')`)

    console.log(cok)
    let aaa = cok[2]

    const regex = /XSRF-TOKEN=([^;]+)/;
        let match = aaa.match(regex);
        xsrf = match[1];
        xsrf = xsrf.replace(/%3D$/, '=')


}

return {cok:cok,xsrf:xsrf }

}


async function searchMultiple(eans) {
 let cok =  await autenticar(jsonData)
  let xsrf = cok.xsrf
  const cookiesString = cok.cok.join(';');


  const requests = eans.map(eanValue => {
    const queryString = `produtoFiltro=${encodeURIComponent(JSON.stringify({ ean: eanValue }))}`;
    const apiUrl = `https://app.redeancora.com.br/b2b/api/api/v1/search?pagina=1&itensPorPagina=25&estado=15&empresa=9&` + queryString;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
        'Origin': 'https://app.redeancora.com.br',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'X-XSRF-TOKEN': xsrf,
        'Accept': 'application/json, text/plain, */*',
        'Cookie': cookiesString
      },
    };


    return fetch(apiUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        data = data.pageResult.data;

        if (data.length > 0) {
          const foundItem = data.find(item => item.details.gtin == eanValue);

          if (foundItem) {
            return {
              Nome: foundItem.nomeProduto,
              Modelo: foundItem.codigoReferencia,
              Marca: foundItem.marca,
              Ean: foundItem.details.gtin,
              Ncm: foundItem.details.ncm,
              Cest: foundItem.details.cest,
              Peso: foundItem.details.peso_bruto,
              Qtd_Min: foundItem.details.qty_min,
              Preco: foundItem.prices.preco_normal_valido,
              Estoque: foundItem.stocks.qtd_disponivel,
            };
          } else {
            return { mensagem: `Produto com EAN ${eanValue} não encontrado` };
          }
        } else {
          return { mensagem: `Produto com EAN ${eanValue} não encontrado` };
        }
      })
      .catch(error => {
        console.error(`Erro na requisição para EAN ${eanValue}:`, error);
        return { mensagem: `Erro na requisição para EAN ${eanValue}` };
      });
  });

  return Promise.all(requests);
}

async function getBrands(){

  let cok =  await autenticar(jsonData)
  let xsrf = cok.xsrf
  const cookiesString = cok.cok.join(';');

  const requestOptions = {
    method: 'GET',
    headers: {
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
      'Origin': 'https://app.redeancora.com.br',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
      'X-XSRF-TOKEN': xsrf,
      'Accept': 'application/json, text/plain, */*',
      'Cookie': cookiesString
    },
  };

  return fetch('https://app.redeancora.com.br/b2b/api/api/v1/search/brands?value_type=catalog_name', requestOptions)
      .then(response => response.json())
      .then(data => {return data})
}

async function SearchForBrands(marca) {
  let cok = await autenticar(jsonData);
  let xsrf = cok.xsrf;
  const cookiesString = cok.cok.join(';');

  // Função para fazer uma solicitação para uma página específica
  async function fetchPage(pageNumber) {
    const response = await fetch('https://app.redeancora.com.br/b2b/api/api/v1/search?filters[]=em_estoque', {
      method: 'POST',
      headers: {
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
        'Origin': 'https://app.redeancora.com.br',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'X-XSRF-TOKEN': xsrf,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Cookie': cookiesString
      },
      body: JSON.stringify({
        pagina: pageNumber, // Página atual
        itensPorPagina: 100,
        estado: 15,
        empresa: 9,
        produtoFiltro: {
          nomeFabricante: marca
        },
        show_without_cna: false,
        exact_results: true
      })
    });
    const data = await response.json();
    return data;
  }

  // Array para armazenar todos os dados
  let allData = [];

  // Obter o número total de páginas na primeira chamada
  const firstResponse = await fetchPage(1);
  const totalPages = firstResponse.pageResult.last_page;
  console.log(totalPages)
  console.log(marca)
  if(firstResponse.pageResult?.data && firstResponse.pageResult.data.length > 0){
    const results = firstResponse.pageResult.data
    results.forEach(obj=>{allData.push(obj)})
  }


  if(totalPages > 1){
  // Iterar sobre todas as páginas e buscar os dados
  for (let i = 2; i <= totalPages; i++) {
    let promises = []
    promises.push(fetchPage(i))

    const all = await Promise.all(promises)

    all.forEach(obj=>{
      if(obj.pageResult?.data && obj.pageResult.data.length > 0){
      allData.push(...obj.pageResult.data)
    }
    })
    
  }
  }
  return allData; // Retorna todos os dados
}

async function exportToExcel(dataArray, filePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Definindo cabeçalhos da planilha
  worksheet.columns = [
      { header: 'catalogo_id', key: 'catalogo_id' },
      { header: 'cna', key: 'cna' },
      { header: 'codigoReferencia', key: 'codigoReferencia' },
      { header: 'marca', key: 'marca' },
      { header: 'nomeProduto', key: 'nomeProduto' },
      { header: 'gtin', key: 'gtin' },
      { header: 'ncm', key: 'ncm' },
      { header: 'ativo', key: 'ativo' },
      { header: 'peso_liquido', key: 'peso_liquido' },
      { header: 'peso_bruto', key: 'peso_bruto' },
      { header: 'medida_venda', key: 'medida_venda' },
      { header: 'origem_label', key: 'origem_label' },
      { header: 'cest', key: 'cest' },
      { header: 'preco_vigente', key: 'preco_vigente' },
      { header: 'qtd_disponivel', key: 'qtd_disponivel' },
      { header: 'qtd_projetada', key: 'qtd_projetada' },
      { header: 'giro30', key: 'giro30' },
      { header: 'giro60', key: 'giro60' },
      { header: 'giro90', key: 'giro90' },
      { header: 'descontinuado', key: 'descontinuado' },
      { header: 'bloqueado', key: 'bloqueado' },
      { header: 'qtd_pedidos', key: 'qtd_pedidos' },
      { header: 'qtd_pedidos_faturando', key: 'qtd_pedidos_faturando' },
      { header: 'qtd_pendencias', key: 'qtd_pendencias' },
      { header: 'imagemReal', key: 'imagemReal' }
  ];

  // Preenchendo os dados na planilha
  dataArray.forEach(obj => {
      worksheet.addRow({
          catalogo_id: obj.catalogo_id,
          cna: obj.cna,
          codigoReferencia: obj.codigoReferencia,
          marca: obj.marca,
          nomeProduto: obj.nomeProduto,
          gtin: obj.details.gtin,
          ncm: obj.details.ncm,
          ativo: obj.details.ativo,
          peso_liquido: obj.details.peso_liquido,
          peso_bruto: obj.details.peso_bruto,
          medida_venda: obj.details.medida_venda,
          origem_label: obj.details.origem_label,
          cest: obj.details.cest,
          preco_vigente: obj.prices && obj.prices.preco_vigente ? obj.prices.preco_vigente : "Erro",
          qtd_disponivel: obj.stocks.qtd_disponivel,
          qtd_projetada: obj.stocks.qtd_projetada,
          giro30: obj.stocks.giro30,
          giro60: obj.stocks.giro60,
          giro90: obj.stocks.giro90,
          descontinuado: obj.descontinuado,
          bloqueado: obj.bloqueado,
          qtd_pedidos: obj.qtd_pedidos,
          qtd_pedidos_faturando: obj.qtd_pedidos_faturando,
          qtd_pendencias: obj.qtd_pendencias,
          imagemReal: obj.imagemReal
      });
  });

  // Salvar o arquivo
  await workbook.xlsx.writeFile(filePath);
  console.log('Planilha exportada com sucesso!');
}

await autenticar(jsonData)

async function sleep(ms) {
  console.log('Intervalo de 2 minutos')
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para dividir um array em grupos menores
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function main() {
  let produtos = [];
  const brandsData = await getBrands();
  const brands = brandsData.data;

  // Dividir as marcas em grupos de 1
  const brandGroups = chunkArray(brands, 100);

  // Iterar sobre cada grupo de marcas
  for (let i = 9; i < brandGroups.length; i++) {
    const currentBrandGroup = brandGroups[i];
    const promises = [];

    // Executar as solicitações para cada marca no grupo atual
    for (let j = 0; j < currentBrandGroup.length; j++) {
      const marca = currentBrandGroup[j].value;
      promises.push(SearchForBrands(marca));
    }

    // Esperar todas as solicitações do grupo atual serem concluídas antes de prosseguir
    const results = await Promise.all(promises);

    // Concatenar os resultados do grupo atual com o array principal de produtos
    results.forEach((promise)=>{ 
      produtos.push(...promise.flat()) 
    })

    exportToExcel(produtos, `Produtos Rede Ancora - Parte ${i + 1}.xlsx`);
    console.log(`Grupo ${i + 1} de ${brandGroups.length} concluído. Total de ${produtos.length} produtos.`);
    //await sleep(120000)
  }

  console.log("Todas as solicitações foram concluídas.");
  console.log("Total de produtos:", produtos.length);

}

main();
