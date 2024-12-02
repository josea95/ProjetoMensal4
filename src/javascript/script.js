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