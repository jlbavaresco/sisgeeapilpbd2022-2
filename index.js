const express = require('express');
const cors = require('cors');
const { pool } = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors());

const getPredios = (request, response) => {
    pool.query("SELECT * from predios ORDER BY codigo",
        (error, results) => {
            if (error) {
                return response.status(400).json({
                    status : "error", 
                    message : "Erro ao consultar os prédios: " + error
                })
            }
            response.status(200).json(results.rows);
        })
}

const addPredio = (request, response) => {
    const { nome, descricao, sigla } = request.body;
    pool.query(`INSERT INTO predios (nome, descricao, sigla) 
    VALUES ($1, $2 , $3) RETURNING codigo, nome, descricao, sigla`,
     [nome, descricao, sigla], 
    (error, results) => {
        if (error) {
            return response.status(400).json({
                status : "error", 
                message : "Erro ao inserir prédio: " + error
            })
        }
        response.status(200).json({
            status : "success",
            message : "Prédio inserido com sucesso",
            objeto: results.rows[0]
        })
    })
}

const updatePredio = (request, response) => {
    const { codigo, nome, descricao, sigla } = request.body;
    pool.query(`UPDATE predios set nome=$1, descricao=$2, sigla=$3
    WHERE codigo=$4 RETURNING codigo, nome, descricao, sigla`,
     [nome, descricao, sigla, codigo], 
    (error, results) => {
        if (error) {
            return response.status(400).json({
                status : "error", 
                message : "Erro ao atualizar prédio: " + error
            })
        }
        response.status(200).json({
            status : "success",
            message : "Prédio atualizado com sucesso",
            objeto: results.rows[0]
        })
    })
}

const deletePredio = (request, response) => {
    const codigo = parseInt(request.params.codigo);
    pool.query(`DELETE FROM predios WHERE codigo=$1`, 
                [codigo] , 
    (error, results) => {
        if (error || results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message: 'Erro ao remover o prédio o prédio! : ' + error
            });
        }
        response.status(200).json({
            status : 'success' , message : "Prédio removido!"
        });
    })
}

const getPredioPorCodigo = (request, response) => {
    const codigo = parseInt(request.params.codigo);
    pool.query(`SELECT * FROM predios WHERE codigo=$1`, 
                [codigo] , 
    (error, results) => {
        if (error || results.rowCount == 0){
            return response.status(400).json({
                status : 'error',
                message: 'Erro ao recuperar o prédio!'
            });
        }
        response.status(200).json(results.rows[0]);
    })
}

app
    .route('/predios')
    .get(getPredios)
    .post(addPredio)
    .put(updatePredio)

app
    .route('/predios/:codigo')
    .get(getPredioPorCodigo)
    .delete(deletePredio)

app.listen(process.env.PORT || 3002 , () => {
    console.log('Servidor da API rodando....')
})
