// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table'),
    formWrap = document.getElementById('form-wrap'),
    addClientForm = document.getElementById('add-client'),
    addBtn = document.getElementById('add-btn'),
    saveBtn = document.getElementById('add-client-btn'),
    formTitle = document.getElementById('modal-form-title'),
    addContactBtn = document.getElementById('add-contact-btn'),
    closeBtn = document.getElementById('close-btn'),
    buttonContainer = document.getElementById('button-container');

let initialFormState = {};


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


// Функция создания кнопки
function getBtn(text, className, id) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.classList.add(className);
    btn.id = id;
    return btn;
}

// кнопка "Отмена"
const cancelBtn = getBtn('Отмена', 'cancelBtn', 'cancelBtn');
cancelBtn.addEventListener('click', () => {
    formWrap.classList.add('d-none');
    addClientForm.reset();
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов при отмене
});

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
    const surname = document.getElementById('surname').value.trim(),
        name = document.getElementById('name').value.trim(),
        lastName = document.getElementById('lastName').value.trim(),
        contactInputs = document.querySelectorAll('.contact-input'),
        contacts = Array.from(contactInputs).map(input => {
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

// Функция для удаления клиента
async function deleteClient(clientId) {
    await serverDeleteClient(clientId);
    clientsArr = clientsArr.filter(c => c.id !== clientId); // Удаление клиента из массива
    render();
    formWrap.classList.add('d-none');
    addClientForm.reset();
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов после удаления клиента
}

// Функция окна для подтверждения удаления
function confirmDeleteClient() {
    addClientForm.classList.add('d-none');
    formTitle.innerHTML = 'Удалить клиента';

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
        `;

        // Создание кнопки "Изменить" и добавление обработчика события
        const editBtn = getBtn('Изменить', 'editBtn', `edit-${client.id}`);
        editBtn.addEventListener('click', () => {
            fillForm(client);
            formWrap.classList.remove('d-none');
            formTitle.innerHTML = `Изменить данные <span class="span-id"> ID: ${client.id}</span>`;
            addBtn.dataset.editId = client.id;

            // Добавление кнопки "Удалить клиента" в форму редактирования
            buttonContainer.innerHTML = '';
            const deleteClientBtn = getBtn('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
            deleteClientBtn.addEventListener('click', () => {

                // deleteClient(client.id);
            });
            buttonContainer.appendChild(deleteClientBtn);
        });

        // Создание кнопки "Удалить" в таблице и добавление обработчика события
        const deleteBtn = getBtn('Удалить', 'deleteBtn', `delete-${client.id}`);
        deleteBtn.addEventListener('click', () => {

            deleteClient(client.id);
        });

        // Добавление кнопок в строку таблицы
        const btnTd = document.createElement('td');
        btnTd.appendChild(editBtn);
        btnTd.appendChild(deleteBtn);
        clientTR.appendChild(btnTd);

        clientsTable.appendChild(clientTR);
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
addClientForm.addEventListener('input', () => {
    saveBtn.disabled = !isFormChanged(); // Проверка изменений формы
});

// Обработка отправки формы для добавления/редактирования клиента
addClientForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const surname = document.getElementById('surname').value.trim(),
        name = document.getElementById('name').value.trim(),
        lastName = document.getElementById('lastName').value.trim(),
        contactInputs = document.querySelectorAll('.contact-input'),
        contacts = Array.from(contactInputs).map(input => {
            const type = input.querySelector('select').value,
                value = input.querySelector('input').value.trim();
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
        const clientId = addBtn.dataset.editId,
            clientDataObj = await serverEditClient(clientId, clientObj),
            index = clientsArr.findIndex(c => c.id === clientId);
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

    // Добавление кнопки "Отмена"
    buttonContainer.innerHTML = '';

    buttonContainer.appendChild(cancelBtn);
});

// Добавление обработчика на кнопку закрытия формы
closeBtn.addEventListener('click', () => {
    formWrap.classList.add('d-none');
    addClientForm.reset();
    document.getElementById('contacts-container').innerHTML = '';
});

// Первоначальное отображение списка клиентов
render();