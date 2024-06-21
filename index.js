const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@coffee-mate-admin.bc6uphr.mongodb.net/?retryWrites=true&w=majority&appName=coffee-mate-admin`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Database information
    const database = client.db("coffeeDB");
    const products = database.collection("products");

    // API for insert new product
    app.post("/add-coffee", async (req, res) => {
      const product = req.body;
      const result = await products.insertOne(product);
      res.send(result);
    });

    // API for get all product
    app.get("/", async (req, res) => {
      const cursor = products.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // API for get a single product
    app.get("/view-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await products.findOne(query);
      res.send(product);
    });

    // API for update product
    app.put("/view-product/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateProduct = {
        $set: {
          name: product.name,
          chef: product.chef,
          supplier: product.supplier,
          taste: product.taste,
          category: product.category,
          price: product.price,
        },
      };

      // API for delete product
      app.delete("/view-product/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await products.deleteOne(query);
        res.send(result);
      });

      const result = await products.updateOne(filter, updateProduct, option);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
