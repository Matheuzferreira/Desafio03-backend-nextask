const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'database.json');

const readDatabase = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { tarefas: [], nextId: 1 };
        }
        throw error;
    }
};

const writeDatabase = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/tarefas', (req, res) => {
    const { tarefas } = readDatabase();
    res.json(tarefas);
});

app.post('/tarefas', (req, res) => {
    const { titulo } = req.body;
    let db = readDatabase();
    
    if (!titulo) return res.status(400).json({ error: "Título é obrigatório" });

    const novaTarefa = {
        id: db.nextId++,
        titulo,
        concluida: false
    };

    db.tarefas.push(novaTarefa);
    writeDatabase(db);
    res.status(201).json(novaTarefa);
});

app.get('/tarefas/buscar', (req, res) => {
    const { query } = req.query;
    const { tarefas } = readDatabase();
    
    if (!query) return res.json(tarefas);

    const resultados = tarefas.filter(t =>
        t.titulo.toLowerCase().includes(query.toLowerCase())
    );
    res.json(resultados);
});

app.put('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, concluida } = req.body; 
    let db = readDatabase();
    
    const index = db.tarefas.findIndex(t => t.id === id);

    if (index === -1) return res.status(404).json({ error: "Tarefa não encontrada" });

    if (titulo !== undefined) db.tarefas[index].titulo = titulo;
    if (concluida !== undefined) db.tarefas[index].concluida = concluida;
    
    writeDatabase(db);
    res.json(db.tarefas[index]);
});

app.delete('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let db = readDatabase();
    
    const initialLength = db.tarefas.length;
    db.tarefas = db.tarefas.filter(t => t.id !== id);
    
    if (db.tarefas.length === initialLength) return res.status(404).json({ error: "Tarefa não encontrada" });

    writeDatabase(db);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});