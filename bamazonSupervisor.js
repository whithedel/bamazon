//dependencies
var inquirer = require(`inquirer`);
var mysql = require(`mysql`);
var { table } = require("table");
var chalk = require("chalk");
require("dotenv").config();
var log = console.log;

//setting up my connection.
if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DB_DATABASE
  });
}

//fires the connection to MySql database
connection.connect(function(error) {
  if (error) throw error;
  setOfMenuOptions();
});

//function to trigger a menu options
function setOfMenuOptions(message) {
  inquirer
    .prompt([
      {
        type: `list`,
        name: `menu`,
        message: chalk.green.bold(`Choose a menu`),
        choices: [
          `View Product Sales by Department`,
          `Create New Department`,
          `EXIT`
        ]
      }
    ])
    .then(function(response) {
      var menu = response.menu;
      if (menu === `View Product Sales by Department`) {
        viewProductSalesByDepartment();
      } else if (menu === `Create New Department`) {
        confirmCreateNewDepartment();
      } else if (menu === `EXIT`) {
        connection.end();
      }
    });
  if (typeof message !== `undefined`) {
    log(message);
  }
}

//function to send a query to the database to be able to return a table to view product sales by department.
function viewProductSalesByDepartment() {
  connection.query(
    `select departments.department_id , 
      departments.department_name, 
      departments.over_head_costs , 
      sum(products.product_sales) , 
      (sum(products.product_sales) - departments.over_head_costs)   
      from departments
      left join products on products.department_name=departments.department_name
      group by  departments.department_id
      order by departments.department_id asc`,
    function(error, result) {
      result.forEach(function(data, index, array) {
        var productSales = data[`sum(products.product_sales)`];
        var totalProfit =
          data[`(sum(products.product_sales) - departments.over_head_costs)`];
        var departmentId = data.department_id;
        var departmentName = data.department_name;
        var overHeadCost = data.over_head_costs;

        let config, productInfo, outputProducts;

        productInfo = [
          [
            `Department ID`,
            "Department Name",
            "Over Head Costs",
            "Product Sales",
            "Total Profit"
          ],
          [
            `${chalk.blue.bold(departmentId)}`,
            `${chalk.blue.bold(departmentName)}`,
            `${chalk.blue.bold(overHeadCost)}`,
            `${chalk.black.bgRed.bold(productSales)}`,
            `${chalk.blue.bold(totalProfit)}`
          ]
        ];

        config = {
          columns: {
            0: {
              alignment: "center",
              width: 15
            },
            1: {
              alignment: "center",
              width: 15
            },
            2: {
              alignment: "right",
              width: 15
            }
          }
        };
        outputProducts = table(productInfo, config);
        log(outputProducts);
      });
      setOfMenuOptions();
    }
  );
}

//function to validata a currency format.
function validateCurrency(currency) {
  var currencyFormat = /^\d+(\.\d{1,9})?$/;

  if (currencyFormat.test(currency) != true) {
    log(chalk.red.bold("Currency must be correct format"));
    return false;
  }

  return true;
}

//function to confirm a users action
function confirmCreateNewDepartment() {
  inquirer
    .prompt([
      {
        type: `confirm`,
        name: `confirm`,
        message: chalk.magenta.bold(
          `Are you sure you would like to add a new department?\n`
        ),
        default: true
      }
    ])
    .then(function(response) {
      if (response.confirm) {
        createNewDepartment();
      } else {
        setOfMenuOptions();
      }
    });
}

//function that will allow a user to create a new department in the database
function createNewDepartment() {
  inquirer
    .prompt([
      {
        type: `input`,
        name: `departmentName`,
        message: chalk.magenta.bold(
          `\nPlease insert the new department name you would like to add.\n`
        )
      },
      {
        type: `number`,
        name: `overHeadCosts`,
        message: chalk.magenta.bold(
          `\nPlease insert the over head costs for the department you added.\n`
        ),
        validate: validateCurrency
      }
    ])
    .then(function(response) {
      var name = response.departmentName;
      var overHeadCosts = response.overHeadCosts;

      connection.query(
        `insert into departments (department_name, over_head_costs)
                          values ('${name}', ${overHeadCosts})`,
        function(error, result) {
          if (error) throw error;
          log(
            chalk.black.bgGreen.bold(
              `You have successfully added the department below.↓↓`
            )
          );

          let config, productInfo, outputProducts;

          productInfo = [
            [`Department ID`, "Department Name", "Over head costs"],
            [
              `${chalk.blue.bold(result.insertId)}`,
              `${chalk.blue.bold(name)}`,
              `${chalk.black.bgRed.bold(overHeadCosts)}`
            ]
          ];

          config = {
            columns: {
              0: {
                alignment: "center",
                width: 15
              },
              1: {
                alignment: "center",
                width: 15
              },
              2: {
                alignment: "right",
                width: 15
              }
            }
          };
          outputProducts = table(productInfo, config);
          log(outputProducts);
          setOfMenuOptions();
        }
      );
    });
}
