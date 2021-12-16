const connectDb = require("./db/db");
const usersRouter = require("./routes/users");
const express = require("express");
const cors = require("cors");
const app = express();

connectDb();


//TODO: Add appropriate schemas/models to the models folder.
//! NOTE - you can modify the user.js schema, but make sure to adjust validation accordingly!
//TODO: Add routes to the routes folder. By convention, there should be a file for each schema/model
//! NOTE - for each route file, don't forget to import your router into index.js and add a new app.use statement below!

app.use(cors());
app.use(express.json());
app.use(`/api/users`, usersRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
