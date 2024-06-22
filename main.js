// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table'),
    formWrap = document.getElementById('form-wrap'),
    addClientForm = document.getElementById('add-client-form'),
    addBtn = document.getElementById('add-btn'),
    saveBtn = document.getElementById('save-client-btn'),
    formTitle = document.getElementById('modal-form-title'),
    addContactBtn = document.getElementById('add-contact-btn'),
    closeBtn = document.getElementById('close-btn'),
    buttonContainer = document.getElementById('button-container'),
    modalConfirmDelete = document.getElementById('modal-confirm-delete');

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
function getBtn(innerHTML, className, id) {
    const btn = document.createElement('button');
    btn.innerHTML = innerHTML;
    btn.classList.add(className);
    btn.id = id;
    return btn;
}

// кнопка "Отмена"
const cancelBtn = getBtn('Отмена', 'cancelBtn', 'cancelBtn');
cancelBtn.addEventListener('click', () => {
    formWrap.classList.add('d-none');
    addClientForm.reset();
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов
});

// Функция для получения ФИО клиента
function getFio(surname, name, lastname) {
    return `${surname} ${name} ${lastname}`;
}

// функция для форматирования даты и времени
function formatDateTime(date) {
    date = new Date(date); // Изменение: используем переданную дату
    // Получение компонентов даты
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в Date объекте нумеруются с 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Возвращаем отформатированную строку
    return `${day}.${month}.${year} <span class="time">${hours}:${minutes}</span>`;
}

// Функция добавления изображения
function getImage(src, alt = '', className = '') {
    const img = new Image();
    img.src = src;
    img.alt = alt;
    if (className) {
        img.classList.add(className);
    }
    return img;
}

