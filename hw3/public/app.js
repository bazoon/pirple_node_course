let app = {
    config: {
        sessionToken: false,
    },
    client: {
        request: function (headers={}, path='/', method='GET', queryStringObject={}, payload=undefined) {
            
            headers["Content-Type"] = "application/json";
            
            if (app.config.sessionToken) {
                headers.token = app.config.sessionToken.id;
            }
            
            let counter = 0;
            let requestUrl = path + '?';
            
            for(let queryKey in queryStringObject) {
                if (queryStringObject.hasOwnProperty(queryKey)) {
                    counter +=1;
                    if (counter > 1) {
                        requestUrl += '&'
                    }
                    requestUrl +=`${queryKey}=${queryStringObject[queryKey]}`;
                }
            }
            
            return fetch(requestUrl, {
                method,
                headers,
                body: JSON.stringify(payload)
            }).then((response) => {
                return response.json();
            });
            

            

        }
    },
    bindForm: function (formId) {
        const form = document.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formId = this.id;
            const path = this.action;
            const method = this.method.toUpperCase();

            let payload = {};
            const elements = this.elements;

            for (let i = 0; i < elements.length; i++) {
                if (elements[i].type !== 'submit') {
                    payload[elements[i].name] = elements[i].value;
                }
            }

            return app.client.request(undefined, path, method, undefined, payload).then((r) => {
                app.processRequest(formId, payload, r);
            }).catch((e) => {
                console.error(e);
            });

        });
    },
    login: function (email, expires, id) {
        app.config.sessionToken = {
            email: email,
            expires: expires,
            id: id
        };  
        
        localStorage.setItem('token', JSON.stringify(app.config.sessionToken));

        app.removeLinks(['.signup', '.login']);
        app.showLinks(['.logout']);
        window.location = 'session/created';
    },
    logout: function () {
        
        const queryStringObject = {
            id: app.config.sessionToken.id
        };
        
        return app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined).then((r) => {
            app.config.sessionToken = false;
            app.removeLinks(['.logout']);
            app.showLinks(['.signup', '.login']);
            localStorage.removeItem('token');
            window.location = 'session/deleted';    
        }).catch((e) => {
            console.error(e);
        });
        
    },
    removeLinks: function (links) {
        links.forEach(function (link) {
            document.querySelector(link).style.display = 'none';
        });
    },
    showLinks: function (links) {
        links.forEach(function (link) {
            document.querySelector(link).style.display = 'inline-block';
        });
    },
    processRequest: function (formId, payload, data) {
        if (formId === 'sessionCreate') {
            app.login(data.email, data.expires, data.id);
        } else if (formId === 'accountCreate') {
            const newPayload = {
                email: payload.email,
                password: payload.password
            };

            app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload).then((data) => {
                app.login(data.email, data.expires, data.id);
            }).catch((e) => {
                console.error(e);
            });
        }
    },
    readTokenFromStorage: function () {
        const token = localStorage.getItem('token');
        
        if (token) {
            app.config.sessionToken = JSON.parse(token);
            app.removeLinks(['.login', '.signup']);
        }
        
    },
    bindLogout: function () {
        document.querySelector('.logout').addEventListener('click', function (e) {
            e.preventDefault();
            debugger
            app.logout();
        })
    },
    renderMenu: function () {
        const menu = document.querySelector('.menuBook');
        if (!menu) return Promise.reject();
        
        return new Promise((resolve, reject) => {
            app.client.request(undefined, 'api/menu', 'GET', undefined, undefined).then(data => {
                app.menu = data;
                data.forEach((item) => {
                    const formId = `menuItem${item.id}`;
                    let menuItem = document.createElement('div');
                    menuItem.innerHTML = `<form id="${formId}"  method="post" action="api/cart">${item.name} - ${item.price} &nbsp;<input type="submit" value="+"/></form>`;
                    menu.appendChild(menuItem);
                    const form = document.getElementById(formId);
                    form.addEventListener('click', this.addToCart.bind(this, item));
                });
                resolve();
            });
        });

    },
    addToCart: function (item, e) {
        e.preventDefault();
        const payload = {
            email: app.config.sessionToken.email,
            menuId: item.id,
            count: 1
        };

        app.client.request(undefined, 'api/cart', 'POST', undefined, payload).then(data => {
            app.cart = data;
            this.updateCart(data.order);
        });
    },
    findMenuItemById: function (id) {
        return app.menu.find((item) => item.id === id);  
    },
    updateCart: function (cartData) {
        cartData = cartData || app.cart;
        const cart = document.querySelector('.cart');
        if (!cart) return;

        cart.innerHTML = '';
        let total = 0;


        if (!cartData) return;
        
        cartData.forEach(item => {
            let cartItem = document.createElement('div');
            let menuItem = this.findMenuItemById(item.menuId);
            
            cartItem.innerHTML = `${menuItem.name} - ${item.count}`;
            cart.appendChild(cartItem);
            total += menuItem.price * item.count;
        });

        let t = document.createElement('div');
        t.classList.add('cart-total');
        t.innerHTML = `Total ${total} $`;
        cart.appendChild(t);

        let button = document.createElement('button');
        button.addEventListener('click', this.checkout.bind(this));
        button.innerText = 'Post order';
        cart.appendChild(button);

        this.saveCart(cartData);
    },
    checkout: function (e) {
        e.preventDefault();
        window.location = "checkout";
    },
    postOrder: function (button, e) {
        e.preventDefault();

        const payload = {
            email: app.config.sessionToken.email,
        };
        
        button.innerText = '...loading';
        app.client.request(undefined, 'api/orders', 'POST', undefined, payload).then((data) => {
            this.clearCart();
            this.updateCart();
            button.innerText = 'Order complete';
            debugger
            button.setAttribute('disabled', true);
            alert(data.message);
        }).catch((e)=> {
            alert(e);
            button.innerText('Post order');
        });
    },
    saveCart: function (cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    loadCart: function () {
        let c = localStorage.getItem('cart');
        return c ? JSON.parse(c) : undefined;
    },
    clearCart: function () {
        app.cart = undefined;
        localStorage.removeItem('cart');
    },
    bindCheckout: function () {
        const button = document.querySelector('.postOrder');
        if (!button) return;
        button.addEventListener('click', this.postOrder.bind(this, button));
    }


};

app.init = function() {
    app.bindForm();
    app.readTokenFromStorage();
    app.bindLogout();
    app.bindCheckout();
    app.renderMenu().then(() => {
        let cart = this.loadCart();
        if (cart) {
            app.updateCart(cart);
        }
    }).catch(()=>{});




}

window.onload = function () {
    app.init();
}

