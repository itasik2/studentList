let clientsArr = [{
    id: '1234567890',
    createdAt: '2021-02-03T13:07:29.554Z',
    updatedAt: '2021-02-03T13:07:29.554Z',
    name: 'Василий',
    surname: 'Пупкин',
    lastName: 'Васильевич',
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

let clientsTable = document.getElementById('clients-table');

function getFio(surname, name, lastname) {
    return surname + ' ' + name + ' ' + lastname;
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
    return btn;
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
                <button class="editBtn">Изменить</button>
                <button class="deleteBtn">Удалить</button>
            </td>
        `;

        const deleteBtn = clientTR.querySelector('.deleteBtn');
        deleteBtn.addEventListener('click', function () {
            clientsArr = clientsArr.filter(c => c.id !== client.id); // Remove client from array
            render(); // Re-render the table
        });

        clientsTable.append(clientTR);
    });
}

document.getElementById('add-client').addEventListener('submit', function (event) {
    event.preventDefault();

    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const contactsType = document.getElementById('form-select').value;
    const contactsValue = document.getElementById('form-select-input').value.trim();

    const contacts = contactsType && contactsValue ? [{
        type: contactsType,
        value: contactsValue
    }] : [];

    const clientObj = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        surname: surname,
        name: name,
        lastName: lastName,
        contacts: contacts
    };

    clientsArr.push(clientObj);
    document.getElementById('surname').value = '';
    document.getElementById('name').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('form-select').value = '';
    document.getElementById('form-select-input').value = '';

    render();
});

document.getElementById('add-btn').addEventListener('click', function () {
    document.getElementById('form-wrap').classList.remove('d-none');
});

render();