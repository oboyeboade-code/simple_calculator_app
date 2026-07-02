# SimpleCalculator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A lightweight calculator with a vanilla JavaScript frontend and Express.js backend. Works fully offline by default, with optional cloud sync to persist calculation history across devices.

## Features

**Core Calculator**

- Standard arithmetic operations with sequential expression evaluation
- Responsive, keyboard-accessible interface
- Local calculation history with delete and reset controls
- Input validation and comprehensive error handling

**Optional Cloud Sync**

- Session-based authentication using username and sync key
- Persist history to the cloud and access it from any device
- Clear synced history and revoke active sessions on demand

## Tech Stack

| Area             | Technologies                                          |
| ---------------- | ----------------------------------------------------- |
| **Frontend**     | HTML5, CSS3, Vanilla JavaScript                       |
| **Backend**      | Node.js, Express.js, SQLite, Drizzle ORM              |
| **Security**     | bcrypt-ts, CORS, dotenv                               |
| **Architecture** | Layered: `Routes → Controllers → Services → Database` |

## Project Structure

```text
simpleCalculator/
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── history/
│   └── index.html
├── backend/
│   ├── src/
│   ├── drizzle.config.js
│   ├── package.json
│   └── sqlite.db
└── README.md
```
