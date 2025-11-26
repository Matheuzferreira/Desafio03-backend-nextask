// backend/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; 

// Middleware
app.use(cors());
app.use(express.json()); // Para analisar o corpo das requisições

// Dados de exemplo (simulando um "banco de dados")
let tarefas = [
    { id: 1, titulo: "Estudar React Native", concluida: false },
    { id: 2, titulo: "Configurar Backend", concluida: true }
];
let nextId = 3;

// Rota de teste
app.get('/', (req, res) => {
    res.send("Backend NexTask rodando.");
});

// 1. READ (Ler todas as tarefas)
app.get('/tarefas', (req, res) => {
    return res.json(tarefas);
});

// 2. CREATE (Criar nova tarefa)
app.post('/tarefas', (req, res) => {
    const { titulo } = req.body;
    if (!titulo) {
        return res.status(400).json({ error: "Título é obrigatório." });
    }
    const novaTarefa = {
        id: nextId++,
        titulo,
        concluida: false
    };
    tarefas.push(novaTarefa);
    return res.status(201).json(novaTarefa);
});

// 3. UPDATE (Atualizar tarefa - para marcar/desmarcar concluída)
app.put('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { concluida } = req.body;
    
    const index = tarefas.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    // Apenas atualiza o status de concluída
    tarefas[index].concluida = concluida !== undefined ? concluida : tarefas[index].concluida;

    return res.json(tarefas[index]);
});

// 4. DELETE (Deletar tarefa)
app.delete('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const initialLength = tarefas.length;
    tarefas = tarefas.filter(t => t.id !== id);
    
    if (tarefas.length === initialLength) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    return res.status(204).send(); // 204 No Content
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});