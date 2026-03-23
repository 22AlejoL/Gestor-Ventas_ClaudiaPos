import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '../../data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SALES_FILE = path.join(DATA_DIR, 'sales.json');

app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read/write JSON
const readJSON = (file: string, fallback: any) => {
    if (!fs.existsSync(file)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return fallback;
    }
};

const writeJSON = (file: string, data: any) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE, []);
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const products = req.body;
    writeJSON(PRODUCTS_FILE, products);
    res.status(200).send('Products updated');
});

app.get('/api/sales', (req, res) => {
    const sales = readJSON(SALES_FILE, []);
    res.json(sales);
});

app.post('/api/sales', (req, res) => {
    const newSale = req.body;
    const sales = readJSON(SALES_FILE, []);
    sales.push(newSale);
    writeJSON(SALES_FILE, sales);
    res.status(201).json(newSale);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
