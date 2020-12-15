const express = require('express');
const app = express();
const port = 3000;
const timestamp = require('time-stamp');
const bcrypt = require('bcrypt');
const e = require('express');

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

//Create new item
app.post('/api/items', (req, res) => {
  console.log(req.body);
  if (!req.body.username || req.body.username.length < 5) {
    res.status(400)
    .send("Bad Request: Username is required and need to be at least 5 charachters long!")
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
  if (!req.body.price || !Number.isInteger(req.body.price)) {
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
  };
  //If username mathces then user can rewrite item sell ad
  if (putitem.username !== req.body.username) {
    res.status(403).send("Forbidden: Username does not match!")
    return;
  };
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
  const delitem = items.find(d => d.id === parseInt(req.params.id))
  if (!delitem) res.status(404).send('Could not find item with given ID')

  //If username mathces then user can delete item
  if (delitem.username.toLowerCase !== req.body.username.toLowerCase) {
    res.status(403).send("Forbidden: Username does not match!")
    return;
  };
  items.splice((delitem.id - 1), 1);
  res.status(200).send("OK: Item with id \""+ delitem.id +"\" has been deleted.");
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
  const resultitem = items.filter((e) =>
    e[req.params.searchtype]
      .toLowerCase()
      .includes(req.params.keyword.toLowerCase())
  );
  if (resultitem.length > 0) {
    res.status(200).send(resultitem);
  } else {
    res.status(404).send("Not found");
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
    password: "$2b$06$5K2r8e0I.rH8yyfTSpfqau3q8Jvk6r0gGPqO1898RyntxC1EJTbxm",
    email: "rauno59@yle.fi"
  },
  {
    id: 2,
    username: "Matti2",
    password: "$2b$06$/2F8x5AZC9IImjAV6szeFutFeSwISsSaY0nqBTwBsy1iKRq7jdxyy",
    email: "matti2@yle.fi"
  },
  {
    id: 3,
    username: "Jussi69",
    password: "$2b$06$nGRA4mWlnUoIbWvGesMr3epH3oE1Rv6ITWL2XUClg7B16vH/p5NSW",
    email: "jussi69@yle.fi"
  },
];

//GET all users
app.get('/api/users', (req, res) => {
  res.send(users)
});

//GET user by id
app.get('/api/users/:id', (req, res) => {
  const user = users.find(c => c.id === parseInt(req.params.id))
  if (!user) res.status(404).send('Could not find user with given ID')
  res.send(user)
});

//POST user register
app.post('/api/users/', (req, res) => {
  console.log(req.body);
  const usertaken = users.find((e) => e.username === (req.body.username));
  if (usertaken) {
    res.status(409).send("Conflict: Username \""+ req.body.username + "\" is already taken!")
    return;
  }
  if (!req.body.username || req.body.username.length < 5) {
    res.status(400)
    .send("Bad Request: Username is required and need to be at least 5 charachters long!")
    return;
  }
  if (!req.body.password || req.body.password < 5) {
    res.status(400)
    .send("Bad Request: Password is required and need to be at least 5 charachters long!")
    return;
  }
  if (!req.body.email) {
    res.status(400)
    .send("Bad Request: Email is required!")
    return;
  }
  const hashedpwd = bcrypt.hashSync(req.body.password, 6)
  let newuser = {
    id: users.length + 1,
    username: req.body.username,
    password: hashedpwd,
    email: req.body.email
  }
  users.push(newuser)
  res.status(201).send(newuser)
});

//Delete user with ID
app.delete('/api/users/:id', (req, res) => {
  const deluser = users.find(d => d.id === parseInt(req.params.id))
  if (!deluser) {
  res.status(404).send("Not Found: Could not find user with given ID")
  return;
  }
  if (deluser.username !== req.body.username) {
    res.status(400).send("Bad Request: Username does not match!")
    return;
  };
  users.splice((deluser.id - 1), 1);
  res.status(200).send("OK: User \""+ deluser.username +"\" has been deleted.");
});

//PORT
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
