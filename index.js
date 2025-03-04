const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// middlewere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.3umb5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // assignment collection
    const assignmentCollection = client
      .db('assignmentDb')
      .collection('assignment');
    // user collection
    const userCollection = client.db('assignmentDb').collection('users');
    // pending assignmetn
    const assignmentSubmitCollection = client.db('assignmentDb').collection('submit');

    // all data load
    app.get('/assignment', async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result);
    });
    // for specific data load
    app.get('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });
    // for update data
    app.patch('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const assignmentData = req.body;
      const filter = { _id: new ObjectId(id) };
      console.log(filter);

      const updateDoc = {
        $set: {
          title: assignmentData.title,
          date: assignmentData.date,
          difficulty: assignmentData.difficulty,
          description: assignmentData.description,
          marks: assignmentData.marks,
          image: assignmentData.image,
        },
      };
      console.log(updateDoc);

      const result = await assignmentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // for delete data
    app.delete('/assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });
    // post data to ui
    app.post('/assignment', async (req, res) => {
      const assignmentData = req.body;
      // console.log(assignmentData);
      const result = await assignmentCollection.insertOne(assignmentData);
      res.send(result);
    });
    // assignment submit
    app.post('/submit', async (req, res) => {
      const newAssignment = req.body;
      const newSubmit = {
        ...newAssignment,
        status: 'pending'
      }
      console.log(newSubmit);
      
      const result =await assignmentSubmitCollection.insertOne(newSubmit)
      res.send(result)
    });

    // user collection
    app.get('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.find(user).toArray();
      res.send(result);
    });
    app.post('/users', async (req, res) => {
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('online group study is running');
});

app.listen(port, () => {
  console.log(`online group study is running on port ${port} `);
});
