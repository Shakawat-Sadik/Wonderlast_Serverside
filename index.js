import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ObjectId } from "mongodb";

dotenv.config();
const app = express();

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server has started");
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    console.log("Connected to MongoDB");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    const dataCol = client.db("Wonderlast").collection("allThatRemains");

    app.post("/destinations", async (req, res) => {
      const newDestination = req.body;
      console.log(newDestination);

      const result = await dataCol.insertOne(newDestination);

      res.json(result);
    });

    app.get("/destinations", async (req, res) => {
      const result = await dataCol.find().toArray();

      res.send(result);
    });

    app.get("/destinations/:id", async (req, res) => {
      const {id} = req.params;
      console.log(req.params)
      const result = await dataCol.find(
        {
            _id: new ObjectId(id)
        }
      ).toArray();

      res.json(result[0]);
    });

    app.patch("/destinations/:id", async (req, res) => {
        const {id} = req.params;
        const editedDestination = req.body;
        const result = await dataCol.updateOne (
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    editedDestination
                }
            }
        )
    })
    //==========================================================================

    app.patch("/destinations", async (req, res) => {
      try{
        const change = dataCol.updateMany(
        {
          "workspace-description": { $exists: true },
        },
        {
          $rename: { "workspace-description": "description" },
        },
      );

      await res.json({
        message:"Updated Successfully",
        modifiedCount: change.modifiedCount
      })
      } catch (e){
        console.error(e);
        res.status(500).json({ error: "Failed to update documents" });
      }
    });
    /*
    Then run `curl -X PATCH http://localhost:5000/destinations` in bash terminal.
    If succeeded, bash will return `{"message":"Updated Successfully"}`.
    Easy peasy, no PostMan required
    */

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};

run()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(console.dir);
