## Used Car Pricing API

This project was created while taking Stephen Grider's Nest course.

**App Overview**:

- Users sign up with email/password
- Users get an estimate for how much their car is worith based on the make/model/year/mileage
- Users can report what they sold their vehicles for
- Admints have to approve reported sales

---

### API Design

| Method and Route   | Body or Query String                                              | Description                                    |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------------------- |
| POST /auth/signup  | Body - { email, password }                                        | Create a new user and sing in                  |
| POST /auth/signin  | Body - { email, password }                                        | Sign in as an existing user                    |
| GET /reports       | QS - make, model, year, mileage, longitude, latitude              | Get an estimate for the cars value             |
| POST /reports      | Body - { make, model, year, mileage, longitude, latitude, price } | Report how much a vehicle sold for             |
| PATCH /reports/:id | Body - { approved }                                               | Approve or reject a report submitted by a user |

---

### Module Design

| Controllers        | Services        | Repositores        |
| ------------------ | --------------- | ------------------ |
| Users Controller   | Users Service   | Users Repository   |
| Reports Controller | Reports Service | Reports Repository |

- Users Module
- Reports Module

---

### Setting Up a Database Connection

- SQLite initially, eventually - Postgres

(SQlite DB, as an example):

```txt
Connection to SQLite DB
                       \
                        \___>  AppModule
                   ---------------------------
    UsersModule   /                           \ ReportsModule
    --------------                    ------------------------
  User Entity                          Report Entity
  Users Repository                     Reports Repository

- User Entity -> Lists the different properties that a User has (no functionality)
- Users Repository -> Methods to find, update, delete, create a User

- Report Entity -> Lists the different properties that a Report has
- Reports Repository -> Methods to find, update, delete, create a Report

```

---

### Extra Routes

| Method and Route    | Body or QS                 | Description                     | Controller Method |
| ------------------- | -------------------------- | ------------------------------- | ----------------- |
| GET /auth/:id       | -                          | Find a user with a given id     | findUser          |
| GET /auth?email=... | -                          | Find all users with given email | findAllUsers      |
| PATCH /auth/:id     | Body - { email, password } | Update a user with a given id   | updateUser        |
| DELETE /auth/:id    | -                          | Delete user with given id       | removeUser        |

---

## Installation

```bash
$ npm install
```

---

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
