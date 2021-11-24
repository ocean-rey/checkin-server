"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const body_parser_1 = __importDefault(require("body-parser"));
const PORT = 8000;
const app = (0, express_1.default)();
const primsa = new client_1.PrismaClient();
// parse application/x-www-form-urlencoded
app.use(body_parser_1.default.urlencoded({ extended: false }));
// parse application/json
app.use(body_parser_1.default.json());
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
app.get('/', (req, res) => {
    res.send("Welcome to Mobile Computing");
});
app.post("/register", (req, res) => {
    primsa.user.create({ data: { email: req.body.email } }).then(() => {
        res.status(200).send();
    }).catch(err => {
        res.status(400).send(err);
    });
});
