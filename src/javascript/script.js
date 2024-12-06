import { API_BASE_URL } from "../../config/apiConfig.js";
import { getFromLocalStorage } from "../../utils/storage.js";

const boardsList = document.getElementById("boardsList");
const userNameSpan = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const boardTitle = document.getElementById("boardTitle");
const boardLayout = document.getElementById("board");

async function loadBoards() {
    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (!response.ok) {
            throw new Error("Erro ao carregar boards");
        }
        const boards = await response.json();
        populateBoardsDropdown(boards);
    } catch (error) {
        console.error("Erro ao carregar boards:", error);
    }
}

function populateBoardsDropdown(boards) {
    
    boards.forEach((board) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a class="dropdown-item" id="dropdown-item" value="${board.Id}">${board.Name}</a>`;
        
        listItem.addEventListener("click", (event) => {
            // console.log(board.Id)
            boardTitle.innerHTML = event.target.innerHTML;
        
            loadBoard(board.Id);
        })

        boardsList.appendChild(listItem);

    });
}

async function loadBoard(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${id}`)
        if(!response.ok) {
            throw new Error("Erro ao carregar colunas");
        }
        const columns = await response.json();
        populateColumns(columns, id);
    } catch (error) {
        console.error("Erro ao carregar colunas:", error);
    }
}

function populateColumns(columns, BoardId) {
    boardLayout.innerHTML = "";

        // Adiciona o botão "Nova Coluna"
        const newColumnButton = document.createElement("div");
        newColumnButton.className = "coluna-item new-coluna";
        newColumnButton.innerHTML = `
            <button class="btn btn-primary btn-block w-100 d-block" id="newColumnButton">+ Nova Coluna</button>`;
        newColumnButton.addEventListener("click", () => {
            createNewColumn(BoardId);
        });
    
        // Adiciona o botão antes das colunas
        boardLayout.appendChild(newColumnButton);

    columns.forEach((column) => {
        const columnItem = document.createElement("article");
        columnItem.className = "column-item";

        const columnHeader = document.createElement("header");
        columnHeader.className = "column-header";
        columnHeader.innerHTML = `<h5>${column.Name}</h5>`;

        const tasksContainer = document.createElement("div");
        tasksContainer.className = "tasks-container";
        tasksContainer.id = `tasks-${column.Id}`;

        const columnBody = document.createElement("div");
        columnBody.className = "column-body";

        // Botão "Nova Tarefa"
        const newCardButton = document.createElement("div");
        newCardButton.className = "task-item new-card";
        newCardButton.innerHTML = `
            <button class="btn btn-light btn-block w-100 d-block">+ Nova Tarefa</button>`;
        newCardButton.addEventListener("click", () => {
            createNewCard(column.Id);
        });

        const removeColumnButton = document.createElement("button");
        removeColumnButton.className = "btn btn-danger w-100 mt-2";
        removeColumnButton.innerText = "Excluir Coluna";
        removeColumnButton.addEventListener("click", () => {
        removeColumn(column.Id, columnItem); // Passa o ID e o elemento DOM da coluna
});


        // Monta a estrutura da coluna
        columnBody.appendChild(tasksContainer); // Contêiner de tarefas
        columnBody.appendChild(newCardButton);  // Botão "Nova Tarefa"
        columnBody.appendChild(removeColumnButton); // Botão "Remover Coluna"

        columnItem.appendChild(columnHeader);
        columnItem.appendChild(columnBody);

        boardLayout.appendChild(columnItem);

        // Adiciona tasks à coluna
        fetchTasksByColumn(column.Id).then((tasks) => {
            addTasksToColumn(column.Id, tasks);
        });
    });
}

