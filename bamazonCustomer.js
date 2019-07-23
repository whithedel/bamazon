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


function options() {
  inquirer
    .prompt([
      {
        type: `list`,
        name: `choice`,
        message: chalk.green.bold(`Pick an option`),
        choices: [`Make a purchase.`, `EXIT`]
      }
    ])
    .then(function(response) {
      var menu = response.choice;
      if (menu === `Make a purchase.`) {
        openStore();
      } else if (menu === `EXIT`) {
        connection.end();
      }
    });
}


connection.connect(function(error) {
  if (error){
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
  options();
});


function openStore(message) {
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
    runStore();
    if (typeof message !== `undefined`) {
      log(message);
    }
  });
}

function validateChoice(choice) {
  var reg = /^\d+$/;
  return reg.test(choice) || "A number should be inputed!";
}

function runStore() {
  inquirer
    .prompt([
      {
        type: "number",
        name: "choiceOfId",
        message: chalk.red.bgCyan.bold(
          "What is the ID of the product you would like to buy?\n"
        ),
        validate: validateChoice
      },
      {
        type: "number",
        name: "amount",
        message: chalk.red.bgCyan.bold(
          "How many would you like to purchase?\n"
        ),
        validate: validateChoice
      }
    ])
    .then(function(response) {
      var id = response.choiceOfId;
      var requestedAmount = response.amount;
      checkStorageForPurchase(id, requestedAmount);
    });
}

function checkStorageForPurchase(id, requestedAmount) {
  connection.query(`select * from products where item_id = ${id}`, function(
    error,
    result
  ) {
    if (error) throw error;

    if (result.length === 0) {
      openStore(`the Item ID select doesn't exist please choose a valid ID`);
    } else {
      var amount = result[0].stock_quantity;
      if (amount < requestedAmount) {
        openStore(
          `Insuficient stock, Unable to fulfill your order. Amount available to sell:${amount}. Please place your order again`
        );
      } else {
        var price = result[0].price;
        var itemName = result[0].product_name;
        connection.query(
          `update products set stock_quantity = ${amount -
            requestedAmount} where item_id = ${id}`,
          function(error, result) {
            if (error) throw error;
            log(
              chalk.green.bold(
                `Congratulations your order has been completed. The total of you order for the purchase of ${itemName} is $${requestedAmount *
                  price}`
              )
            );
            var currentSale = requestedAmount * price;
            updateProductSales(id, currentSale)
            leftInStock(id);
            options()
          }
        );
      }
    }
  });
}

function leftInStock(id) {
  connection.query(`select * from products where item_id = ${id}`, function(
    error,
    result
  ) {
    console.log(
      chalk.magenta.bold(
        `\nHurry if you would like to purchase more, only ${
          result[0].stock_quantity
        } ${result[0].product_name} left in stock.`
      )
    );
  });
}


function updateProductSales(id,currentSale){
    connection.query(`select product_sales from products where item_id = ${id}`, function (error, result){
        if (error) throw error
        var totalItemSales = result[0].product_sales;
        connection.query(`update products set product_sales = ${totalItemSales+currentSale} where item_id = ${id}`)
    })
}


