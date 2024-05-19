const serverClientsUrl = 'http://localhost:3000/api/clients/';

// Добавить клиента
async function serverAddClient(obj) {
    const response = await fetch(serverClientsUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });
    let data = await response.json();
    return data
};

// Получить клиента
async function serverGetClient() {
    const response = await fetch(serverClientsUrl, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    });
    let data = await response.json();
    return data;
};
// удаление клиента
async function serverDeleteClient(id) {
    const response = await fetch(serverClientsUrl + id, {
        method: "DELETE",
    })
    let data = await response.json();
    return data;
};
// изменение клиента
async function serverEditClient(id) {
    const response = await fetch(serverClientsUrl + 'client' + id, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    });
    let data = await response.json();
    return data;
}

let serverDataClient = await serverGetClient();
// массив клиентов
let clientsArr = [{
    // ID клиента, заполняется сервером автоматически, после создания нельзя изменить
    id: '1234567890',
    // дата и время создания клиента, заполняется сервером автоматически, после создания нельзя изменить
    createdAt: '2021-02-03T13:07:29.554Z',
    // дата и время изменения клиента, заполняется сервером автоматически при изменении клиента
    updatedAt: '2021-02-03T13:07:29.554Z',
    // * обязательное поле, имя клиента
    name: 'Василий',
    // * обязательное поле, фамилия клиента
    surname: 'Пупкин',
    // необязательное поле, отчество клиента
    lastName: 'Васильевич',
    // контакты - необязательное поле, массив контактов
    // каждый объект в массиве (если он передан) должен содержать непустые свойства type и value
    contacts: [{
            type: 'Телефон',
            value: '+71234567890'
        },
        {
            type: 'Email',
            value: 'abc@xyz.com'
        },
        {
            type: 'Facebook',
            value: 'https://facebook.com/vasiliy-pupkin-the-best'
        }
    ]
}];
// если дата база не пуста то данные прел\даются в массив
if (!serverDataClient) {
    clientsArr = serverDataClient
};

let clientsTable = document.getElementById('clients-table')

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

// function render() {
//     clientsTable.innerHTML = ''
//     let newArr = [...clientsArr];

//     for (let i of newArr) {
//         let clientTR = document.createElement('tr'),
//             idTD = getTD(i.id),
//             fioTD = getTD(getFio(i.surname, i.name, i.lastname)),
//             createTimeTD = getTD(i.createAT),
//             updateTimeTD = getTD(i.updateAT),
//             contactsTD = getTD(i.contacts),
//             actionsTD = document.createElement('td'),
//             editBtn = getBtn('Изменить', 'editBtn'),
//             deleteBtn = getBtn('Удалить', 'deleteBtn')


//         deleteBtn.addEventListener('click', async function () {
//             await serverDeleteClient(i.id);
//             clientTR.remove
//         })

//         actionsTD.append(editBtn, deleteBtn);
//         clientTR.append(idTD, fioTD, createTimeTD, updateTimeTD, contactsTD, actionsTD);
//         clientsTable.append(clientTR)
//     }
// }

function getContacts(contacts) {
    return contacts.map(contact => `${contact.type}: ${contact.value}`).join(', ');
}

function render() {
    clientsTable.innerHTML = '';
    let newArr = [...clientsArr]
    newArr.forEach(client => {
        const clientTR = document.createElement('tr');
        clientTR.innerHTML = `
            <td>${client.id}</td>
            <td>${getFio(client.surname, client.name, client.lastName)}</td>
            <td>${client.createdAt}</td>
            <td>${client.updatedAt}</td>
            <td>${getContacts(client.contacts)}</td>
            <td>
                <button class="editBtn">Изменить</button>
                <button class="deleteBtn">Удалить</button>
            </td>
        `;

        const deleteBtn = clientTR.querySelector('.deleteBtn');
        deleteBtn.addEventListener('click', async function () {
            await serverDeleteClient(client.id)
            clientTR.remove;
            clientsTable.innerHTML = '';
        });


        clientsTable.append(clientTR);

    });

}

document.getElementById('add-client').addEventListener('submit', async function (event) {
    event.preventDefault();


    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const lastname = document.getElementById('lastName').value.trim();
    const contactsType = document.getElementById('form-select').value;
    const ContactsVlue = document.getElementById('form-select-input').value
    const contacts = [{
        contactsType,
        ContactsVlue
    }];

    let clientObj = {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        surname: surname,
        name: name,
        lastname: lastname,
        contacts: contacts
    }

    let clientDataObj = await serverAddClient(clientObj);


    clientsArr.push(clientDataObj);

    //очищает форму перед отрисовкой
    event.target.innerHTML = '';
    render()

})
render()
console.log(clientsArr);