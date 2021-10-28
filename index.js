const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//database uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssjib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log('connected to database');
        const database = client.db('foodShop');
        const productCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        //Get All Product API
        app.get('/products', async (req, res) => {
            const result = await productCollection.find({}).toArray();
            res.send(result);

        })

        //GET Single Product
        app.get("/singleProduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            // console.log(result);
            res.json(result);

        });

        //POST API
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            console.log('hit the api', product);
            const result = await productCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        //DELETE Product
        app.delete("/deleteProduct/:id", async (req, res) => {

            const result = await productCollection.deleteOne({
                _id: ObjectId(req.params.id)

            });
            console.log(result);
            res.send(result);

        })

     

        //UPDATE Products
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    name: updatedInfo.name,
                    price: updatedInfo.price,
                    description: updatedInfo.description
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc)
            //console.log('updating user', id);
            res.json(result);
        });


        //ADD Order Product
        app.post('/addOrder', (req, res) => {
            console.log(req.body);
            ordersCollection.insertOne(req.body).then(result => {
                res.send(result);
            });
        });


        //GET MyOrders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Node Server Running');
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});
