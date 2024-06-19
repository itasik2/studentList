// Получение элементов из DOM
const clientsTable = document.getElementById('clients-table'),
    formWrap = document.getElementById('form-wrap'),
    addClientForm = document.getElementById('add-client'),
    addBtn = document.getElementById('add-btn'),
    saveBtn = document.getElementById('add-client-btn'),
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
function getBtn(text, className, id) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.classList.add(className);
    btn.id = id;
    return btn;
}

function handleCancel() {
    formWrap.classList.add('d-none');
    addClientForm.reset();
    document.getElementById('contacts-container').innerHTML = ''; // Очистка полей контактов
}


// кнопка "Отмена"
const cancelBtn = getBtn('Отмена', 'cancelBtn', 'cancelBtn');
cancelBtn.addEventListener('click', handleCancel);

// Функция для получения ФИО клиента
function getFio(surname, name, lastname) {
    return `${surname} ${name} ${lastname}`;
}

//функция для форматирования даты и времени
function formatDateTime(date) {

    // Получение компонентов даты
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в Date объекте нумеруются с 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Возвращаем отформатированную строку
    return `${day}.${month}.${year} <span>${hours}:${minutes}</span>`;
}

// Пример использования:
const currentDate = new Date();
const formattedDate = formatDateTime(currentDate);
console.log(formattedDate); // Пример вывода: "19.06.2024 15:30"


// Функция для получения строкового представления контактов клиента
// function getContacts(contacts) {
//     return contacts.map(contact => `${contact.type}: ${contact.value}`).join(', ');
// }

function getContacts(contacts) {
    return contacts.map(contact => {
        let img;
        switch (contact.type) {
            case 'Телефон':
                return `<span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.7">
<circle cx="8" cy="8" r="8" fill="#9873FF"/>
<path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
</g>
</svg>
                </span>`; // иконка для телефона

            case 'Доп.телефон':
                return `<span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF" />
</svg>
</span>`; // иконка для дополнительного телефона

            case 'Email':
                return `<span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF" />
</svg>
</span>`; // иконка для email

            case 'Vk':
                return `<span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.7">
    <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF" />
  </g>
</svg>
</span>`; //иконка для Vk

            case 'Facebook':
                return `<span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.7">
    <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF" />
  </g>
</svg>
</span>`; // Замените на класс иконки для Facebook

            default:
                return ''; // Класс иконки по умолчанию для неизвестных типов

        }

    }).join(', ');
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
            <option value="Доп.телефон" ${contact.type === 'Доп. телефон' ? 'selected' : ''}>Доп.телефон</option>
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
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2332 7.73333L21.2665 6.76666L14.4998 13.5334L7.73318 6.7667L6.76652 7.73336L13.5332 14.5L6.76654 21.2667L7.73321 22.2333L14.4998 15.4667L21.2665 22.2334L22.2332 21.2667L15.4665 14.5L22.2332 7.73333Z" fill="#B0B0B0"></path>
          </svg>
        </button>
      </div>
      <p class="modal-confirm-delete-desc d-">
        Вы действительно хотите удалить данного клиента?
      </p>
      <div class="modal-confirm-btn-wrap d-flex flex-column">
        <button class="confirm-delete-btn btn-primary btn" id="confirm-delete-btn">Удалить</button>
        <button class="confirm-cancel-btn btn-none btn" id="confirm-cancel-btn">Отмена</button>
      </div>`
    document.getElementById('confirm-delete-btn').addEventListener('click', () => deleteClient(clientId));
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '');
    document.getElementById('modal-close-btn').addEventListener('click', () => modalConfirmDelete.innerHTML = '')
}

let createTime = formatDateTime(createdAt),
    updateTime = formatDateTime(updatedAt);

// Функция для отображения списка клиентов в таблице
function render() {
    clientsTable.innerHTML = '';
    clientsArr.forEach(client => {
        const clientTR = document.createElement('tr');
        createTime = formatDateTime(createdAt),
            updateTime = formatDateTime(updatedAt);

        clientTR.innerHTML = `
            <td>${client.id}</td>
            <td>${getFio(client.surname, client.name, client.lastName)}</td>
            <td>${client.createTime}</td>
            <td>${client.updateTime}</td>
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
                confirmDeleteClient(client.id);
                formWrap.classList.add('d-none');
            });

            buttonContainer.appendChild(deleteClientBtn);
        });

        // Создание кнопки "Удалить" в таблице и добавление обработчика события
        const deleteBtn = getBtn('Удалить', 'deleteBtn', `delete-${client.id}`);
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