const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjkgo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{
        await client.connect();
        const database = client.db("zeroPoint");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection('orders')
        const reviewsCollection = database.collection('reviews')
        const usersCollection = database.collection('users')

        // DELETE API
        app.delete('/deletePatient/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)}
          const result = await ordersCollection.deleteOne(query)
          res.json(result)
        });

        // Get admin api
        app.get('/users/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if (user?.role === 'admin') {
              isAdmin = true;
          }
          res.json({ admin: isAdmin });
        })

        // GET API
        app.get('/products', async(req, res) => {
          const cursor = productsCollection.find({})
          const products = await cursor.toArray()
          res.send(products)
        })
        // Post api
        app.post('/addProduct', async(req, res) => {
          const newProduct = req.body;
          const result = await productsCollection.insertOne(newProduct)
          res.json(result)
        })
        // GET Single Product
        app.get('/product/:id',async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)}
          const product = await productsCollection.findOne(query)
          res.json(product)
        })
        // Add Orders API
        app.post('/orders', async(req, res) => {
          const order = req.body;
          const result = await ordersCollection.insertOne(order)
          res.json(result)
        })
        // GET MyOrder Api
        app.get('/orders', async(req, res) => {
          const email = req.query.email;
          const query = { email:email }
          const cursor = ordersCollection.find(query)
          const orders = await cursor.toArray()
          res.send(orders)
        })
        // Get Review api
        app.get('/reviews', async(req, res) => {
          const cursor = reviewsCollection.find({})
          const reviews = await cursor.toArray()
          res.send(reviews)
        })
        // Post Review api
        app.post('/addReview', async(req, res) => {
          const newReview = req.body;
          const result = await reviewsCollection.insertOne(newReview)
          res.json(result)
        })
      // Post users api
      app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.json(result)
      })
      // Get Manage All Orders
      app.get('/allorders', async(req, res) => {
        const cursor = ordersCollection.find({})
        const orders = await cursor.toArray()
        res.send(orders)
    })

      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      })

        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email}
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter,updateDoc)
          res.json(result)
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at:${port}`)
})