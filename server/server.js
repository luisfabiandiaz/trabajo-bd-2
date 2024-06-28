const express = require('express')

const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb= require('node-couchdb');

const couch = new NodeCouchDb({
    host: '127.0.0.1',
    protocol: 'http',
    port: 5984,
    auth: {
        user: 'admin',
        pass: 'admin'
    }
});

const dbname='trabajofianlbd2';
const viewUrl='/_design/all_view/_view/all_games';
couch.listDatabases().then(function(dbs){
    console.log(dbs);
})

const app= express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/api", (req, res) => {
    couch.get(dbname, viewUrl).then(
        function(data, headers, status) {
            console.log(data);
            // Extraer todos los datos
            const games = data.data.rows.map(row => row.value);
            res.json(games); // Enviar todos los objetos como un array
        },
        function(err) {
            console.error('Error al obtener los datos de la vista:', err);
            res.status(500).send(err);
        }
    );
});


app.listen(5000, () => {console.log("Server starter on 5000")})