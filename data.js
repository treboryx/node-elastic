const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://node:9200",
  maxRetries: 5,
  requestTimeout: 60000,
});

const servers = require("./servers.json");
// declare an empty array called bulk
var bulk = [];
//loop through each city and create and push two objects into the array in each loop
//first object sends the index and type you will be saving the data as
//second object is the data you want to index
servers.forEach((server) => {
  bulk.push({
    index: {
      _index: "servers",
    },
  });
  bulk.push(server);
});

const main = async () => {
  const { body: bulkResponse } = await client.bulk({
    refresh: true,
    body: bulk,
  });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  const { body: count } = await client.count({ index: "servers" });
  console.log(count);
};

main();
