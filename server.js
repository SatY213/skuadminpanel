// On implémente les deux modules express et mongoose
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// On instanciie l'objet express

const app = express();

// On connect a la base de données NoSql MongoDb
mongoose
  .connect(process.env.MONGO_URI)
  // {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // }
  .then(() => {
    console.log("Connected to the MongoDB ");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// Middleware
app.use(express.json());
// Enable CORS with specific options
app.use(
  cors({
    // origin: "http://127.0.0.1:5173", // Replace with your allowed origin
    // methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed HTTP methods
    allowedHeaders: ["Content-Type", "x-auth-token"], // Specify the allowed headers
    credentials: true, // Enable sending cookies with CORS requests
  })
);

//
// Import et utiliser le router
const authRouter = require("./routes/web");
app.use("/api", authRouter);
// Serve static files
app.use("/uploads", express.static("uploads"));

// On spécifie le port du server et on instancie l'application
const port = 8083;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
