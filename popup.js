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
            document.getElementById("messageRead").className = 'visible';
            document.getElementById("error").value = response.value;
          });
        }
      });
    });
  });
}

document.getElementById("readJira").onclick = () => {
  chrome.runtime.sendMessage({method: "clear" }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getJiraInfo
      }, () => {
        if (chrome.runtime.lastError) {
          document.getElementById("error").value = "Error: " + chrome.runtime.lastError.message
        }
        else {
          chrome.runtime.sendMessage({method: "get"}, (response) => {
            document.getElementById("jiraRead").className = 'visible';
            document.getElementById("error").value = response.value;
          });
        }
      });
    });
  });
}

document.getElementById("inserirComentarios").addEventListener("click", async function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const quantidade = document.getElementById("quantidadeComentarios").value;
          if (!quantidade) {
              document.getElementById("error").innerText = "Por favor, insira um número válido de comentários";
              return;
          }
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: inserirComentarios,
            args: [quantidade]
          }, () => {
            if (chrome.runtime.lastError) {
              document.getElementById("error").value = "Error: " + chrome.runtime.lastError.message
            }
            else {
              chrome.runtime.sendMessage({method: "get"}, (response) => {
                document.getElementById("error").value = response.value;
              });
            }
          }
        );
    });
  });

document.getElementById("pesquisarPorTodosPA").addEventListener("click", async function() {
  chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: pesquisarPorTodosPA,
    }, () => {
      if (chrome.runtime.lastError) {
        document.getElementById("error").innerText = "Error: " + chrome.runtime.lastError.message;
      } else {
        window.close();
      }
    })
  })
})


document.getElementById("pesquisarPorPrimeiroPA").addEventListener("click", async function() {
  chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: pesquisarPorPrimeiroPA,
    }, () => {
      if (chrome.runtime.lastError) {
        document.getElementById("error").innerText = "Error: " + chrome.runtime.lastError.message;
      } else {
        window.close();
      }
    })
  })
})

document.getElementById("pesquisarPorUltimoPA").addEventListener("click", async function() {
  chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: pesquisarPorUltimoPA,
    }, () => {
      if (chrome.runtime.lastError) {
        document.getElementById("error").innerText = "Error: " + chrome.runtime.lastError.message;
      } else {
        window.close();
      }
    })
  })
})

document.getElementById("pastePADemanda").onclick = () => {
  chrome.runtime.sendMessage({method: "get" }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: demandalize
      }, () => {
        if (chrome.runtime.lastError) {
          document.getElementById("error").value = "Error: " + chrome?.runtime?.lastError?.message || "erro não identificado"
        }
        else {
          chrome.runtime.sendMessage({method: "get"}, (response) => {
            document.getElementById("error").innerText = "PA: " + response.value.title + " devidamente demandalizado";
          });
        }
      });
    });
  });
}

