const serverClients = 'http://localhost:3000/api/clients';

// Добавить клиента
async function serverAddClient(obj) {
    const response = await fetch(serverClients, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });
    const data = await response.json();
    return data
};

// Получить клиента
async function serverGetClient() {
    const response = await fetch(serverClients, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    return data;
};
// удаление клиеньта
async function serverDeleteClient(id) {
    const response = await fetch(serverClients, {
        method: "DELETE",
    })
    const data = await response.json();
    return data;
};
// изменение клинта
async function serverEditClient(id) {
    const response = await fetch(serverClients, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    return data;
}

let serverDataClient = await serverGetClient();
// массив клиентов
let clientsArr = [];
// если дата база не пуста то данные прел\даются в массив
if (serverDataClient !== null) clientArr = serverDataClient;

const clientsTable = document.getElementById('clients-table'),
    clientsTableData = document.querySelectorAll('table, th')

// конкатенирует фамилию, имя и отчество
function getFio(surname, name, lastname) {
    return surname + ' ' + name + ' ' + lastname
}

function getTD(text) {
    let td = document.createElement('td');
    td.textContent = text;
    return td;
}

function getBtn(text, className) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.classList.add(className);
    return btn
}

function render() {
    clientsTable.innerHTML = ''
    let newArr = [...clientsArr];

    for (i of newArr) {
        let clientTR = document.createElement('tr'),
            idTD = getTD(i.id),
            fioTD = getTD(getFio(i.surname, i.name, i.lastname)),
            createTimeTD = getTD(i.createAT),
            updateTimeTD = getTD(i.updateAT),
            contactsTD = getTD(i.contacts),
            actionsTD = document.createElement('td'),
            editBtn = getBtn('Изменить', 'editBtn'),
            deleteBtn = getBtn('Удалить', 'deleteBtn')


        deleteBtn.addEventListener('click', async function () {
            await serverDeleteClient(i.id);
            clientTR.remove
        })

        actionsTD.append(editBtn, deleteBtn);
        clientTR.append(idTD, fioTD, createTimeTD, updateTimeTD, contactsTD);
        clientsTable.append(clientTR)
    }


}