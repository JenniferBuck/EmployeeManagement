const mysql = require('mysql');
const inquirer = require('inquirer');
const { printTable } = require('console-table-printer');
const figlet = require('figlet');
let roles;
let departments;
let managers;
let employees;

var connectingToDatabase = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "0718605774john",
    // database name
    database: "employees_db"
  });

  figlet('Employee Tracker Assignment', (err, result) => {
    console.log(err || result);
  });

  connectingToDatabase.connect(function(err) {
    if (err) throw err;
    program_start();
    retrieve_departments();
    retrieve_roles();
    retrieve_managers();
    getEmployees();
  });

  program_start = () => {

    inquirer
      .prompt({
        name: "choices",
        type: "list",
        message: "choose action ?",
        choices: ["ADDING DATA", "VIEWING DATA", "UPDATING DATA", "DELETING DATA", "PROGRAM EXIT"]
      })
      .then(function(answer) {
        if (answer.choices === "ADDING DATA") {
          addSomething();
        }
        else if (answer.choices === "VIEWING DATA") {
          viewSomething();
        } 
        else if (answer.choices === "UPDATING DATA") {
          updateSomething();
        }
        else if (answer.choices === "DELETING DATA") {
          deleteSomething();
        }
        else if (answer.choices === "PROGRAM EXIT") {
          figlet('GOOD BYE', (err, result) => {
            console.log(err || result);
          });
        
          connectingToDatabase.end();
        }
        else{
          connectingToDatabase.end();
        }
      });
  }

retrieve_roles = () => {
  connectingToDatabase.query("SELECT id, title FROM role", (err, res) => {
    if (err) throw err;
    roles = res;
    // console.table(roles);
  })
};

retrieve_departments = () => {
  connectingToDatabase.query("SELECT id, name FROM department", (err, res) => {
    if (err) throw err;
    departments = res;
    // console.log(departments);
  })
};

retrieve_managers = () => {
  connectingToDatabase.query("SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers FROM employee", (err, res) => {
    if (err) throw err;
    managers = res;
    // console.table(managers);
  })
};

getEmployees = () => {
  connectingToDatabase.query("SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee", (err, res) => {
    if (err) throw err;
    employees = res;
    // console.table(employees);
  })
};

addSomething = () => {
  inquirer.prompt([
    {
      name: "add",
      type: "list",
      message: "What would you like to add?",
      choices: ["DEPARTMENT", "ROLE", "EMPLOYEE", "EXIT"]
    }
  ]).then(function(answer) {
    if (answer.add === "DEPARTMENT") {
      console.log("Add a new: " + answer.add);
      addDepartment();
    }
    else if (answer.add === "ROLE") {
      console.log("Add a new: " + answer.add);
      addRole();
    }
    else if (answer.add === "EMPLOYEE") {
      console.log("Add a new: " + answer.add);
      addEmployee();
    } 
    else if (answer.add === "EXIT") {
      figlet('GOOD BYE', (err, result) => {
        console.log(err || result);
      });

      connectingToDatabase.end();
    } else {
      connectingToDatabase.end();
    }
  })
};

addDepartment = () => {
  inquirer.prompt([
    {
      name: "department",
      type: "input",
      message: "What department would you like to add?"
    }
  ]).then(function(answer) {
    connectingToDatabase.query(`INSERT INTO department (name) VALUES ('${answer.department}')`, (err, res) => {
      if (err) throw err;
      console.log("1 new department added: " + answer.department);
      retrieve_departments();
      program_start();
    }) 
  })
};

addRole = () => {
  let departmentOptions = [];
  for (i = 0; i < departments.length; i++) {
    departmentOptions.push(Object(departments[i]));
  };

  inquirer.prompt([
    {
      name: "title",
      type: "input",
      message: "What role would you like to add?"
    },
    {
      name: "salary",
      type: "input",
      message: "What is the salary for this possition?"
    },
    {
      name: "department_id",
      type: "list",
      message: "What is the department for this possition?",
      choices: departmentOptions
    },
  ]).then(function(answer) {
    for (i = 0; i < departmentOptions.length; i++) {
      if (departmentOptions[i].name === answer.department_id) {
        department_id = departmentOptions[i].id
      }
    }
    connectingToDatabase.query(`INSERT INTO role (title, salary, department_id) VALUES ('${answer.title}', '${answer.salary}', ${department_id})`, (err, res) => {
      if (err) throw err;

      console.log("1 new role added: " + answer.title);
      retrieve_roles();
      program_start();
    }) 
  })
};

