import express from 'express';

const app = express();

app.get('/users', (request, response) => {
    response.json([
        "Lucas",
        "Eduardo",
        "Wendt",
        "Cleito",
        "Robso"
    ]);
});

app.listen(3001)