// Заменяет тип контактов на иконки
function getContacts(contacts) {
    return contacts.map(contact => {
        let img;
        switch (contact.type) {
            case 'Телефон':
                img = getImage('img/phone-icon.svg', 'Телефон', 'contact-icon');
                break;
            case 'Доп.телефон':
                img = getImage('img/phone-alt-icon.svg', 'Доп.телефон', 'contact-icon');
                break;
            case 'Email':
                img = getImage('img/email-icon.svg', 'Email', 'contact-icon');
                break;
            case 'Vk':
                img = getImage('img/vk-icon.svg', 'Vk', 'contact-icon');
                break;
            case 'Facebook':
                img = getImage('img/facebook-icon.svg', 'Facebook', 'contact-icon');
                break;
            default:
                img = getImage('img/contact-icon.svg', 'Контакт', 'contact-icon');
        }
        return `<span>${img.outerHTML} <div class="contact-value d-none">${contact.value}</div></span>`;
    }).join(' ');
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
            <option value="Доп.телефон" ${contact.type === 'Доп.телефон' ? 'selected' : ''}>Доп.телефон</option>
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
function confirmDeleteClient(clientId) {
    modalConfirmDelete.innerHTML = `<div class="modal-confirm-delete-header d-flex justify-content-between">
        <h3 class="modal-confirm-delete-title" id="modal-confirm-delete-title">Удалить клиента</h3>
        <button class="close-btn mr-auto" id="modal-close-btn">
        ${getImage('./img/close.svg', 'Закрыть', 'close-img').outerHTML}
        </button>
      </div>
      <p class="modal-confirm-delete-desc d-">
        Вы действительно хотите удалить данного клиента?
      </p>
      <div class="modal-confirm-btn-wrap d-flex flex-column">
        <button class="confirm-delete-btn btn-primary btn" id="confirm-delete-btn">Удалить</button>
        <button class="confirm-cancel-btn btn-none btn" id="confirm-cancel-btn">Отмена</button>
      </div>`;
    document.getElementById('confirm-delete-btn').addEventListener('click', () => deleteClient(clientId));
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '');
    document.getElementById('modal-close-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '');
}

// Функция для отображения списка клиентов в таблице
function render() {
    clientsTable.innerHTML = '';
    clientsArr.forEach(client => {
        const clientTR = document.createElement('tr');

        clientTR.innerHTML = `
            <td>${client.id}</td>
            <td>${getFio(client.surname, client.name, client.lastName)}</td>
            <td>${formatDateTime(client.createdAt)}</td>
            <td>${formatDateTime(client.updatedAt)}</td>
            <td>${getContacts(client.contacts)}</td>
        `;

        // Создание кнопки "Изменить" и добавление обработчика события
        const editBtn = getBtn(`${getImage('./img/edit.svg', 'Изменит', 'edit-img').outerHTML} Изменить`, 'editBtn', `edit-${client.id}`);
        editBtn.addEventListener('click', () => {
            fillForm(client);
            formWrap.classList.remove('d-none');
            formTitle.innerHTML = `Изменить данные <span class="span-id"> ID: ${client.id}</span>`;
            addBtn.dataset.editId = client.id;

            // Добавление кнопки "Удалить клиента" в форму редактирования
            buttonContainer.innerHTML = '';
            const deleteClientBtn = getBtn('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
            deleteClientBtn.addEventListener('click', () => {
                confirmDeleteClient(client.id);
                formWrap.classList.add('d-none');
            });

            buttonContainer.appendChild(deleteClientBtn);
        });

        // Создание кнопки "Удалить" в таблице и добавление обработчика события
        const deleteBtn = getBtn(`${getImage('./img/delete-icon.svg', 'Удалить', 'delete-img').outerHTML} Удалить`, 'deleteBtn', `delete-${client.id}`);
        deleteBtn.addEventListener('click', () => confirmDeleteClient(client.id));

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
    // Получение элементов из DOM
    const clientsTable = document.getElementById('clients-table'),
        formWrap = document.getElementById('form-wrap'),
        addClientForm = document.getElementById('add-client-form'),
        addBtn = document.getElementById('add-btn'),
        saveBtn = document.getElementById('save-client-btn'),
        formTitle = document.getElementById('modal-form-title'),
        addContactBtn = document.getElementById('add-contact-btn'),
        closeBtn = document.getElementById('close-btn'),
        buttonContainer = document.getElementById('button-container'),
        modalConfirmDelete = document.getElementById('modal-confirm-delete');

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
    function getBtn(innerHTML, className, id) {
        const btn = document.createElement('button');
        btn.innerHTML = innerHTML;
        btn.classList.add(className);
        btn.id = id;
        return btn;
    }

    // кнопка "Отмена"
    const cancelBtn = getBtn('Отмена', 'cancelBtn', 'cancelBtn');
    cancelBtn.addEventListener('click', () => {
        formWrap.classList.add('d-none');
        addClientForm.reset();
        document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов
    });

    // Функция для получения ФИО клиента
    function getFio(surname, name, lastname) {
        return `${surname} ${name} ${lastname}`;
    }

    // функция для форматирования даты и времени
    function formatDateTime(date) {
        date = new Date(date); // Изменение: используем переданную дату
        // Получение компонентов даты
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в Date объекте нумеруются с 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // Возвращаем отформатированную строку
        return `${day}.${month}.${year} <span class="time">${hours}:${minutes}</span>`;
    }

    // Функция добавления изображения
    function getImage(src, alt = '', className = '') {
        const img = new Image();
        img.src = src;
        img.alt = alt;
        if (className) {
            img.classList.add(className);
        }
        return img;
    }

    // Заменяет тип контактов на иконки
    function getContacts(contacts) {
        return contacts.map(contact => {
            let img;
            switch (contact.type) {
                case 'Телефон':
                    img = getImage('img/phone-icon.svg', 'Телефон', 'contact-icon');
                    break;
                case 'Доп.телефон':
                    img = getImage('img/phone-alt-icon.svg', 'Доп.телефон', 'contact-icon');
                    break;
                case 'Email':
                    img = getImage('img/email-icon.svg', 'Email', 'contact-icon');
                    break;
                case 'Vk':
                    img = getImage('img/vk-icon.svg', 'Vk', 'contact-icon');
                    break;
                case 'Facebook':
                    img = getImage('img/facebook-icon.svg', 'Facebook', 'contact-icon');
                    break;
                default:
                    img = getImage('img/contact-icon.svg', 'Контакт', 'contact-icon');
            }
            return `<span>${img.outerHTML} <div class="contact-value d-none">${contact.value}</div></span>`;
        }).join(' ');
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
            <option value="Доп.телефон" ${contact.type === 'Доп.телефон' ? 'selected' : ''}>Доп.телефон</option>
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
    function confirmDeleteClient(clientId) {
        modalConfirmDelete.innerHTML = `<div class="modal-confirm-delete-header d-flex justify-content-between">
        <h3 class="modal-confirm-delete-title" id="modal-confirm-delete-title">Удалить клиента</h3>
        <button class="close-btn mr-auto" id="modal-close-btn">
        ${getImage('./img/close.svg', 'Закрыть', 'close-img').outerHTML}
        </button>
      </div>
      <p class="modal-confirm-delete-desc d-">
        Вы действительно хотите удалить данного клиента?
      </p>
      <div class="modal-confirm-btn-wrap d-flex flex-column">
        <button class="confirm-delete-btn btn-primary btn" id="confirm-delete-btn">Удалить</button>
        <button class="confirm-cancel-btn btn-none btn" id="confirm-cancel-btn">Отмена</button>
      </div>`;
        document.getElementById('confirm-delete-btn').addEventListener('click', () => deleteClient(clientId));
        document.getElementById('confirm-cancel-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '');
        document.getElementById('modal-close-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '');
    }

    // Функция для отображения списка клиентов в таблице
    function render() {
        clientsTable.innerHTML = '';
        clientsArr.forEach(client => {
            const clientTR = document.createElement('tr');

            clientTR.innerHTML = `
            <td>${client.id}</td>
            <td>${getFio(client.surname, client.name, client.lastName)}</td>
            <td>${formatDateTime(client.createdAt)}</td>
            <td>${formatDateTime(client.updatedAt)}</td>
            <td>${getContacts(client.contacts)}</td>
        `;

            // Создание кнопки "Изменить" и добавление обработчика события
            const editBtn = getBtn(`${getImage('./img/edit.svg', 'Изменит', 'edit-img').outerHTML} Изменить`, 'editBtn', `edit-${client.id}`);
            editBtn.addEventListener('click', () => {
                fillForm(client);
                formWrap.classList.remove('d-none');
                formTitle.innerHTML = `Изменить данные <span class="span-id"> ID: ${client.id}</span>`;
                addBtn.dataset.editId = client.id;

                // Добавление кнопки "Удалить клиента" в форму редактирования
                buttonContainer.innerHTML = '';
                const deleteClientBtn = getBtn('Удалить клиента', 'delete-client-btn', `delete-client-${client.id}`);
                deleteClientBtn.addEventListener('click', () => {
                    confirmDeleteClient(client.id);
                    formWrap.classList.add('d-none');
                });

                buttonContainer.appendChild(deleteClientBtn);
            });

            // Создание кнопки "Удалить" в таблице и добавление обработчика события
            const deleteBtn = getBtn(`${getImage('./img/delete-icon.svg', 'Удалить', 'delete-img').outerHTML} Удалить`, 'deleteBtn', `delete-${client.id}`);
            deleteBtn.addEventListener('click', () => confirmDeleteClient(client.id));

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
            clientsArr[index] = {
                ...clientsArr[index],
                ...clientDataObj,
                updatedAt: new Date().toISOString()
            };
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
        clientsArr[index] = {
            ...clientsArr[index],
            ...clientDataObj,
            updatedAt: new Date().toISOString()
        };
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