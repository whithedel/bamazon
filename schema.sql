create database bamazon;

use bamazon;

create table products
(
    item_id integer
    auto_increment not null primary key,
product_name varchar
    (50) not null,
department_name varchar
    (50) not null,
price decimal
    (10,2) not null,
stock_quantity integer not null,
product_sales decimal
    (10,2) not null
);

    ALTER USER 'root'@'localhost' IDENTIFIED
    WITH mysql_native_password BY '';

    insert into products
        ( product_name, department_name, price, stock_quantity )
    values
        ("Iphone", "Electonic", 999.99, 200),
        ("Apple Watch", "Electonic", 350.99, 150),
        ("Sony Alpha a6000 Mirrorless Digital Camera ", "Electonic", 548.00, 30);
    insert into products
        ( product_name, department_name, price, stock_quantity )
    values
        ("Amazon Smart Plug", "Electonic", 24.99, 20),
        ("Echo Dot (3rd Gen)", "Electonic", 22.00, 50);
    insert into products
        ( product_name, department_name, price, stock_quantity )
    values
        ("Toshiba 32LF221U19 32-inch 720p HD Smart LED TV ", "Electonic", 99.99, 20),
        ("Beats Solo3 Wireless On-Ear Headphones", "Electonic", 139.99, 50);
    insert into products
        ( product_name, department_name, price, stock_quantity )
    values
        ("Ring Alarm Motion Detector", "Electonic", 29.99, 40),
        ("Echo Input", "Electonic", 14.99, 10),
        ("Roku Express", "Electronic", 24.00, 5);

    -- alltering the table to add a column.
    alter table products
add column product_sales decimal
    (10,2) after stock_quantity;


    -- creating deapartment table.

    create table departments
    (
        department_id INTEGER
        auto_increment not null PRIMARY KEY,
    department_name VARCHAR
        (50) not null,
    over_head_costs DECIMAL
        (10,2) not null
);

    -- inserting some data to the departments table
        insert into departments
            (department_name, over_head_costs)
        values(Electonic, 130400);