const serverClientsUrl = 'http://localhost:3000/api/clients/';

// Универсальная функция для выполнения запросов на сервер
async function serverRequest(endpoint, method, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(serverClientsUrl + endpoint, options);
    return await response.json();
}

// Функция для добавления клиента
async function serverAddClient(obj) {
    return await serverRequest('', 'POST', obj);
}

// Функция для получения списка клиентов
async function serverGetClients() {
    return await serverRequest('', 'GET');
}

// Функция для удаления клиента по ID
async function serverDeleteClient(id) {
    return await serverRequest(id, 'DELETE');
}

// Функция для редактирования клиента по ID
async function serverEditClient(id, obj) {
    return await serverRequest(id, 'PATCH', obj);
}

// Инициализация массива клиентов
let clientsArr = await serverGetClients();

// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table');
const formWrap = document.getElementById('form-wrap');
const addForm = document.getElementById('add-client');
const addBtn = document.getElementById('add-btn');
const saveBtn = document.getElementById('add-client-btn');
const formTitle = document.getElementById('modal-form-title');
const addContactBtn = document.getElementById('add-contact-btn');

let initialFormState = {};

// Функция для получения ФИО клиента
function getFio(surname, name, lastname) {
    return `${surname} ${name} ${lastname}`;
}

// Функция для получения строкового представления контактов клиента
function getContacts(contacts) {
    return contacts.map(contact => `${contact.type}: ${contact.value}`).join(', ');
}

// Функция для создания элемента ввода контакта
function createContactInput(contact = {
    type: 'Телефон',
    value: ''
}) {
    const contactDiv = document.createElement('div');
    contactDiv.classList.add('contact-input');
    contactDiv.innerHTML = `
        <select>
            <option value="Телефон" ${contact.type === 'Телефон' ? 'selected' : ''}>Телефон</option>
            <option value="Доп. телефон" ${contact.type === 'Доп. телефон' ? 'selected' : ''}>Доп. телефон</option>
            <option value="Email" ${contact.type === 'Email' ? 'selected' : ''}>Email</option>
            <option value="Vk" ${contact.type === 'Vk' ? 'selected' : ''}>Vk</option>
            <option value="Facebook" ${contact.type === 'Facebook' ? 'selected' : ''}>Facebook</option>
        </select>
        <input type="text" value="${contact.value}" placeholder="Введите значение">
    `;
    return contactDiv;
}

// Функция для заполнения формы данными клиента
function fillForm(client) {
    document.getElementById('surname').value = client.surname;
    document.getElementById('name').value = client.name;
    document.getElementById('lastName').value = client.lastName || '';

    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.innerHTML = ''; // Очистка предыдущих контактов

    // Добавление существующих контактов в форму
    if (client.contacts && client.contacts.length > 0) {
        client.contacts.forEach(contact => {
            contactsContainer.appendChild(createContactInput(contact));
        });
    }

    // Сохранение начального состояния формы
    initialFormState = getFormState();
    saveBtn.disabled = true; // Деактивация кнопки сохранения
}

// Функция для получения текущего состояния формы
function getFormState() {
    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const contactInputs = document.querySelectorAll('.contact-input');
    const contacts = Array.from(contactInputs).map(input => {
        return {
            type: input.querySelector('select').value,
            value: input.querySelector('input').value.trim()
        };
    });
    return {
        surname,
        name,
        lastName,
        contacts
    };
}

// Функция для сравнения текущего состояния формы с начальным состоянием
function isFormChanged() {
    const currentFormState = getFormState();
    return JSON.stringify(currentFormState) !== JSON.stringify(initialFormState);
}

// Функция для отображения списка клиентов в таблице
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

        // Добавление обработчика события для кнопки удаления клиента
        const deleteBtn = clientTR.querySelector('.deleteBtn');
        deleteBtn.addEventListener('click', async () => {
            await serverDeleteClient(client.id);
            clientsArr = clientsArr.filter(c => c.id !== client.id);
            render();
        });

        // Добавление обработчика события для кнопки редактирования клиента
        const editBtn = clientTR.querySelector('.editBtn');
        editBtn.addEventListener('click', () => {
            fillForm(client);
            formWrap.classList.remove('d-none');
            formTitle.innerHTML = `
            Изменить данные <span class="span-id"> ID: ${client.id}</span>`
            addBtn.dataset.editId = client.id;
        });

        clientsTable.append(clientTR);
    });
}

// Добавление нового поля контакта при нажатии на кнопку "Добавить контакт"
addContactBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.appendChild(createContactInput());
    saveBtn.disabled = !isFormChanged(); // Проверка изменений формы
});

// Обработка изменения полей формы
addForm.addEventListener('input', () => {
    saveBtn.disabled = !isFormChanged(); // Проверка изменений формы
});

// Обработка отправки формы для добавления/редактирования клиента
addForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    const contactInputs = document.querySelectorAll('.contact-input');
    const contacts = Array.from(contactInputs).map(input => {
        const type = input.querySelector('select').value;
        const value = input.querySelector('input').value.trim();
        if (value) { // Только добавляем контакт, если есть значение
            return {
                type,
                value
            };
        }
    }).filter(contact => contact !== undefined); // Убираем undefined элементы

    const clientObj = {
        surname,
        name,
        lastName,
        contacts
    };

    // Если форма используется для редактирования клиента
    if (addBtn.dataset.editId) {
        const clientId = addBtn.dataset.editId;
        const clientDataObj = await serverEditClient(clientId, clientObj);
        const index = clientsArr.findIndex(c => c.id === clientId);
        clientsArr[index] = clientDataObj;
    } else {
        // Если форма используется для добавления нового клиента
        const clientDataObj = await serverAddClient(clientObj);
        clientsArr.push(clientDataObj);
    }
    render();
    formWrap.classList.add('d-none');
    event.target.reset();
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов после сохранения
});

// Открытие формы для добавления нового клиента
addBtn.addEventListener('click', () => {
    formWrap.classList.remove('d-none');
    formTitle.innerHTML = 'Новый клиент';
    addBtn.dataset.editId = '';
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов при добавлении нового клиента
    initialFormState = getFormState(); // Установка начального состояния формы
    saveBtn.disabled = true; // Деактивация кнопки сохранения
});

// Первоначальное отображение списка клиентов
render();