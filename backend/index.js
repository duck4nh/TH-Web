const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");
const FriendRouter = require("./routes/FriendRouter");

dbConnect();

app.use(
  cors({
    origin: "https://6h2l5v-3000.csb.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api", CommentRouter);
app.use("/api/admin", AdminRouter);
app.use("/api", FriendRouter);


app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API! lmao" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
