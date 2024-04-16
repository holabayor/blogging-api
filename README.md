# Blogging API

This project is a blogging platform backend where users can manage their blogs and read others' blogs. It supports features like user registration, login, blog creation, and the ability to edit, delete, or change the state of blogs from draft to published.

## Features

- User authentication (sign up, sign in)
- JWT authentication with 1-hour token expiration
- CRUD operations for blog posts
- Blog states management (draft and published)
- Pagination, search, and sorting for blog listings
- Auto-calculated reading time for blogs
- Update read count upon blog viewing

## Tech Stack

- **Node.js**: Server-side JavaScript Runtime environment
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL Database
- **Mongoose**: MongoDB object modeling tool
- **JWT**: For token based authentication
- **Winston**: Logging
- **Jest/Supertest**: For unit and integration testing

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them:

```bash
node.js - Download and install from [Node.js website](https://nodejs.org/)
MongoDB - Follow the installation guide on the [MongoDB official documentation](https://docs.mongodb.com/manual/installation/)
```

## Installation Instructions

A step-by-step series of examples that tell you how to get a development environment running:

1. **Clone the repository**

```bash
git clone https://github.com/holabayor/blogging-api.git
cd blogging-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env` file in the root directory and fill it with the necessary environment variables:

```bash
DB_URI=mongodb://localhost:27017/bloggingdb
JWT_SECRET=your_jwt_secret
PORT=4000
```

4. **Run the server**

```bash
npm start
```

## API Endpoints

| Methods | Endpoint                 | Protected | Description                                     |
| ------- | ------------------------ | --------- | ----------------------------------------------- |
| POST    | `/api/auth/register`     | No        | Registers a new                                 |
| POST    | `/api/auth/login`        | No        | Logs in a user                                  |
| GET     | `/api/blogs/:id`         | No        | Retrieves a specific blog                       |
| GET     | `/api/blogs`             | No        | Retrieves all published blogs                   |
| POST    | `/api/blogs`             | Yes       | Create a new blog                               |
| PATCH   | `/api/blogs/:id`         | Yes       | Edit a specific blog                            |
| PATCH   | `/api/blogs/:id/publish` | Yes       | Publish a specific blog                         |
| DELETE  | `/api/blogs/:id`         | Yes       | Deletes a specific blog                         |
| GET     | `/api/users/blogs`       | Yes       | Retrieves all blogs from the authenticated user |

## Running the tests

```bash
npm test
```

## Author

- **Liasu Aanuoluwapo** [holabayor](https://github.com/holabayor)