addEmployee = () => {
  retrieve_roles();
  retrieve_managers();
  let roleOptions = [];
  for (i = 0; i < roles.length; i++) {
    roleOptions.push(Object(roles[i]));
  };
  let managerOptions = [];
  for (i = 0; i < managers.length; i++) {
    managerOptions.push(Object(managers[i]));
  }
  inquirer.prompt([
    {
      name: "first_name",
      type: "input",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      type: "input",
      message: "What is the employee's last name?"
    },
    {
      name: "role_id",
      type: "list",
      message: "What is the role for this employee?",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < roleOptions.length; i++) {
          choiceArray.push(roleOptions[i].title)
        }
        return choiceArray;
      }
    },
    {
      name: "manager_id",
      type: "list",
      message: "Who is the employee's manager?",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < managerOptions.length; i++) {
          choiceArray.push(managerOptions[i].managers)
        }
        return choiceArray;
      }
    }
  ]).then(function(answer) {
    for (i = 0; i < roleOptions.length; i++) {
      if (roleOptions[i].title === answer.role_id) {
        role_id = roleOptions[i].id
      }
    }

    for (i = 0; i < managerOptions.length; i++) {
      if (managerOptions[i].managers === answer.manager_id) {
        manager_id = managerOptions[i].id
      }
    }

    connectingToDatabase.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answer.first_name}', '${answer.last_name}', ${role_id}, ${manager_id})`, (err, res) => {
      if (err) throw err;

      console.log("1 new employee added: " + answer.first_name + " " + answer.last_name);
      retrieve_employees();
      program_start()
    }) 
  })
};

viewSomething = () => {
  inquirer.prompt([
    {
      name: "viewChoice",
      type: "list",
      message: "What would you like to view?",
      choices: ["DEPARTMENTS", "ROLES", "EMPLOYEES", "EXIT"]
    }
  ]).then(answer => {
    if (answer.viewChoice === "DEPARTMENTS") {
      viewDepartments();
    }
    else if (answer.viewChoice === "ROLES") {
      viewRoles();
    }
    else if (answer.viewChoice === "EMPLOYEES") {
      viewEmployees();
    }
    else if (answer.viewChoice === "EXIT") {
      figlet('GOOD BYE', (err, result) => {
        console.log(err || result);
      });

      connectingToDatabase.end();
    } else {
      connectingToDatabase.end();
    }
  })
};

viewDepartments = () => {
  connectingToDatabase.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    figlet('Your Viewing Departments', (err, result) => {
      console.log(err || result);
    });

    printTable(res);
    program_start();
  });
};

viewRoles = () => {
  connectingToDatabase.query("SELECT  r.id, r.title, r.salary, d.name as Department_Name FROM role AS r INNER JOIN department AS d ON r.department_id = d.id", (err, res) => {
    if (err) throw err;
    figlet('Your Viewing Roles', (err, result) => {
      console.log(err || result);
    });

    printTable(res);
    program_start();
  });
};

viewEmployees = () => {
  connectingToDatabase.query('SELECT e.id, e.first_name, e.last_name, d.name AS department, r.title, r.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY e.id ASC', (err, res) => {
    if (err) throw err;
    figlet('Your Viewing Employees', (err, result) => {
      console.log(err || result);
    });
  
    printTable(res);
    program_start();
  });
};

updateSomething = () => {
  inquirer.prompt([
    {
      name: "update",
      type: "list",
      message: "Choose something to update:",
      choices: ["Update employee roles", "Update employee managers", "EXIT"]
    }
  ]).then(answer => {
    if (answer.update === "Update employee roles") {
      updateEmployeeRole();
    }
    else if (answer.update === "Update employee managers") {
      updateEmployeeManager();
    }
    else if(answer.update === "EXIT") {
      figlet('GOOD BYE', (err, result) => {
        console.log(err || result);
      });

      connectingToDatabase.end();
    } else {
      connectingToDatabase.end();
    }
  })
};

updateEmployeeRole = () => {
  let employeeOptions = [];

  for (var i = 0; i < employees.length; i++) {
    employeeOptions.push(Object(employees[i]));
  }
  inquirer.prompt([
    {
      name: "updateRole",
      type: "list",
      message: "Which employee's role do you want to update?",
      choices: function () {
        var choiceArray = [];
        for (var i = 0; i < employeeOptions.length; i++) {
          choiceArray.push(employeeOptions[i].Employee_Name);
        }
        return choiceArray;
      }
    }
  ]).then(answer => {
    let roleOptions = [];
    for (i = 0; i < roles.length; i++) {
      roleOptions.push(Object(roles[i]));
    };
    for (i = 0; i < employeeOptions.length; i++) {
      if (employeeOptions[i].Employee_Name === answer.updateRole) {
        employeeSelected = employeeOptions[i].id
      }
    }
    inquirer.prompt([
      {
        name: "newRole",
        type: "list",
        message: "Select a new role:",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < roleOptions.length; i++) {
            choiceArray.push(roleOptions[i].title)
          }
          return choiceArray;
        }
      }
    ]).then(answer => {
for (i = 0; i < roleOptions.length; i++) {
  if (answer.newRole === roleOptions[i].title) {
    newChoice = roleOptions[i].id
    connectingToDatabase.query(`UPDATE employee SET role_id = ${newChoice} WHERE id = ${employeeSelected}`), (err, res) => {
      if (err) throw err;
    };
  }
}
console.log("Role updated succesfully");
retrieve_employees();
retrieve_roles();
program_start();
    })
  })
};
  