function removeColumn(columnId, columnElement) {
    const confirmDelete = confirm("Tem certeza de que deseja excluir esta coluna? Todas as tarefas serão removidas.");
    if (!confirmDelete) return;

    // Chamada para a API
    fetch(`${API_BASE_URL}/Column?ColumnId=${columnId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao excluir coluna");
            }
            console.log(`Coluna ${columnId} excluída com sucesso`);
            columnElement.remove(); // Remove a coluna do DOM
        })
        .catch((error) => {
            console.error("Erro ao excluir coluna:", error);
            alert("Erro ao excluir a coluna. Tente novamente.");
        });
}


function createNewCard(columnId) {
    const tasksContainer = document.getElementById(`tasks-${columnId}`);
    
    // Verifica se o container de tarefas foi encontrado
    if (!tasksContainer) {
        console.error(`Container de tarefas para a coluna ${columnId} não encontrado.`);
        return;
    }

    // Cria os campos de input para o título e descrição
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Título";
    titleInput.className = "task-input form-control mb-1";

    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.placeholder = "Descrição";
    descriptionInput.className = "task-input form-control mb-1";

    // Botão para salvar o card
    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-success  btn-sm btn-save";
    saveButton.innerText = "Salvar";

    // Botão para cancelar a criação do card
    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-danger  btn-sm  btn-cancel m-1";
    cancelButton.innerText = "Cancelar";

    // Container para os inputs e botões
    const cardEditor = document.createElement("div");
    cardEditor.className = "card-editor";
    cardEditor.appendChild(titleInput);
    cardEditor.appendChild(descriptionInput);
    cardEditor.appendChild(saveButton);
    cardEditor.appendChild(cancelButton);

    // Adiciona o editor ao container de tarefas
    tasksContainer.appendChild(cardEditor);

    // Event listener para salvar o card
    saveButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (title === "") {
            alert("O título da tarefa não pode estar vazio.");
            return;
        }

        // Cria o card
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <h6>${title}</h6>
            <p>${description}</p>
        `;

        // Adiciona o novo card ao container de tarefas
        tasksContainer.appendChild(taskItem);

        // Remove o editor de tarefas
        tasksContainer.removeChild(cardEditor);

        // Aqui você pode incluir uma lógica para salvar a tarefa no backend
        saveTask(columnId, title, description);

    });

    // Event listener para cancelar
    cancelButton.addEventListener("click", () => {
        tasksContainer.removeChild(cardEditor);
    });
}

function createNewColumn(BoardId){

    const tasksContainer = document.getElementById(`conteinerNewColunaButton`);

    // Cria os campos de input para o título e descrição
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Título";
    titleInput.className = "task-input form-control mb-1";

    // Botão para salvar o Coluna
    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-success  btn-sm btn-save me-1";
    saveButton.innerText = "Salvar";

    // Botão para cancelar a criação da Coluna
    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-danger  btn-sm  btn-cancel";
    cancelButton.innerText = "Cancelar";
    // Event listener para cancelar
    cancelButton.addEventListener("click", () => {
        tasksContainer.removeChild(cardEditor);
    });

    // Container para os inputs e botões
    const cardEditor = document.createElement("div");
    cardEditor.className = "card-editor";
    cardEditor.appendChild(titleInput);
    cardEditor.appendChild(saveButton);
    cardEditor.appendChild(cancelButton);

    // Adiciona o editor ao container de boards
    boardTitle.appendChild(cardEditor);

    saveButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        
        if (title === "") {
            alert("O título da tarefa não pode estar vazio.");
            return;
        }

        saveColumn(BoardId, title)

        const columnItem = document.createElement("article");
        columnItem.className = "column-item";

        const columnHeader = document.createElement("header");
        columnHeader.className = "column-header";
        columnHeader.innerHTML = `<h5>${title}</h5>`;

        // Contêiner principal da coluna
        const columnBody = document.createElement("div");
        columnBody.className = "column-body";

        // Botão "Novo Card"
        const newCardButton = document.createElement("div");
        newCardButton.className = "task-item new-card";
        newCardButton.innerHTML = `
            <button class="btn btn-light btn-block w-100 d-block"> + Nova Tarefa </button>`;
        newCardButton.addEventListener("click", () => {
            createNewCard(column.Id);
        });

        // Adiciona o novo card ao container de tarefas
        columnBody.appendChild(newCardButton);  // Botão "Novo Card"
        columnItem.appendChild(columnHeader);
        columnItem.appendChild(columnBody);
        boardLayout.appendChild(columnItem);

        // Remove o editor de tarefas
        boardTitle.removeChild(cardEditor);
    });

    // Event listener para cancelar
    cancelButton.addEventListener("click", () => {
        boardTitle.removeChild(cardEditor);
    });
}

