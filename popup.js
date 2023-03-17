document.getElementById("readPA").onclick = () => {
  chrome.runtime.sendMessage({method: "clear" }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getDocumentInfo
      }, () => {
        if (chrome.runtime.lastError) {
          document.getElementById("error").value = "Error: " + chrome.runtime.lastError.message
        }
        else {
          chrome.runtime.sendMessage({method: "get"}, (response) => {
            document.getElementById("error").value = response.value;
          });
        }
      });
    });
  });
}

function getDocumentInfo() {

  // helper
  function extrairNomeDoTexto(message) {
    const pattern = /enviado por\s+(.*?)\)/;
    const match = message.match(pattern);
    if (match && match.length > 1) {
      return match[1];
    } else {
      return null;
    }
  }

  function parseHtmlToString(html) {
    const domParser = new DOMParser();
    const dom = domParser.parseFromString(html, 'text/html');
    const textString = dom.body.innerText;
    return textString.replace(/\n/g, " ");
  }
  

  function extrairDescricaoDoHTML(html) {
    const patternTitulo = /<h5[^>]*>(.*?)<\/h5>/s;
    const patternProtocolo = /<span[^>]*>Protocolo:(.*?)<\/span>/s;
    const patternDestinatario = /Para:(.*?)<br[^>]*>/s;
    const patternCopia = /Cópia:(.*?)<\/p>/s;
    const patternConteudo = /<pre[^>]*>(.*?)<\/pre>/s;
    const patternAnexo = /<a[^>]*><span[^>]*>(.*?)<\/span><span[^>]*>(.*?)<\/span><\/a>/s;
  
    const matchTitulo = html.match(patternTitulo);
    const matchProtocolo = html.match(patternProtocolo);
    const matchDestinatario = html.match(patternDestinatario);
    const matchCopia = html.match(patternCopia);
    const matchConteudo = html.match(patternConteudo);
    const matchAnexo = html.match(patternAnexo);
  
    const descricao = {};
  
    if (matchTitulo && matchTitulo.length > 1) {
      descricao.titulo = parseHtmlToString(matchTitulo[1]);
    }
  
    if (matchProtocolo && matchProtocolo.length > 1) {
      descricao.protocolo = parseHtmlToString(matchProtocolo[1]);
    }
  
    if (matchDestinatario && matchDestinatario.length > 1) {
      descricao.destinatario = parseHtmlToString(matchDestinatario[1].trim());
    }
  
    if (matchCopia && matchCopia.length > 1) {
      descricao.copia = parseHtmlToString(matchCopia[1].trim());
    }
  
    if (matchConteudo && matchConteudo.length > 1) {
      descricao.conteudo = parseHtmlToString(matchConteudo[1]);
    }
  
    if (matchAnexo && matchAnexo.length > 2) {
      descricao.anexo = {
        nome: parseHtmlToString(matchAnexo[1]),
        tamanho: parseHtmlToString(matchAnexo[2]),
      };
    }
  
    return descricao;
  }


  // actual function
  const title = document.querySelector('strong.rel.no-mobile').innerText;
  const protocoloPA = document.querySelector("span.de.direita").innerText.split(" ")[1];
  let data = document.querySelector('span.direita.dataMensagem').innerText;
  if (!data.includes(",")) {
    data = new Date().toLocaleDateString();
  } else {
    data = data.split(" ")[1];
  }
  const mensagemUltimoCliente = document.querySelectorAll('h5');
  const ultimoCliente = extrairNomeDoTexto(mensagemUltimoCliente[mensagemUltimoCliente.length - 1].innerText) || mensagemUltimoCliente[0].innerText;
  const htmlDescricao = document.querySelector('.c-list.conv-pa.fade-in').innerHTML;
  const descricao = extrairDescricaoDoHTML(htmlDescricao);
  const htmlString = parseHtmlToString(htmlDescricao);
  const result = {
    title, protocoloPA, data, ultimoCliente, descricao, htmlString
  }

  console.log(result);

  chrome.runtime.sendMessage({method: "set", value: JSON.stringify(result)}) ;
}

const getTitle = () => {
  // console.log("gt: ", document.title);
  return document.title;
  
}

chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id},
    func: getTitle
  }, (result) => {
    document.getElementById("title").innerText = result[0].result;
  });
});