const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://user-aditya:QHRZPR2SPw9xPghs@cluster0.svp75lg.mongodb.net/todolistDB?retryWrites=true&w=majority"
);

async function getItems() {
  const Items = await Item.find({});
  return Items;
}

const itemSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to todoList.",
});

const item2 = new Item({
  name: "Click on the + button to add an item.",
});

const item3 = new Item({
  name: "<-- hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  getItems().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        items: foundItems,
      });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((data) => {
    if (!data) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    }
    if (data) {
      res.render("list", {
        listTitle: customListName,
        items: data.items,
      });
    }
  });
});

app.post("/delete", async (req, res) => {
  const listName = _.capitalize(req.body.listName);
  const checkedItemId = req.body.checkbox;

  if (listName === "Today") {
    try {
      await Item.deleteOne({ _id: checkedItemId });
      res.redirect("/");
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    } catch (err) {
      console.error(err);
    }
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((data) => {
      if (data) {
        data.items.push(item);
        data.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", items: workItems });
});

app.post("/work", function (req, res) {
  res.redirect("/work");
});

app.listen(3000, function () {
  console.log("The server is running on port 3000.");
});