document.getElementById("pastePA").onclick = () => {
  chrome.runtime.sendMessage({method: "get" }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: jiralize
      }, () => {
        if (chrome.runtime.lastError) {
          document.getElementById("error").value = "Error: " + chrome?.runtime?.lastError?.message || "erro não identificado"
        }
        else {
          chrome.runtime.sendMessage({method: "get"}, (response) => {
            document.getElementById("error").innerText = "PA: " + response.value.title + " devidamente jiralizado";
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

  function converterMesEmString(mesNum) {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return meses[mesNum - Number(1)]
  }

  function formatarData(dataAntesDoSplit) {
    const data = dataAntesDoSplit.split(" ");
    const firstCharacterIsNumberRegex = /^\d/;
  if (data[4] == 'ano)' || data[4] == 'anos)') {
    const ddmmaaaa = data[1].split("/");
    const stringData = ddmmaaaa[0] + "/" + converterMesEmString(ddmmaaaa[1]) + "/" + ddmmaaaa[2].slice(2);
    return stringData;
  } else if (data[0] === 'Ontem,') {
    const hoje = new Date();
    const ontem = new Date(hoje.setDate(hoje.getDate() - 1))
    return ontem.getDate() + "/" + converterMesEmString(ontem.getMonth() + 1) + "/" + (""+ontem.getFullYear()).slice(2);
  } else if(data[3] == 'horas)' || data[3] == 'hora)' || data[3] == 'minutos)' || data[3] == 'minuto') {
    const hoje = new Date();
    return hoje.getDate() + "/" + converterMesEmString(hoje.getMonth() + 1) + "/" + (""+hoje.getFullYear()).slice(2);
  } else if (data[0].match(firstCharacterIsNumberRegex)) {
    const dataString = data[1] + "/" + data[3] + "/" + (""+ new Date().getFullYear()).slice(2);
    return dataString
    }
  }
  

  function extrairDescricaoDoHTML(html) {
    const patternTitulo = /<h5[^>]*>(.*?)<\/h5>/s;
    const patternProtocolo = /<span[^>]*>Protocolo:(.*?)<\/span>/s;
    const patternDestinatario = /Para:(.*?)<br[^>]*>/s;
    const patternCopia = /Cópia:(.*?)<\/p>/s;
    const patternConteudo = /<pre[^>]*>(.*?)<\/pre>/s;
    const patternAnexo = /<a[^>]*><span[^>]*>(.*?)<\/span><span[^>]*>(.*?)<\/span><\/a>/s;
    const patternData = /(\d{2}\/\d{2}\/\d{4})/s;
    const patternNomeAnexos = /(?<=class="ic de mime-img">).*?(?=<\/span>)/g
    const patternTamanhoAnexos = /(?<=class="menor tc">).*?(?=<\/span>)/g;
  
    const matchTitulo = html.match(patternTitulo);
    const matchProtocolo = html.match(patternProtocolo);
    const matchDestinatario = html.match(patternDestinatario);
    const matchCopia = html.match(patternCopia);
    const matchConteudo = html.match(patternConteudo);
    const matchAnexo = html.match(patternAnexo);
    const matchData = html.match(patternData);
    const matchNomeAnexos = html.match(patternNomeAnexos);
    const matchTamanhoAnexos = html.match(patternTamanhoAnexos);
    const descricao = {};
  
    if (matchTitulo && matchTitulo.length > 1) {
      descricao.titulo = parseHtmlToString(matchTitulo[1]);
    }
  
    if (matchProtocolo && matchProtocolo.length > 1) {
      descricao.protocolo = parseHtmlToString(matchProtocolo[1]);
    }
  
    if (matchCopia && matchCopia.length > 1) {
      descricao.copia = parseHtmlToString(matchCopia[1].trim());
    }
  
    if (matchConteudo && matchConteudo.length > 1) {
      descricao.conteudo = parseHtmlToString(matchConteudo[1]);
    }

    if (matchDestinatario && matchDestinatario.length > 1) {
      descricao.destinatario = parseHtmlToString(matchDestinatario[1].trim()).replace(descricao.conteudo, "");
    }
  
    if (matchAnexo && matchAnexo.length > 2) {
      descricao.anexo = {
        nome: parseHtmlToString(matchAnexo[1]),
        tamanho: parseHtmlToString(matchAnexo[2]),
      };
    }

    descricao.anexos = [];

    if (matchNomeAnexos && matchNomeAnexos.length > 1) {
      for (let i = 0; i < matchNomeAnexos.length; i += 1) {
        descricao.anexos.push({nomeDoArquivo: matchNomeAnexos[i]})
      }
    }

    if (matchTamanhoAnexos && matchTamanhoAnexos.length > 1) {
      for (let i = 0; i < matchTamanhoAnexos.length; i += 1) {
        descricao.anexos[i] = {...descricao.anexos[i], tamanho: matchTamanhoAnexos[i] };
      }
    }
    
    if (matchData && matchData.length > 1) {
      descricao.data = matchData[1];
    }
    
  
    return descricao;
  }


  // actual function
  const titulo = document.querySelector('strong.rel.no-mobile').innerText;
  let protocolosAtendimento = Array.from(document.querySelectorAll("span.de.direita"), (pa) => pa.innerText.split(" ")[1]);
  const characters = protocolosAtendimento.join("").length;
  if (characters > 254) protocolosAtendimento = [protocolosAtendimento[0], protocolosAtendimento[protocolosAtendimento.length - 1]];
  let data = document.querySelector('span.direita.dataMensagem').innerText;
  data = formatarData(data);
  const mensagemUltimoCliente = document.querySelectorAll('h5');
  const ultimoCliente = extrairNomeDoTexto(mensagemUltimoCliente[mensagemUltimoCliente.length - 1].innerText) || mensagemUltimoCliente[0].innerText;
  const listaDescricaos = Array.from(document.querySelectorAll('.c-list.conv-pa.fade-in'), (conteudo) => {
    htmlDescricao = conteudo.innerHTML;
    return extrairDescricaoDoHTML(htmlDescricao);
  });
  
  const result = {
    titulo, protocolosAtendimento, data, ultimoCliente, listaDescricaos
  }
  chrome.runtime.sendMessage({method: "set", value: JSON.stringify(result)}) ;
}

async function getJiraInfo() {

  const title = document.getElementById("summary-val").innerText;
  const pa = document.getElementById("customfield_10215-val").innerText;

  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  const splittedDate = document.querySelector(".dates").innerHTML.match(dateRegex)[0].split("-");
  const date = splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0]
  
  const responsavel = document.getElementById("customfield_10007-val").innerText;

  const jira = document.querySelector("a#key-val.issue-link").innerText;
  const urlJira = `http://jira.prodemge.gov.br:8080/browse/${jira}`
  const nJira = jira.split("-")[1]

  const descricao = document.querySelector("div.user-content-block").innerText;

  const result = { title, pa, date, responsavel, jira, urlJira, nJira, descricao }
  console.log("rodou get jira info", result);

  chrome.runtime.sendMessage({method: "set", value: JSON.stringify(result)}) ;
}

async function inserirComentarios(quantidade) {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);

  
  const commentArea = document.querySelector("textarea#comment");

  const quantidadeNaoLida = documento.listaDescricaos.length - quantidade;
  const listaDescricaos = documento.listaDescricaos.slice(quantidadeNaoLida);
  let descricao = "";

  if (quantidade < 1 || quantidade > listaDescricaos.length) {
    alert(`Número ${quantidade} inválido`);
    return
  }

  for (let i = 0; i < listaDescricaos.length; i += 1) {
    let stringAnexos = ``
    const anexos = listaDescricaos[i].anexos;

    for (let anexo of anexos) {
      stringAnexos += `\n${anexo.nomeDoArquivo} - ${anexo.tamanho}`;
    }

    let email = `----\n ~~~ ${quantidadeNaoLida + i + 1}° ~~~ \n----\n\n` + `Origem: ${listaDescricaos[i].titulo}\n` + `Destinatário: ${listaDescricaos[i].destinatario}\n` + `${listaDescricaos[i].copia ? `Em cópia: ${listaDescricaos[i].copia}\n` : ""}`
     + `Data: ${listaDescricaos[i].data}\n` + `Protocolo: ${listaDescricaos[i].protocolo}\n` + `\n` + listaDescricaos[i].conteudo + stringAnexos;
    

    descricao += email + "\n\n";
  }

  commentArea.value = descricao;
}

async function pesquisarPorTodosPA() {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);
  const pa = `"${documento.protocolosAtendimento.join("%2C%")}"`;
  chrome.runtime.sendMessage({method: "redirect", value: pa });
}

async function pesquisarPorPrimeiroPA() {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);
  const pa = documento.protocolosAtendimento[0];
  chrome.runtime.sendMessage({method: "redirect", value: pa });
}

