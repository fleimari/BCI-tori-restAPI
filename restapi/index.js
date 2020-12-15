const express = require('express');
const app = express();
const port = 3000;
const timestamp = require('time-stamp');
const bcrypt = require('bcrypt');

app.use(express.json());

//Start page
app.get('/api', (req, res) => {
  res.send('BCI Tori API by Lasse Kangas - t3kala01');
});

/*********************************************
* ITEM ENDPOINTS
********************************************/
//Test items
let items = [
  {
    id: 1,
    username: "Rauno59",
    title: "Gibson guitar",
    description: "Selling nice Les Paul from 1985",
    category: "Music",
    location: "Oulu",
    price: 1300,
    date: "10.12.2020 14:00:00",
    deliverytype: "Shipping",
    telephone: "0401231231",
  },
  {
    id: 2,
    username: "Matti2",
    title: "Green Volvo E2",
    description: "Big van car for sale. Tires included",
    category: "Car",
    location: "Vaasa",
    price: 9500,
    date: "7.12.2020 14:00:00",
    deliverytype: "Pickup",
    telephone: "0401111111",
  },
  {
    id: 3,
    username: "Jussi69",
    title: "Drumkit",
    description: "Complete but used drumkit for sale",
    category: "Music",
    location: "Helsinki",
    price: 5800,
    date: "10.12.2020 18:30:00",
    deliverytype: "Pickup",
    telephone: "0406969696",
  },
  {
    id: 4,
    username: "Rauno59",
    title: "Motorbike",
    description: "Retro Harley Davidson from America",
    category: "Car",
    location: "Oulu",
    price: 18000,
    date: "1.11.2020 14:00:00",
    deliverytype: "Shipping",
    telephone: "0401231231",
  }
];

//Get all items
app.get('/api/items', (req, res) => {
  res.send(items);
});

//Get item by id
app.get('/api/items/:id', (req, res) => {
  const item = items.find(c => c.id === parseInt(req.params.id))
  if (!item) res.status(404).send('Could not find item with given ID')
  res.send(item)
});

//Post new item
app.post('/api/items', (req, res) => {
  console.log(req.body);
  // 400 Bad Request
  if ("username" in req.body == false) {
    res.status(400).send("Bad Request: Username is required!")
    return;
  }
  if (!req.body.title) {
    res.status(400).send("Bad Request: Title is required!")
    return;
  }
  if (!req.body.description) {
    res.status(400).send("Bad Request: Description is required!")
    return;
  }
  if (!req.body.category) {
    res.status(400).send("Bad Request: Category is required!")
    return;
  }
  if (!req.body.location) {
    res.status(400).send("Bad Request: Location is required!")
    return;
  }
  // || !Number.isInteger(price)
  if (!req.body.price) {
    res.status(400).send("Bad Request: Price is required in integers!")
    return;
  }
  const newitem = {
    id: items.length + 1,
    username: req.body.username,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    location: req.body.location,
    price: req.body.price,
    date: timestamp('DD.MM.YYYY HH:mm:ss'),
    deliverytype: req.body.deliverytype,
    telephone:  req.body.telephone,
    //image:
  };
  items.push(newitem);
  res.status(201).send(newitem);
});

//Update item
app.put('/api/items/:id', (req, res) => {
  const putitem = items.find((p) => p.id == (req.params.id));
  if (!putitem) {
    res.status(404).send('Could not find item with given ID')
    return;
  }
  
  //If username mathces then user can rewrite item sell ad
  if (putitem.username !== req.body.username) {
    res.status(403).send("Forbidden: Username does not match!")
    return;
  }
  
  let mod = false;
    for (const key in req.body) {
      if (key in putitem) {
        putitem[key] = req.body[key];
        mod = true;
      }
    };

    if (mod) {
      res.status(200).json(putitem);
    } else {
      res.status(400).send("Bad Request")
    }
});

//Delete item with ID
app.delete('/api/items/:id', (req, res) => {
  const item = items.find(d => d.id === parseInt(req.params.id))
  if (!item) res.status(404).send('Could not find item with given ID')

  //If username mathces then user can delete item sell ad
  if (item.username !== req.body.username) {
    res.status(403).send("Forbidden: Username does not match!")
    return;
  };
  items.splice(d);
  res.send(item)
});

//Search item with parameters
app.get('/api/items/search/:searchtype/:keyword', (req, res) => {
  if (
    req.params.searchtype.toLowerCase() !== "category" &&
    req.params.searchtype.toLowerCase() !== "location" &&
    req.params.searchtype.toLowerCase() !== "date"
  ) {
    res.status(400).send("Bad Request: Searchtype not supported");
    return;
  };

  const results = items.filter((e) =>
    e[req.params.searchtype]
      .toLowerCase()
      .includes(req.params.keyword.toLowerCase())
  );

  if (results.length > 0) {
    res.status(200).send({ results });
  } else {
    res.status(404).send("No results found");
  }
});


/*********************************************
* USER ENDPOINTS
********************************************/
//Test users
let users = [
  {
    id: 1,
    username: "Rauno59",
    password: "Metsastys2",
    email: "rauno@yle.fi"
  },
  {
    id: 2,
    username: "Matti2",
    password: "Kalastus5",
    email: "rauno@yle.fi"
  },
  {
    id: 3,
    username: "Jussi69",
    password: "Hiihto10",
    email: "rauno@yle.fi"
  },
];

//GET all users
app.get('/users', (req, res) => {
  res.send(users)
})

//POST user register
app.post('/users/register', (req, res) => {
  console.log(req.body);
  // 400 Bad request
  if (!req.body.username) {
    res.status(400).send("Bad Request: Username is required!")
    return;
  }
  if (!req.body.password) {
    res.status(400).send("Bad Request: password is required!")
    return;
  }
  if (!req.body.email) {
    res.status(400).send("Bad Request: Email is required!")
    return;
  }

  const hashedpwd = bcrypt.hashSync(password, 6)
  let user = {
    id: users.length + 1,
    username: req.body.username,
    password: hashedpwd
  }
  users.push(user)
  res.status(201).send(user)
});


//PORT
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
