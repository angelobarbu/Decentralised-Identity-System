const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const identityRoutes = require("./routes/identityRoutes");
const documentRoutes = require("./routes/documentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/identity", identityRoutes);
app.use("/document", documentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
