const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://node:9200",
  maxRetries: 5,
  requestTimeout: 60000,
});

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

const main = async () => {
  try {
    await client.ping().then((r) => r);
    console.log("elastic online");
  } catch (e) {
    console.log("it's down");
  }
};

main();

app.use(express.json());
app.set("port", process.env.PORT || 3001);

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.get("/search", async function (req, res) {
  const { body } = await client.search({
    index: "servers",
    body: {
      query: {
        multi_match: {
          fields: ["name", "country", "desc.short"],
          query: req.query.q,
          fuzziness: "AUTO",
        },
      },
    },
  });
  res.send(body.hits);
});
app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
