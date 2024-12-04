
// Seleciona todos os elementos com a classe '.kanban-card' e adiciona eventos a cada um deles
document.querySelectorAll('.kanban-card').forEach(card => {
    // Evento disparado quando começa a arrastar um card
    card.addEventListener('dragstart', e => {
        // Adiciona a classe 'dragging' ao card que está sendo arrastado
        e.currentTarget.classList.add('dragging');
    })
        card.addEventListener('dragend', e => {
            e.currentTarget.classList.remove('dragging');
        })
    });
    document.querySelectorAll('.kanban-cards').forEach(column => {
        column.addEventListener('dragover',e =>{
            e.preventDefault();
            e.currentTarget.classList.add('cards-hover');

        })
        column.addEventListener('dragleave',e =>{
        e.currentTarget.classList.remove('cards-hover');

        })
        column.addEventListener('drop', e =>{
        e.currentTarget.classList.remove('cards-hover');
        const dragCard = document.querySelector('.kanban-card.dragging');
        e.currentTarget.appendChild(dragCard);
        })
    })

    // Exemplo de função para buscar dados da API e preencher o seletor
async function fetchBoards() {
    try {
        const response = await fetch('https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Boards'); // Substitua pela URL da API real
        const boards = await response.json();

        const selector = document.getElementById('board-selector');

        // Adiciona opções ao seletor
        boards.forEach(board => {
            const option = document.createElement('option');
            option.value = board.id; // Use o atributo relevante da API
            option.textContent = board.Name; // Use o atributo relevante da API
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar boards:', error);
    }
}

// Chama a função ao carregar a página
fetchBoards();

// Função para alternar entre temas
function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('.theme-toggle i');
    
    body.classList.toggle('dark-mode'); // Alterna o tema no body

    // Altera o ícone dinamicamente
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun'); // Ícone de sol no modo noturno
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon'); // Ícone de lua no modo claro
    }
}


