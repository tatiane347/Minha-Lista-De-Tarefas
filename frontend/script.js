// minha-lista-de-tarefas/frontend/script.js
const API_URL = 'http://localhost:3000/tasks'; // URL do seu backend

// Seleciona os elementos HTML
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// --- Funções de Comunicação com o Backend (API) ---

// Função para buscar todas as tarefas do backend
async function fetchTasks() {
    try {
        const response = await fetch(API_URL); // Faz uma requisição GET para /tasks
        if (!response.ok) { // Verifica se a resposta foi bem-sucedida (status 200-299)
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const tasks = await response.json(); // Converte a resposta para JSON
        renderTasks(tasks); // Chama a função para exibir as tarefas na interface
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        taskList.innerHTML = '<li style="color: red;">Erro ao carregar as tarefas. Verifique se o servidor está rodando.</li>';
    }
}

// Função para adicionar uma nova tarefa
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    const description = taskInput.value.trim(); // Pega o texto do input e remove espaços extras

    if (description) { // Se a descrição não estiver vazia
        try {
            const response = await fetch(API_URL, {
                method: 'POST', // Método HTTP para criar recursos
                headers: {
                    'Content-Type': 'application/json' // Informa que estamos enviando JSON
                },
                body: JSON.stringify({ description }) // Converte o objeto JavaScript para JSON
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            taskInput.value = ''; // Limpa o campo de input
            fetchTasks(); // Recarrega a lista de tarefas para mostrar a nova
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            alert('Não foi possível adicionar a tarefa. Tente novamente.');
        }
    }
});

// Função para alternar o status de conclusão de uma tarefa
async function toggleTaskCompleted(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { // Requisição PUT para a tarefa específica
            method: 'PUT', // Método HTTP para atualizar recursos
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed }) // Envia o novo status de conclusão
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        fetchTasks(); // Recarrega a lista para atualizar o visual da tarefa
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Não foi possível atualizar o status da tarefa.');
    }
}

// Função para excluir uma tarefa
async function deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) { // Pede confirmação ao usuário
        try {
            const response = await fetch(`${API_URL}/${id}`, { // Requisição DELETE para a tarefa específica
                method: 'DELETE' // Método HTTP para excluir recursos
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            fetchTasks(); // Recarrega a lista para remover a tarefa excluída
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            alert('Não foi possível excluir a tarefa.');
        }
    }
}

// --- Funções de Renderização da Interface ---

// Função para renderizar (exibir) as tarefas na lista HTML
function renderTasks(tasks) {
    taskList.innerHTML = ''; // Limpa a lista existente antes de adicionar as novas tarefas

    if (tasks.length === 0) {
        taskList.innerHTML = '<li>Nenhuma tarefa adicionada ainda.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Armazena o ID da tarefa no elemento <li> para fácil acesso

        // Adiciona a classe 'completed' se a tarefa estiver concluída
        if (task.completed) {
            li.classList.add('completed');
        }

        // Cria o checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed; // Define o estado do checkbox
        checkbox.addEventListener('change', () => toggleTaskCompleted(task.id, checkbox.checked));

        // Cria o texto da tarefa
        const span = document.createElement('span');
        span.textContent = task.description;

        // Cria o botão de excluir
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        // Adiciona os elementos ao <li>
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        // Adiciona o <li> à lista de tarefas (<ul>)
        taskList.appendChild(li);
    });
}

// --- Inicialização ---

// Carrega as tarefas assim que a página é totalmente carregada
document.addEventListener('DOMContentLoaded', fetchTasks);
