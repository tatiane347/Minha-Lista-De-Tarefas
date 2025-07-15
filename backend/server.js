// minha-lista-de-tarefas/backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Importe o cors

const app = express();
const PORT = process.env.PORT || 3000; // O servidor rodará na porta 3000

// Middleware para permitir requisições de diferentes origens (CORS)
// Isso é crucial para que seu frontend (em um "endereço" diferente) possa acessar o backend.
app.use(cors());
// Middleware para parsear JSON do corpo das requisições (ex: ao adicionar uma tarefa)
app.use(express.json());

// Conectando ao banco de dados SQLite
// O arquivo do banco de dados 'tasks.db' será criado na pasta 'backend' se não existir
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Crie a tabela de tarefas se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )`);
        console.log('Tabela "tasks" verificada/criada.');
    }
});

// --- Rotas da API ---

// 1. Rota para obter todas as tarefas
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Retorna as tarefas como JSON
    });
});

// 2. Rota para adicionar uma nova tarefa
app.post('/tasks', (req, res) => {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({ error: 'A descrição da tarefa é obrigatória.' });
    }
    db.run('INSERT INTO tasks (description) VALUES (?)', [description], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Retorna a nova tarefa com o ID gerado
        res.status(201).json({ id: this.lastID, description, completed: 0 });
    });
});

// 3. Rota para atualizar o status de uma tarefa (marcar como concluída/pendente)
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params; // ID da tarefa vindo da URL
    const { completed } = req.body; // Novo status vindo do corpo da requisição

    if (completed === undefined) {
        return res.status(400).json({ error: 'O status "completed" é obrigatório.' });
    }
    // O SQLite armazena booleanos como 0 (false) ou 1 (true)
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) { // Verifica se alguma linha foi afetada (tarefa encontrada)
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }
        res.json({ message: 'Tarefa atualizada com sucesso.' });
    });
});

// 4. Rota para excluir uma tarefa
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params; // ID da tarefa a ser excluída

    db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) { // Verifica se alguma linha foi afetada (tarefa encontrada)
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }
        res.json({ message: 'Tarefa excluída com sucesso.' });
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

