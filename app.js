//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("succesfull insert");
//   }
// });





const workItems = [];

app.get("/", function(req, res) {




const day = date.getDate();

Item.find({}, function(err, rs){
  if(err){
    console.log(err);
  } else {
    console.log(rs);
    if (rs.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("succesfull insert");
          res.redirect("/")
        }
      });
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: rs});
    }

  }
});



});

app.get("/:customListName", function(req, res){
  const listName = _.capitalize(req.params.customListName);

  List.findOne({name: listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
          name: listName,
          items: defaultItems
        });

        list.save()
        res.redirect("/" + listName)
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })



});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  console.log(listName)

  const newItem = new Item ({
    name: item
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }


});

app.post("/delete", function(req, res){
  const del_item_id = req.body.checkbox;
  const listName  = req.body.listName;
  console.log(listName)

  if (listName === "Today") {
    Item.findByIdAndRemove(del_item_id, function(err){
      if(!err) {
        console.log("delete succesfull");
        res.redirect("/");
      }
    });
  }

  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items :{_id: del_item_id}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