updateEmployeeManager = () => {
  let employeeOptions = [];

  for (var i = 0; i < employees.length; i++) {
    employeeOptions.push(Object(employees[i]));
  }
  inquirer.prompt([
    {
      name: "updateManager",
      type: "list",
      message: "Which employee's manager do you want to update?",
      choices: function () {
        var choiceArray = [];
        for (var i = 0; i < employeeOptions.length; i++) {
          choiceArray.push(employeeOptions[i].Employee_Name);
        }
        return choiceArray;
      }
    }
  ]).then(answer => {
    retrieve_employees();
    retrieve_managers();
    let managerOptions = [];
    for (i = 0; i < managers.length; i++) {
      managerOptions.push(Object(managers[i]));
    };
    for (i = 0; i < employeeOptions.length; i++) {
      if (employeeOptions[i].Employee_Name === answer.updateManager) {
        employeeSelected = employeeOptions[i].id
      }
    }
    inquirer.prompt([
      {
        name: "newManager",
        type: "list",
        message: "Select a new manager:",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < managerOptions.length; i++) {
            choiceArray.push(managerOptions[i].managers)
          }
          return choiceArray;
        }
      }
    ]).then(answer => {
for (i = 0; i < managerOptions.length; i++) {
  if (answer.newManager === managerOptions[i].managers) {
    newChoice = managerOptions[i].id
    connectingToDatabase.query(`UPDATE employee SET manager_id = ${newChoice} WHERE id = ${employeeSelected}`), (err, res) => {
      if (err) throw err;
    };
    console.log("Manager Updated Succesfully");
  }
}
retrieve_employees();
retrieve_managers();
program_start();
    })
  })
};

deleteSomething = () => {
  inquirer.prompt([
    {
      name: "delete",
      type: "list",
      message: "Select something to delete:",
      choices: ["Delete department", "Delete role", "Delete employee", "EXIT"]
    }
  ]).then(answer => {
    if (answer.delete === "Delete department") {
      deleteDepartment();
    }
    else if (answer.delete === "Delete role") {
      deleteRole();
    }
    else if (answer.delete === "Delete employee") {
      deleteEmployee();
    } else if(answer.delete === "EXIT") {
      figlet('GOOD BYE', (err, result) => {
        console.log(err || result);
      });

      connectingToDatabase.end();
    }
     else {
      connectingToDatabase.end();
    }
  })
};

deleteDepartment = () => {
  let departmentOptions = [];
  for (var i = 0; i < departments.length; i++) {
    departmentOptions.push(Object(departments[i]));
  }

  inquirer.prompt([
    {
      name: "deleteDepartment",
      type: "list",
      message: "Select a department to delete",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < departmentOptions.length; i++) {
          choiceArray.push(departmentOptions[i])
        }
        return choiceArray;
      }
    }
  ]).then(answer => {
    for (i = 0; i < departmentOptions.length; i++) {
      if (answer.deleteDepartment === departmentOptions[i].name) {
        newChoice = departmentOptions[i].id
        connectingToDatabase.query(`DELETE FROM department Where id = ${newChoice}`), (err, res) => {
          if (err) throw err;
        };
        console.log("Department: " + answer.deleteDepartment + " Deleted Succesfully");
      }
    }
    retrieve_departments();
    program_start();
  })
};

deleteRole = () => {
  let roleOptions = [];
  for (var i = 0; i < roles.length; i++) {
    roleOptions.push(Object(roles[i]));
  }

  inquirer.prompt([
    {
      name: "deleteRole",
      type: "list",
      message: "Select a role to delete",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < roleOptions.length; i++) {
          choiceArray.push(roleOptions[i].title)
        }
        return choiceArray;
      }
    }
  ]).then(answer => {
    for (i = 0; i < roleOptions.length; i++) {
      if (answer.deleteRole === roleOptions[i].title) {
        newChoice = roleOptions[i].id
        connectingToDatabase.query(`DELETE FROM role Where id = ${newChoice}`), (err, res) => {
          if (err) throw err;
        };
        console.log("Role: " + answer.deleteRole + " Deleted Succesfully");
      }
    }
    retrieve_roles();
    program_start();
  })
};

deleteEmployee = () => {
  let employeeOptions = [];
  for (var i = 0; i < employees.length; i++) {
    employeeOptions.push(Object(employees[i]));
  }

  inquirer.prompt([
    {
      name: "deleteEmployee",
      type: "list",
      message: "Select a employee to delete",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < employeeOptions.length; i++) {
          choiceArray.push(employeeOptions[i].Employee_Name)
        }
        return choiceArray;
      }
    }
  ]).then(answer => {
    for (i = 0; i < employeeOptions.length; i++) {
      if (answer.deleteEmployee === employeeOptions[i].Employee_Name) {
        newChoice = employeeOptions[i].id
        connectingToDatabase.query(`DELETE FROM employee Where id = ${newChoice}`), (err, res) => {
          if (err) throw err;
        };
        console.log("Employee: " + answer.deleteEmployee + " Deleted Succesfully");
      }
    }
    retrieve_employees();
    program_start();
  })
};

