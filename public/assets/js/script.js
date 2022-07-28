// déclarations de variables
const socket = io();
let monSocketClients = [];
let mesMessages = [];
let monId;
const clients = document.getElementById("clients");
const conversation = document.getElementById("conversation");
const private = document.getElementById("private"); // modale
const sendPrivate = document.getElementById("sendPrivate"); // bouton envoi private
const responsePrivate = document.getElementById("responsePrivate");
const closePrivate = document.getElementById("closePrivate");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pseudo = urlParams.get('pseudo');

// déclarations de fonctions
function displayClients(monSocketClients) {
    let clientsTmp = "";
    monSocketClients.forEach(element => {
        if (monId !== element.id) {
            clientsTmp += `<div onclick="privateMessage('${element.id}');">${element.pseudo}</div>`;
        }
    });
    clients.innerHTML = clientsTmp;
}

function privateMessage(idContact) {
    // j'ouvre une modale qui contient un textarea tinymce et un bouton "Envoi privé"
    private.classList.remove('d-none');
    // console.log(idContact)
    tinymce.init({
        selector: '#myprivate',
        plugins: [
            'advlist', 'autolink',
            'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
            'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
        ],
        toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
    });
    function fuckinFunction() {
        let monMessage = tinyMCE.get('myprivate').getContent();
        let date = new Date();
        // idContact, monId, pseudo
        socket.emit("newPrivateMessage", {
            message: monMessage,
            date: date,
            idContact: idContact,
            id: monId,
            pseudo: pseudo
        })
        private.classList.add('d-none');
        // vider le textarea
        tinyMCE.get('myprivate').setContent('');
        // je retire l'event click de mon bouton
        sendPrivate.removeEventListener("click", fuckinFunction);
    }
    sendPrivate.addEventListener("click", fuckinFunction)
    closePrivate.addEventListener("click", () => {
        private.classList.add('d-none');
        tinyMCE.get('myprivate').setContent('');
    })
    
}

function displayMessage(mesMessages) {
    console.log(mesMessages);
    let messagesTmp = "";
    mesMessages.forEach(element => {
        messagesTmp += element.pseudo + "<br>" +
            element.message + "<br>" +
            element.date + "<br>";
    });
    conversation.innerHTML = messagesTmp;
}

tinymce.init({
    selector: '#mytextarea',
    plugins: [
        'advlist', 'autolink',
        'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
        'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});

document.getElementById("sendMessage").addEventListener("click", () => {
    let monMessage = tinyMCE.get('mytextarea').getContent();
    let date = new Date();
    // je possède déjà monId et pseudo
    mesMessages.push({
        id: monId,
        pseudo: pseudo,
        message: monMessage,
        date: date
    })
    // console.dir(mesMessages);
    socket.emit("newMessage", { messages: mesMessages })
    displayMessage(mesMessages);
    tinyMCE.get('myprivate').setContent('');
})

socket.on("init", (init) => {
    console.log(init.message);
    // console.log(init.id);
    monId = init.id;
    monSocketClients = init.socketClients;
    mesMessages = init.messages;
    // j'ajoute mon pseudo au tableau des clients
    for (
        let i = 0;
        i < monSocketClients.length;
        i++) {
        if (monSocketClients[i].id === monId) {
            monSocketClients[i].pseudo = pseudo
        }
    }
    // console.dir(monSocketClients);
    // je dois maintenant renvoyer au serveur le tableau de clients modifié
    socket.emit('initResponse', {
        socketClients: monSocketClients
    })
    // displayClients
    displayClients(monSocketClients);
    displayMessage(mesMessages);
})
socket.on('newClient', (newClient) => {
    monSocketClients = newClient.socketClients;
    // displayClients
    displayClients(monSocketClients);
})

socket.on('newMessageResponse', (newMessageResponse) => {
    console.dir(newMessageResponse)
    mesMessages = newMessageResponse.messages;
    // displayMessage
    displayMessage(mesMessages);
})

socket.on('newPrivateMessageResponse', (newPrivateMessageResponse) => {
    // boucle for of
    for (const [key, value] of Object.entries(newPrivateMessageResponse)) {
        let pseudo = value.pseudo;
        let message = value.message;
        let date = value.date;
        let responseCard = document.createElement('div');
        responseCard.innerHTML = pseudo + "<br>" + message + "<br>" + date;
        responsePrivate.append(responseCard);
    }
    responsePrivate.classList.remove('d-none');
})

socket.on('clientDisconnect', (clientDisconnect) => {
    monSocketClients = clientDisconnect.socketClients;
    console.dir(monSocketClients);
    // displayClients
    displayClients(monSocketClients);
})