//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash")

// database connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://taha:taha@cluster0.2tc1lsy.mongodb.net/todolistDB", (err) => {
  if (err) { console.log("Not Connetd"); }
  else { console.log("connected"); }
});

const itemsSchema = mongoose.Schema({
  name: String,
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome To Todo List App"
})

const item2 = new Item({
  name: "This will Add a todo +"
})

const item3 = new Item({
  name: "To Delete Click Here"
})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)
// database

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function (req, res) {

  Item.find({}, (err, founditems) => {
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (!err) { console.log("Error"); }
        else {
          console.log("Successfully Inserted");
        }
      })
      res.redirect('/')
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }

  })


});




app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  })
  if (listName === "Today") {
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }




});

app.post("/delete", function (req, res) {
  const checkeditemid = req.body.Checkbox;
  const listName = req.body.listName;
if(listName === "Today"){
  Item.findByIdAndRemove(checkeditemid, function (err) {
    if (!err) {
      console.log("Deleted");
      res.redirect("/");
    }
  })
}
else{
  List.findOneAndUpdate({ name :listName},{ $pull:{items:{_id:checkeditemid}}},(err,foundList)=>{
    if(!err){
      res.redirect("/" + listName);
    }
  })
}



 
})




app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list 
        const list = new List({
          name: customListName,
          items: defaultItems,
        })
        list.save();
        res.redirect("/" + customListName)
      }
      else {
        // show existing list 
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })


})



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
