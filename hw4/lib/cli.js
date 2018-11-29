const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
const file = require('./file');

const menu = require('./menuData');


class _events extends events {};
var e = new _events();

e.on('help', function () {
    cli.responders.showHelp();
});

e.on('menu', function () {
    cli.responders.showMenu();
});

e.on('orders', function () {
    cli.findRecentOrders(cli.responders.showOrders);
});

e.on('lookuporder', function (args, str) {
    cli.responders.lookupOrder(args);
});

e.on('users', function (args, str) {
    cli.findRecentUsers(cli.responders.showUsers);
});

e.on('lookupuser', function (args, str) {
    cli.responders.lookupUser(args);
})


const cli = {
    init: function () {
        console.log('\x1b[34m%s\x1b[0m', "The Cli is running"); 
        
        const _interface = readline.createInterface({
           input: process.stdin,
           output: process.stdout,
           prompt: '>  ' 
        });

        _interface.prompt();

        // handle responses

        _interface.on('line', function (str) {
            cli.processInput(str);

            // re initialize the prompt
            setTimeout(() => _interface.prompt(), 200);
            


        });

    },
    processInput: function (str='') {
        if (!str) return;

        const uniqInputs = [
            'help', 'menu', 'orders', 'lookuporder', 'users', 'lookupuser'
        ];

        const [command, args] = str.toLocaleLowerCase().split(' ');

        if (uniqInputs.indexOf(command) > -1) {
            e.emit(command, args, str);
            return true;
        }

        console.log('Sorry, try again')
        return false;
    },
    responders: {
        showHelp: function () {
            const help = [
                {
                    command: 'menu',
                    title: 'View all the current menu items'
                },
                {
                    command: 'orders',
                    title: 'View all the recent orders in the system (orders placed in the last 24 hours)'
                },
                {
                    command: 'lookuporder',
                    title: 'Lookup the details of a specific order by order ID'
                },
                {
                    command: 'users',
                    title: 'View all the users who have signed up in the last 24 hours'
                },
                {
                    command: 'lookupuser',
                    title: 'Lookup the details of a specific user by email address'
                }
            ]
            cli.horizontalLine();
            cli.centered('Help')
            cli.horizontalLine();

            

            help.forEach(function (item) {
                let line = `\x1b[33m${item.command}:\x1b[0m`;
                let padding = 60 - line.length;

                for (let i = 0; i < padding; i++) {
                    line += ' ';
                }

                line += item.title;
                console.log(line);
            })
            cli.horizontalLine();
        },
        showMenu: function () {
            cli.horizontalLine();
            cli.centered('Menu')
            cli.horizontalLine();
            menu.forEach(function (item) {
                let line = `\x1b[33m${item.name}:\x1b[0m`;
                let padding = 60 - line.length;

                for (let i = 0; i < padding; i++) {
                    line += ' ';
                }

                line += item.price;
                console.log(line);
            })
            cli.horizontalLine();
        },
        showOrders: function (orders) {
            cli.horizontalLine();
            cli.centered('Orders')
            cli.horizontalLine();
            orders.forEach(function (order, i) {
                console.log(i, order);
            });
        },
        showUsers: function (users) {
            cli.horizontalLine();
            cli.centered('Users')
            cli.horizontalLine();
            users.forEach(function (user, i) {
                console.log(user);
            });
        },
        lookupOrder: function (n) {
            cli.findRecentOrders(function (orders) {
                let filename = orders[n];
                let extIndex = filename.indexOf('.json');
                filename = filename.slice(0, extIndex);

                file.read('orders', filename).then(function (order) {
                    order.order.forEach(function (o) {
                       const m = menu.find((m) => m.id === o.menuId);
                       o.name = m.name;
                       o.price = m.price;
                    });

                    cli.showOrder(order); 
                });
            });
        },
        lookupUser: function (email) {
            file.read('users', email).then((userData) =>{
                delete userData.hashedPassword;
                cli.showUser(userData);
            });
        }
    },
    verticalSpace: function (n=1) {
        for (let i = 0; i < n; i++) {
            console.log('');
        }
    },
    horizontalLine: function () {
        const width = process.stdout.columns;
        let line = '';
        for (let i = 0; i < width; i++) {
            line += '-';
        }
        console.log(line);
    },
    centered: function (str='') {
        const width = process.stdout.columns;
        const leftPadding = Math.floor((width - str.length) / 2);

        let line = '';
        for (let i = 0; i < leftPadding; i++) {
            line += ' ';
        }

        line += str;

        console.log(line);
    },
    findRecentOrders: function (fn) {
        file.list('orders').then(function (orders) {
            let last24 = +(new Date()) - 24 * 60 * 60 * 1000;
    
            const filtered = orders.filter(function (order) {
                let [email, part] = order.split('--');
                let [date, ext] = part.split('.');
                let orderTime = new Date(date);
                return orderTime > last24;
            });
    
            fn(filtered);
        });
    },
    findRecentUsers: function (fn) {
        let last24 = +(new Date()) - 24 * 60 * 60 * 1000;
        const withoutExt = (s) => s.slice(0, s.indexOf('.'));
        
        file.list('tokens').then(function (tokens) {
            const promise = Promise.all(tokens.map(token => file.read('tokens', withoutExt(token))));
            promise.then(function (data) {
                let recentUsersTokens = data.filter((item) => item.expires > last24);
                fn(recentUsersTokens.map(r => r.email));
            });
        });
    },
    showOrder: function (order) {
        cli.verticalSpace();
        console.dir(order, { colors: true });
        cli.verticalSpace();
    },
    showUser: function (user) {
        cli.verticalSpace();
        console.dir(user, { colors: true });
        cli.verticalSpace();
    },
}

module.exports = cli;