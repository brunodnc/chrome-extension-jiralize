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
    const title = document.querySelector('strong, .rel');
    const protocoloPA = document.querySelector('span, .de, .direita');
    const data = document.querySelector('span, .direita, .dataMensagem');
    const ultimoCliente = document.querySelectorAll('h5')[document.querySelectorAll('h5').length - 1];
    const result = {
      title, protocoloPA, data, ultimoCliente
    }

    console.log(result);

    chrome.runtime.sendMessage({method: "set", value: JSON.stringify(result)}) ;
}

const getTitle = () => {
  console.log("gt: ", document.title);
  return document.title;
  
}

chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
  console.log("executescript");
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id},
    func: getTitle
  }, (result) => {
    console.log("result: ", result);
    document.getElementById("title").innerText = result[0].result;
  });
});