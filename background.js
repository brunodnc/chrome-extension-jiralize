let value = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.method);
    switch (message.method) {
        case "set":
            value = message.value;
            sendResponse({value: null})
            break
        case "get":
            sendAfterSet()
            break
        case "clear":
            value = ""
            sendResponse({value: null})
            break
        }
        return true

        async function sendAfterSet() {
            for (let i = 0; i < 10; i += 1) {
                if (value != null) {
                    sendResponse({ value })
                    return
                }
                console.log("sleep 1 sec");
                await new Promise(s => setTimeout(s, 1000));
                console.log("end sleep");
            }
            value = "Error: Document is not Jiralizeable"
        }
    });