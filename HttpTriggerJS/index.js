
var config = {}

config.endpoint = "https://astutecosmosdb.documents.azure.com:443/";
config.primaryKey = "mxFAZEEpuch09juVWsugtlfYpnfFbkjHLzOejDHTsLyV17adqB93bAGgOIFLclg1n9MM9hXDfCyfHEH9EcwHgg==";

config.database = {
    "id": "RaspberryTemperature"
};

config.container = {
    "id": "Temperature"
};

const CosmosClient = require('@azure/cosmos').CosmosClient;
// var express = require("express");
// var bodyParser = require("body-parser");

//const url = require('url');

const endpoint = config.endpoint;
const masterKey = config.primaryKey;

const client = new CosmosClient({ endpoint: endpoint, auth: { masterKey: masterKey } });

const HttpStatusCodes = { NOTFOUND: 404 };

const databaseId = config.database.id;
const containerId = config.container.id;

/**
* Create the database if it does not exist
*/
async function createDatabase() {
    try {
        const { database } = await client.databases.createIfNotExists({ id: databaseId });
        console.log(`Created database:\n${database.id}\n`);
    } catch (error) {
        console.log(error);
    }
}

/**
* Read the database definition
*/
async function readDatabase() {
    const { body: databaseDefinition } = await client.database(databaseId).read();
    console.log(`Reading database:\n${databaseDefinition.id}\n`);
}

/**
* Exit the app with a prompt
* @param {message} message - The message to display
*/
function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

/**
* Create the container if it does not exist
*/
async function createContainer() {
    const { container } = await client.database(databaseId).containers.createIfNotExists({ id: containerId });
    console.log(`Created container:\n${config.container.id}\n`);
}

/**
* Read the container definition
*/
async function readContainer() {
    const { body: containerDefinition } = await client.database(databaseId).container(containerId).read();
    console.log(`Reading container:\n${containerDefinition.id}\n`);
}

// make the DB query
async function queryContainer() {
    console.log(`Querying container:\n${config.container.id}`);

    const querySpec = {
        query: "SELECT * FROM root r where r.temperature >0 and r.humidity>0"//* FROM Temperature r where r.tmperature >0 and r.humidity>0"
    };

    var resultsOut = [], i = 1, limit = 500000;

    const { result: results } = await client.database(databaseId).container(containerId).items.query(querySpec).toArray();
    for (var queryResult of results) {

        resultsOut.push(queryResult);

        if (i === limit)
            break;
        i++;
    }
    return resultsOut;
};

createDatabase()
    .then(() => readDatabase())

    .then(() => createContainer())
    .then(() => readContainer())

    .then(() => { exit(`DB Connection Completed successfully`); })

    .catch((error) => {
        exit(`Completed with error ${JSON.stringify(error)}`)
    });

module.exports = async function (context, req) {

    var output = await queryContainer();
    context.res = {
        status: 200,
        body: output
    };
};