async function pesquisarPorUltimoPA() {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);
  const pa = documento.protocolosAtendimento[documento.protocolosAtendimento.length - 1];
  chrome.runtime.sendMessage({method: "redirect", value: pa });
}


async function jiralize() {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);

  const resumo = document.querySelector("input#summary");
  resumo.value = documento.titulo;

  const data = document.querySelector("input#customfield_10207");
  data.value = documento.data

  const listaProtocoloAtendimento = document.querySelector("input#customfield_10215");
  listaProtocoloAtendimento.value = documento.protocolosAtendimento.join(", ");


  const listaDescricaos = documento.listaDescricaos;
  let descricao = "";

  for (let i = 0; i < listaDescricaos.length; i += 1) {
    let stringAnexos = ``
    const anexos = listaDescricaos[i].anexos;

    for (let anexo of anexos) {
      stringAnexos += `\n${anexo.nomeDoArquivo} - ${anexo.tamanho}`;
    }

    let email = `----\n ~~~ ${i + 1}° ~~~ \n----\n\n` + `Origem: ${listaDescricaos[i].titulo}\n` + `Destinatário: ${listaDescricaos[i].destinatario}\n` + `${listaDescricaos[i].copia ? `Em cópia: ${listaDescricaos[i].copia}\n` : ""}`
     + `Data: ${listaDescricaos[i].data}\n` + `Protocolo: ${listaDescricaos[i].protocolo}\n` + `\n` + listaDescricaos[i].conteudo + stringAnexos;
    

    descricao += email + "\n\n";
  }

  const descricaoJira = document.querySelector("textarea#description");
  descricaoJira.value = descricao;
}

async function demandalize() {
  const { value } = await chrome.runtime.sendMessage({method: "get"});
  documento = JSON.parse(value);
  const dialog = document.getElementById("body1").querySelector("iframe").contentWindow.document;

  console.log(dialog.getElementById("formDemandaGerente:descricaoNovaDemanda"));

  const descricaoDemanda = dialog.getElementById("formDemandaGerente:descricaoNovaDemanda");
  descricaoDemanda.value = documento.title;

  console.log(descricaoDemanda);
  
  const protocoloPADemanda = dialog.getElementById("formDemandaGerente:protocoloPANovaDemanda");
  protocoloPADemanda.value = documento.pa;

  const dataDemanda = dialog.getElementById("formDemandaGerente:dataInicioNovaDemanda_input");
  dataDemanda.value = documento.date;

  const responsavelDemanda = dialog.getElementById("formDemandaGerente:responsavelNovaDemanda");
  responsavelDemanda.value = documento.responsavel;
  

  const nJiraDemanda = dialog.getElementById("formDemandaGerente:nrJiraNovaDemanda");
  nJiraDemanda.value = documento.nJira;

  const urlJiraDemanda = dialog.getElementById("formDemandaGerente:urlJiraNovaDemanda");
  urlJiraDemanda.value = documento.urlJira;

}