function saveTask(columnId, title, description) {
    // Lógica para salvar a tarefa no backend 
    fetch(`${API_BASE_URL}/Task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, title, description })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Tarefa salva com sucesso:", data);
    })
    .catch(error => {
        console.error("Erro ao salvar tarefa:", error);
    });
}

function saveColumn(BoardId, Name) {
    // Lógica para salvar a coluna no backend 
    fetch(`${API_BASE_URL}/Column`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ BoardId, Name })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Coluna salva com sucesso:", data);
    })
    .catch(error => {
        console.error("Erro ao salvar coluna:", error);
    });
}

function fetchTasksByColumn(columnId) {
    const endpoint = `${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`;
    return fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar tasks para ColumnId ${columnId}: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error(error);
            return [];
        });
}
function addTasksToColumn(columnId, tasks) {
    const columnBody = document.getElementById(`tasks-${columnId}`);

    tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item d-flex justify-content-between align-items-center";
        taskItem.dataset.taskId = task.Id; // ID único da tarefa

        // Conteúdo da tarefa
        const taskContent = document.createElement("div");
        taskContent.innerHTML = `
            <h6>${task.Title || "Sem título"}</h6>
            <p>${task.Description || "Sem descrição"}</p>
        `;

        // Botão "Excluir"
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.innerText = "Excluir";
        deleteButton.addEventListener("click", () => {
            removeTask(task.Id, taskItem);
        });

        // Adiciona o conteúdo e o botão ao elemento da tarefa
        taskItem.appendChild(taskContent);
        taskItem.appendChild(deleteButton);
        columnBody.appendChild(taskItem);
    });
}
function removeTask(taskId, taskElement) {
    // Confirmação de exclusão
    const confirmDelete = confirm("Tem certeza de que deseja excluir esta tarefa?");
    if (!confirmDelete) return;

    // Chamada à API para excluir a tarefa
    fetch(`${API_BASE_URL}/Task?TaskId=${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao excluir tarefa");
            }
            console.log(`Tarefa ${taskId} excluída com sucesso`);
            taskElement.remove(); // Remove a tarefa do DOM
        })
        .catch((error) => {
            console.error("Erro ao excluir tarefa:", error);
            alert("Erro ao excluir a tarefa. Tente novamente.");
        });
}


// Função para atualizar o quadro após a exclusão
function updateBoard(ColumnId) {
	const url = `${API_BASE_URL}/Tasks?ColumnId=${ColumnId}`;

	fetch(url)
		.then((response) => response.json())
		.then((tasks) => {
			// Atualiza as tarefas na coluna, apenas se a tarefa foi excluída
			addTasksToColumn(ColumnId, tasks);
		})
		.catch((error) => {
			console.error("Erro ao atualizar o quadro:", error);
		});
}

function loadUserName() {
    const userName = getFromLocalStorage("user");
    console.log(userName); // Verifica o valor retornado
    if (userName.name) {
        userNameSpan.textContent = `Olá, ${userName.name.split(' ')[0]}`;
    } else {
        userNameSpan.textContent = "Usuário não identificado";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Verifica o estado salvo no localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Alterna o ícone
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark'); // Salva o estado no localStorage
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light'); // Salva o estado no localStorage
        }
    });
});

document.getElementById('logoutButton').addEventListener('click', () => {
    // Remove informações do usuário, se necessário
    localStorage.clear(); // Opcional, caso use localStorage para autenticação
    
    // Redireciona para a tela de login
    window.location.href = 'login.html'; // Substitua 'login.html' pelo caminho correto para a tela de login
});

function init() {
    loadUserName();
    loadBoards();
}
init();