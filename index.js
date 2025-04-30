import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);

// Vista home
import ProductManager from './managers/ProductManager.js';
const productManager = new ProductManager('./products.json');

app.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('home', { products });
});

// Vista en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
});

// WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('nuevoProducto', async (producto) => {
        await productManager.addProduct(producto);
        const productosActualizados = await productManager.getProducts();
        io.emit('productosActualizados', productosActualizados);
    });

    socket.on('eliminarProducto', async (id) => {
        await productManager.deleteProduct(id);
        const productosActualizados = await productManager.getProducts();
        io.emit('productosActualizados', productosActualizados);
    });
});

server.listen(8080, () => {
    console.log('Servidor escuchando en puerto 8080');
});