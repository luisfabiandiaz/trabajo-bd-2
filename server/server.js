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
    },
    timeout: 100000
});

const dbname='trabajofianlbd2';
couch.listDatabases().then(function(dbs){
    console.log(dbs);
})

const app= express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function calculateTimeOnAir(airedDate) {
    let startDate, endDate;
    if (!airedDate) {
        return 'Fecha de emisión no disponible';
    }
    if (airedDate.includes(" to ")) {
        const dates = airedDate.split(" to ");
        startDate = new Date(dates[0]);
        endDate = dates[1].trim() === "?" ? null : new Date(dates[1]);
    } else {
        startDate = new Date(airedDate);
        endDate = new Date();
    }

    if (isNaN(startDate) || (endDate && isNaN(endDate))) {
        return 'Fecha de emisión no válida';
    }

    if (!endDate) {
        return 'Desconocido';
    }

    const timeDiff = endDate - startDate;
    const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

    return `${years} años, ${months} meses, y ${days} días`;
}

app.post('/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const limit = parseInt(req.body.limit) || 20;
    const skip = parseInt(req.body.skip) || 0;

    if (!searchTerm || searchTerm.trim() === "") {
        return res.status(400).json({ error: 'El término de búsqueda es obligatorio' });
    }

    const mangoQuery = {
        selector: {
            Name: { "$regex": `(?i)${searchTerm}` } // Busca el término en el campo "Name"
        },
        limit: limit,
        skip: skip
    };

    try {
        const { data } = await couch.mango(dbname, mangoQuery, {});
        if (data.docs.length === 0) {
            res.status(404).json({ error: 'No se encontraron resultados' });
        } else {
            const enrichedDocs = data.docs.map(doc => {
                return {
                    ...doc,
                    timeOnAir: calculateTimeOnAir(doc.Aired)
                };
            });
            res.json(enrichedDocs);
        }
    } catch (err) {
        console.error('Error al realizar la búsqueda:', err);
        res.status(500).json({ error: 'Error al realizar la búsqueda.' });
    }
});

app.get('/top_animes', async (req, res) => {
    const mangoQuery = {
        selector: {
            Popularity: { "$gte": 0 },
        },
        sort: [{ "Popularity": "desc" }],
        limit: 10,
        use_index: "popularity-index"
    };

    try {
        // Obtener la lista de animes
        const animesResponse = await couch.mango(dbname, mangoQuery, {});
        if (!animesResponse.data || !animesResponse.data.docs) {
            throw new Error('Respuesta inesperada del servidor CouchDB al obtener animes');
        }

        const animes = animesResponse.data.docs;

        // Obtener los IDs de los animes
        const animeIds = animes.map(anime => anime.MAL_ID);

        // Crear la consulta para obtener las sinopsis
        const sinopsisQuery = {
            selector: {
                sypnopsis: { "$exists": true },
                MAL_ID: { "$in": animeIds },
            }
        };

        const sinopsisResponse = await couch.mango(dbname, sinopsisQuery, {});

        if (!sinopsisResponse.data || !sinopsisResponse.data.docs) {
            throw new Error('Respuesta inesperada del servidor CouchDB al obtener sinopsis');
        }

        // Crear un mapa de sinopsis
        const sinopsisMap = sinopsisResponse.data.docs.reduce((map, doc) => {
            map[doc.MAL_ID] = doc.sypnopsis;
            return map;
        }, {});

        // Combinar animes con sus sinopsis
        const animesConSinopsis = animes.map(anime => ({
            ...anime,
            sypnopsis: sinopsisMap[anime.MAL_ID] || 'Sin sinopsis disponible'
        }));

        res.json(animesConSinopsis);
    } catch (err) {
        console.error('Error al obtener los animes con sinopsis:', err.message, err.body);
        res.status(500).json({ error: 'Error al obtener los animes con sinopsis.', details: err.message });
    }
});

app.get('/animes_ninos', async (req, res) => {
    const mangoQuery = {
        selector: {
            Popularity: { "$gte": 0 },
            Rating: {"$eq": "PG-13 - Teens 13 or older"}
        },
        sort: [{ "Popularity": "desc" }],
        limit: 10,
        use_index: "popularity-index"  
    };

    console.log('Consulta Mango:', JSON.stringify(mangoQuery));

    try {
        const response = await couch.mango(dbname, mangoQuery, {});
        console.log('Respuesta de CouchDB:', response);
        if (response.data && response.data.docs) {
            const enrichedDocs = response.data.docs.map(doc => {
                return {
                    ...doc,
                    timeOnAir: calculateTimeOnAir(doc.Aired)
                };
            });

            res.json(enrichedDocs);
        } else {
            throw new Error('Respuesta inesperada del servidor CouchDB');
        }
    } catch (err) {
        console.error('Error al obtener los mejores animes:', err.message, err.body);
        res.status(500).json({ error: 'Error al obtener los mejores animes.', details: err.message });
    }
});


app.get('/top_peores', async (req, res) => {
    const mangoQuery = {
        selector: {
            Popularity: { "$gte": 0 }
        },
        sort: [{ "Popularity": "asc" }],
        limit: 10,
        use_index: "popularity-index"  
    };

    console.log('Consulta Mango:', JSON.stringify(mangoQuery));

    try {
        const response = await couch.mango(dbname, mangoQuery, {});
        console.log('Respuesta de CouchDB:', response);

        if (response.data && response.data.docs) {
            const enrichedDocs = response.data.docs.map(doc => {
                return {
                    ...doc,
                    timeOnAir: calculateTimeOnAir(doc.Aired)
                };
            });

            res.json(enrichedDocs);
        } else {
            throw new Error('Respuesta inesperada del servidor CouchDB');
        }
    } catch (err) {
        console.error('Error al obtener los mejores animes:', err.message, err.body);
        res.status(500).json({ error: 'Error al obtener los mejores animes.', details: err.message });
    }
});

app.listen(5000, () => {console.log("Server starter on 5000")})