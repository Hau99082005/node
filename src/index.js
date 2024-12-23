const path = require('path');
const express = require('express');
var morgan = require('morgan');
const exphbs = require('express-handlebars');
const app = express();
const port = 3000;
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // Use either bcryptjs or bcrypt, but not both!

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const session = require('express-session');

const { rejects } = require('assert');
const { title } = require('process');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use `true` if using HTTPS
}));


// Tạo connection pool
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'enbesu',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Kiểm tra kết nối
connection.getConnection((err, conn) => {
    if (err) {
        console.error('Kết nối thất bại:', err.message);
    } else {
        console.log('Kết nối thành công với MySQL!');
        conn.release(); // Trả kết nối về pool
    }
});


app.use(express.static(path.join(__dirname, 'public')));
//http logger


app.use(morgan('combined'))
const handlebar = exphbs.create({
    extname: '.hbs',
});


//template engine
app.engine('hbs', handlebar.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views/'));

// app.get('/', function(req, res) {
//     connection.query("SELECT * FROM `categories` ORDER BY name DESC", function(err, data) {
//         res.render('home', {
//             title: '<span>Danh Mục</span><ul><li><a href="#"></a></li></ul>',
//             data: data,
//             totalPage: 10

//         })
//         console.log(data)
//     });
// });


app.get('/tin-tuc', (req, res) => {
    Promise.all([
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM categories', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products ORDER BY RAND() LIMIT 5', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM blog', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                })
            })
        ])
        .then(([categories, products, blog]) => {
            res.render('news', {
                title: 'Danh Mục Sản Phẩm',
                categories: categories,
                products: products,
                blog: blog,
            });
            console.log(categories, products, blog);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Loi ket noi co so du lieu');
        })
})

app.get('/lien-he', (req, res) => {
    res.render('lienhe');
})

app.get('/cart', (req, res) => {
    res.render('cart');
})

app.get('/baiviet', (req, res) => {
    Promise.all([
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM categories', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products ORDER BY RAND() LIMIT 5', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM blog', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
        ])
        .then(([categories, products, blog]) => {
            res.render('baiviet', {
                title: 'Danh Mục Sản Phẩm',
                categories: categories,
                products: products,
                blog: blog,
            });
            console.log(categories, products, blog);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Loi ket noi co so du lieu');
        })
})

app.get('/sanpham', (req, res) => {
    Promise.all([
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM categories ORDER BY id DESC', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products ORDER BY RAND() LIMIT 10', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products ORDER BY RAND() LIMIT 3', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                })
            })
        ])
        .then(([categories, products, product]) => {
            res.render('sanpham', {
                title: 'Danh Mục Sản Phẩm',
                categories: categories,
                products: products,
                product: product,
            });
            console.log({ categories, products, product });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Loi ket noi co so du lieu');
        })
});

app.get('/checkout', (req, res) => {
    res.render('checkout');
})


app.get('/', (req, res) => {
    // Sử dụng Promise.all để xử lý cả hai truy vấn song song
    Promise.all([
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM categories ORDER BY id DESC', (err, data) => {
                    if (err) return reject(err);
                    resolve(data); // Kết quả của truy vấn categories
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM banner', (err, data) => {
                    if (err) return reject(err);
                    resolve(data); // Kết quả của truy vấn banner
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products ORDER BY RAND() LIMIT 10', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }),
            new Promise((resolve, reject) => {
                connection.query('SELECT * FROM products', (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                })
            })
        ])
        .then(([categories, banner, products, product]) => {
            // Render view khi cả hai truy vấn thành công
            res.render('index', {
                title: 'Danh Mục Sản Phẩm',
                categories: categories, // Truyền danh mục sản phẩm
                banner: banner, // Truyền dữ liệu banner
                products: products,
                product: product
            });
            console.log({ categories, banner, products, product }); // In kết quả kiểm tra
        })
        .catch(err => {
            // Xử lý lỗi nếu một trong hai truy vấn thất bại
            console.error(err);
            res.status(500).send('Lỗi kết nối cơ sở dữ liệu!');
        });
});

app.get('/login', (req, res) => {
    res.render('login'); // Render the login page
});

app.post('/login', (req, res) => {
    const { phone, password } = req.body;

    console.log('Phone:', phone);
    console.log('Password:', password);

    if (!phone || !password) {
        return res.status(400).send('Phone and password are required');
    }

    const query = 'SELECT * FROM users WHERE phone = ?';
    connection.execute(query, [phone], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        console.log('Query results:', results);
        if (results.length === 0) {
            return res.status(400).send('Invalid phone or password');
        }

        const user = results[0];
        console.log('User from DB:', user);

        // Verify password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        console.log('Is password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid phone or password');
        }

        // Save user details in session
        req.session.user = { id: user.id, name: user.name, phone: user.phone };
        res.redirect('/');
    });
});


// GET: Profile Page
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).render('login', { error: 'Unauthorized: Please log in' });
    }

    res.render('profile', { userId: req.session.userId }); // Render profile.hbs
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Pass user info to templates
    next();
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});




app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { name, phone, password, confirm_password } = req.body;

    // Validation
    if (!name || !phone || !password || !confirm_password) {
        return res.status(400).send('All fields are required');
    }
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Save to the database
    const query = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
    connection.execute(query, [name, phone, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).send('Error registering user');
        }
        console.log('User registered successfully:', results);
        res.redirect('/login');

    });
});

app.get('/search', (req, res) => {
    const searchTerm = req.query.q ? req.query.q.toLowerCase() : '';
    const sql = `
        SELECT * FROM products
        WHERE LOWER(name) LIKE ?`; // Truy vấn tìm kiếm

    connection.query(sql, [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            return res.status(500).send('Lỗi khi tìm kiếm sản phẩm.');
        }

        res.render('search', {
            searchTerm,
            products: results,
        });
    });
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))