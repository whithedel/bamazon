var inquirer = require(`inquirer`);
var mysql = require(`mysql`);
require("dotenv").config();
var { table } = require("table");
var chalk = require("chalk");
var log = console.log;

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect(function(error) {
  if (error) throw error;
  setOfMenuOptions();
});

function setOfMenuOptions(message) {
  inquirer
    .prompt([
      {
        type: `list`,
        name: `menu`,
        message: chalk.green.bold(`Choose a menu`),
        choices: [
          `View Products for Sale`,
          `View Low Inventory`,
          `Add to Inventory`,
          `Add New Product`
        ]
      }
    ])
    .then(function(response) {
      var menu = response.menu;
      if (menu === `View Products for Sale`) {
        viewProductsForSale();
      } else if (menu === `View Low Inventory`) {
        viewLowInventory();
      } else if (menu === `Add to Inventory`) {
        addToInventory();
      } else if (menu === `Add New Product`) {
        confirmAddNewProduct();
      }
    });
  if (typeof message !== `undefined`) {
    log(message);
  }
}

function viewProductsForSale() {
  connection.query(`select * from products`, function(error, result) {
    if (error) throw error;
    result.forEach(function(data, index) {
      let config, productInfo, outputProducts;

      productInfo = [
        [`ID`, "Items", "Department", "Price", "Items left in stock"],
        [
          `${chalk.blue.bold(data.item_id)}`,
          `${data.product_name}`,
          `${chalk.blue.bold(data.department_name)}`,
          `${chalk.black.bgRed.bold(data.price)}`,
          `${chalk.blue.bold(data.stock_quantity)}`
        ]
      ];

      config = {
        columns: {
          0: {
            alignment: "left",
            width: 10
          },
          1: {
            alignment: "center",
            width: 10
          },
          2: {
            alignment: "right",
            width: 10
          }
        }
      };
      outputProducts = table(productInfo, config);
      log(outputProducts);
    });
    setOfMenuOptions();
  });
}

function viewLowInventory() {
  connection.query(`select * from products where stock_quantity < 5`, function(error,result) {
    if (error) throw error;
    result.forEach(function(data, index) {
      let config, productInfo, outputProducts;

      productInfo = [
        [`ID`, "Items", "Department", "Price", "Items left in stock"],
        [
          `${chalk.blue.bold(data.item_id)}`,
          `${data.product_name}`,
          `${chalk.blue.bold(data.department_name)}`,
          `${chalk.black.bgRed.bold(data.price)}`,
          `${chalk.blue.bold(data.stock_quantity)}`
        ]
      ];

      config = {
        columns: {
          0: {
            alignment: "left",
            width: 10
          },
          1: {
            alignment: "center",
            width: 10
          },
          2: {
            alignment: "right",
            width: 10
          }
        }
      };
      outputProducts = table(productInfo, config);
      log(outputProducts);
    });
    setOfMenuOptions();
  });
}

function validateChoice(choice) {
  var reg = /^\d+$/;
  return reg.test(choice) || chalk.red.bold("A whole number should be inputed!");
}
function validateCurrency(currency)
        {
            
            var currencyFormat = /^\d+(\.\d{1,9})?$/;
      
      if( currencyFormat.test(currency) != true)
      {
      log(chalk.red.bold("Currency must be correct format"));
      return false;
      }
      
      return true;
      
        }

function addToInventory() {
  inquirer
    .prompt([
      {
        type: `number`,
        name: `id`,
        message: `What is the ID of the product you would like to add too?`,
        validate: validateChoice
      },
      {
        type: `number`,
        name: `amount`,
        message: `How much would you like to add in your inventory?`,
        validate: validateChoice
      }
    ])
    .then(function(response) {
      var id = response.id;
      var amount = response.amount;
      connection.query(`select * from products where item_id = ${id}`, function(
        error,
        result
      ) {
        if (error) throw error;
        if (result.length === 0) {
          log(`the Item ID select doesn't exist please choose a valid ID\n`);
          addToInventory();
        } else {
          var stock_quantity = result[0].stock_quantity;
          var name = result[0].product_name;
          connection.query(
            `update products set stock_quantity = stock_quantity + ${amount} where item_id = ${id}`,
            function(error, secondResult) {
              if (error) throw error;
              setOfMenuOptions(
                chalk.magenta.bold(
                  `\nYou currently have ${stock_quantity +
                    amount} ${name} in stock.\n`
                )
              );
            }
          );
        }
      });
    });
}

function confirmAddNewProduct() {
  inquirer
    .prompt([
      {
        type: `confirm`,
        name: `confirm`,
        message: chalk.magenta.bold(
          `Are you sure you would like to add a new product?\n`
        ),
        default: true
      }
    ])
    .then(function(response) {
      if (response.confirm) {
        addNewProduct()
      } else {
        setOfMenuOptions();
      }
    });
}

function addNewProduct() {
  inquirer.prompt([
    {
      type: `input`,
      name: `product_name`,
      message: chalk.magenta.bold(
        `\nwhat is the name of the product you would like to add\n`
      )
    },
    {
      type: `input`,
      name: `department_name`,
      message: chalk.magenta.bold(
        `\nWhat department will this product be added?\n`
      )
    },
    {
      type: `number`,
      name: `price`,
      message: chalk.magenta.bold(
        `\nInsert the price, which this product will be sold for.\n`
      ),
      validate: validateCurrency
    },
    {
      type: `number`,
      name: `stock_quantity`,
      message: chalk.magenta.bold(
        `\nHow many units is being added to the inventory?\n`
      ),
      validate: validateChoice
    }
  ])
  .then(function(response){
      var name =  response.product_name;
      var department = response.department_name;
      var price = response.price;
      var stock = response.stock_quantity;
      log(response)
      connection.query(
          `insert into products ( product_name, department_name, price, stock_quantity )
           values ('${name}', '${department}', ${price}, ${stock})`,
           function(error, result){
               if (error) throw error;
            //    log(result);
               log(chalk.black.bgGreen.bold(`You have successfully added the product below.↓↓`))
            let config, productInfo, outputProducts;

      productInfo = [
        [`ID`, "Items", "Department", "Price", "Items left in stock"],
        [
          `${chalk.blue.bold(result.insertId)}`,
          `${name}`,
          `${chalk.blue.bold(department)}`,
          `${chalk.black.bgRed.bold(price)}`,
          `${chalk.blue.bold(stock)}`
        ]
      ];

      config = {
        columns: {
          0: {
            alignment: "left",
            width: 10
          },
          1: {
            alignment: "center",
            width: 10
          },
          2: {
            alignment: "right",
            width: 10
          }
        }
      };
      outputProducts = table(productInfo, config);
      log(outputProducts);
      setOfMenuOptions()
           }
      )
  })
}
