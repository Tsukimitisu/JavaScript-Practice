const todoList = [];

function addTodo(){
    const inputEl = document.querySelector('.js-input')
    const name = inputEl.value
    

    todoList.push(name);

    console.log(todoList)

    inputEl.value = ''
}