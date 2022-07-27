// déclarations de variables
const socket = io();
let monSocketClients = [];
let mesMessages = [];
let monId, pseudo; 
const clients = document.getElementById("clients");
// déclarations de fonctions
function displayClients(monSocketClients){
    let clientsTmp = ""; 
    monSocketClients.forEach(element => {
        clientsTmp += element.pseudo+"<br>";
    });
    clients.innerHTML = clientsTmp;
}

tinymce.init({
    selector: '#mytextarea',
    plugins: [
      'a11ychecker','advlist','advcode','advtable','autolink','checklist','export',
      'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
      'powerpaste','fullscreen','formatpainter','insertdatetime','media','table','help','wordcount', 'emoticons'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
  });

document.getElementById("sendMessage").addEventListener("click",()=>{
    let monMessage = tinyMCE.get('mytextarea').getContent();
    let date = new Date();
    // je possède déjà monId et pseudo
    mesMessages.push({
        id: monId,
        pseudo: pseudo,
        message: monMessage,
        date: date
    })
    console.dir(mesMessages);
})

socket.on("init", (init) => {
    console.log(init.message);
    // console.log(init.id);
    monId = init.id;
    monSocketClients = init.socketClients;
    pseudo = prompt("Veuillez vous identifier");
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
    socket.emit('initResponse',{
        socketClients:monSocketClients
    })
    // displayClients
    displayClients(monSocketClients);
})
socket.on('newClient',(newClient)=>{
    monSocketClients = newClient.socketClients;
    // displayClients
    displayClients(monSocketClients);
})

socket.on('clientDisconnect',(clientDisconnect)=>{
    monSocketClients = clientDisconnect.socketClients;
    console.dir(monSocketClients);
    // displayClients
    displayClients(monSocketClients);
})