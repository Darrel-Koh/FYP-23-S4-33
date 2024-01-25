// server.mjs
import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import records from "./routes/record.mjs";
import user from "./routes/record2.mjs";
import loginRouter from "./routes/login.mjs";
import {db, bullsdb} from "../server/db/conn.mjs"
import glossary from "./routes/glossaryGet.mjs";
import mainpage from "./routes/mainpage.mjs";
import searchRoute from "./routes/searchRoute.mjs";
import compression from 'compression';

const PORT = 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());

app.use("/record", records);
app.use("/user", user)
app.use("/login", loginRouter);
app.use("/api/data", mainpage);
app.use("/api/search", mainpage);



app.get('/db-test', async (req, res) => {
  try {
    let collection = await bullsdb.collection("users");
    let results = await collection.find({}).limit(1).toArray();
    res.status(200).send('Database connection successful');
  } catch (error) {
    res.status(500).send('Database connection failed');
  }
});app.use("/glossary", glossary);



// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
