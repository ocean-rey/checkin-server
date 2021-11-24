"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
(0, node_fetch_1.default)("https://www.visitsaudi.com/bin/api/v1/events?locale=en").then(res => res.json().then(events => {
    console.log(events);
}));
