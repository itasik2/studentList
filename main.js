const serverClientsUrl = 'http://localhost:3000/api/clients/';

async function serverAddClient(obj) {
    const response = await fetch(serverClientsUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });

    const data = await response.json();
    console.log('Добавленный клиент:', data);
    return data;
}

async function serverGetClient() {
    const response = await fetch(serverClientsUrl, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log('Полученные клиенты:', data);
    return data;
}

async function serverDeleteClient(id) {
    const response = await fetch(`${serverClientsUrl}${id}`, {
        method: "DELETE"
    });

    const data = await response.json();
    console.log('Удаленный клиент:', data);
    return data;
}

async function serverEditClient(id, obj) {
    const response = await fetch(`${serverClientsUrl}${id}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });

    const data = await response.json();
    console.log('Измененный клиент:', data);
    return data;
}

let serverDataClient = await serverGetClient();
let clientsArr = [];

if (serverDataClient) {
    clientsArr = serverDataClient;
}

let clientsTable = document.getElementById('clients-table'),
    formWrap = document.getElementById('form-wrap'),
    addForm = document.getElementById('add-client'),
    addBtn = document.getElementById('add-btn'),
    formTitle = document.getElementById('modal-form-title'),
    addContactBtn = document.getElementById('add-contact-btn')


function getFio(surname, name, lastname) {
    return `${surname} ${name} ${lastname}`;
}

function getContacts(contacts) {
    return contacts.map(contact => `${contact.type}: ${contact.value}`).join(', ');
}





function render() {
    clientsTable.innerHTML = '';
    clientsArr.forEach(client => {
        const clientTR = document.createElement('tr');
        clientTR.innerHTML = `
            <td>${client.id}</td>
            <td>${getFio(client.surname, client.name, client.lastName)}</td>
            <td>${client.createdAt}</td>
            <td>${client.updatedAt}</td>
            <td>${getContacts(client.contacts)}</td>
            <td>
                <button class="editBtn" data-id="${client.id}">Изменить</button>
                <button class="deleteBtn" data-id="${client.id}">Удалить</button>
            </td>
        `;

        const deleteBtn = clientTR.querySelector('.deleteBtn');
        deleteBtn.addEventListener('click', async function () {
            await serverDeleteClient(client.id);
            clientsArr = clientsArr.filter(c => c.id !== client.id);
            render();
        });

        const editBtn = clientTR.querySelector('.editBtn');
        editBtn.addEventListener('click', function () {
            fillForm(client);
            formWrap.classList.remove('d-none');
            addBtn.dataset.editId = client.id;
        });

        clientsTable.append(clientTR);
    });
}

function fillForm(client) {
    document.getElementById('surname').value = client.surname;
    document.getElementById('name').value = client.name;
    document.getElementById('lastName').value = client.lastName || '';
    if (client.contacts && client.contacts.length > 0) {
        document.getElementById('form-select').value = client.contacts[0].type;
        document.getElementById('form-select-input').value = client.contacts[0].value;
    }
}


addContactBtn.addEventListener('click', function (event) {
    event.preventDefault();
    let count = +1;
});

addForm.addEventListener('submit', async function (event) {
    event.preventDefault();




    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    const contactsType = document.getElementById('form-select').value;
    const contactsValue = document.getElementById('form-select-input').value.trim();

    const contacts = [{
        type: contactsType,
        value: contactsValue
    }];


    const clientObj = {
        surname,
        name,
        lastName,
        contacts
    };





    if (addBtn.dataset.editId) {
        const clientId = addBtn.dataset.editId;
        const clientDataObj = await serverEditClient(clientId, clientObj);
        const index = clientsArr.findIndex(c => c.id === clientId);
        clientsArr[index] = clientDataObj;
        // addBtn.textContent = "Добавить";
        // delete addBtn.dataset.editId;
    } else {
        const clientDataObj = await serverAddClient(clientObj);
        clientsArr.push(clientDataObj);
    }
    render();
    formWrap.classList.add('d-none');

    event.target.reset();
});

addBtn.addEventListener('click', function () {
    formWrap.classList.remove('d-none');
    formTitle.textContent = 'Новый клиент'
});

render();
console.log(clientsArr);