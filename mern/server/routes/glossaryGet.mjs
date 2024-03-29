// glossaryGet.mjs
import express from "express";
import {bullsdb} from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// This section will help you get a list of all the glossary terms and desc records.
router.get("/", async (req, res) => {
  let collection = await bullsdb.collection("glossary");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single glossary details by id.
router.get("/:id", async (req, res) => {
    let collection = await bullsdb.collection("glossary");
    let query = {_id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);
  
    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  });

export default router;
