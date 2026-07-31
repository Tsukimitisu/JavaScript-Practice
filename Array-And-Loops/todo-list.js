const todoList = [];
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const listElement = document.querySelector('.js-todo-list');

function renderTodoList() {
    listElement.replaceChildren();

    todoList.forEach((todo, index) => {
        const itemElement = document.createElement('li');
        const removeButton = document.createElement('button');

        itemElement.append(todo, ' ');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.setAttribute('aria-label', `Remove ${todo}`);
        removeButton.addEventListener('click', () => {
            todoList.splice(index, 1);
            renderTodoList();
        });

        itemElement.append(removeButton);
        listElement.append(itemElement);
    });
}

formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = inputElement.value.trim();

    if (!name) {
        return;
    }

    todoList.push(name);
    renderTodoList();
    formElement.reset();
    inputElement.focus();
});
