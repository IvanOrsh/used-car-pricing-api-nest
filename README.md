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

| Method and Route    | Body or QS                 | Description                     | Controller Method | Service Method |
| ------------------- | -------------------------- | ------------------------------- | ----------------- | -------------- |
| POST /auth/signup   | Body - { email, password } | Create a new user               | createUser        | create         |
| GET /auth/:id       | -                          | Find a user with a given id     | findUser          | findOne        |
| GET /auth?email=... | -                          | Find all users with given email | findAllUsers      | find           |
| PATCH /auth/:id     | Body - { email, password } | Update a user with a given id   | updateUser        | update         |
| DELETE /auth/:id    | -                          | Delete user with given id       | removeUser        | remove         |

---

### Quick Review

```txt
          Request { email, password }
           |
           V
          ValidationPipe <---- CreateUserDto { email:string; password: string }
           |
           V
          UsersController - Defines routes + picks relevant data from
           |                incoming request
           V
          UserService - Contains our real app logic  ---
           |                                            \ User Entity - defines what
           V                                            /               a user is
          UsersRepository - Created by TypeORM ---------
           |                interface to the DB
           V
          SQLite DB

```

---

#### Authentication Overview

```txt

Client                         Server
------                         ---------
POST /auth/signup -------->    See if this email is already in use
{ email, password }            if it is, return error
                               otherwise...
                                    |
                                    V
                              Encrypt the users's password
                                    |
                                    V
                              Store the new user record
                                    |
           cookie (userId=42)       V
Browser   <---------------    Send back a cookie that contains the user's id
automatically
stores the cookie
and attaches it to
follow up requests
      |
      | some time later
      V
POST /reports------------->   Look at data in the cookie. Make sure it hasn't
Cookie: userId=42             been tampered with
{ some info }                       |
                                    V
                              Look at the userId in cookie to figure out who
                              is making the request

```

---

### Password Hashing

1. **hashing function**

- very small changes to the input result in a dramatically different hash
- hashing process can't be undone or reversed to figure out the input

2. **Signup Flow**

- in cryptography, **salt** is random data that is used as an additional input to a one-way function that hashes data, a password or passphrase (from wiki).

```txt

user's password|      | salt  |
---------------|      |-------|
somePassword   |      | a1d01 |

           \            /   \
           |           |     \
           V           V      \
         somePassworda1d01     \
                 |              \
                 V               \
          Hashing Function        \
          ----------------         \
                 |                  |
                 V                  V
              Output -----------> Hashed and salted password -> gonna be strored
             010066d                 010066d.a1d01              inside our db

```

---

### Setting up Sessions

```txt

                                 Server
GET /asdf   ---------> Cookie-Session library looks at the
Headers                'Cookie' header
Cookie: es3jd2df              |
                              V
                        Cookie-Session decodes the string,      Session
                        resulting in an object            ---> { color: 'red' }
                              |
                              V
                        We get access to session object in
                        a request handler using a decorator
                              |
                              V
                        We add/remove/change properties        Session
                        on the session object             ---> { color: 'blue' }
                              |
                              V
                        Cookie-Session sees the updated
                        session and turns it into an
                        encrypted string
                              |
                              V
Response  <----------   String sent back in the 'Set-Cookie'
Headers                 header on the response object
Set-Cookie: ey5kaf

```

---

### CurrentUser Decorator & CurrentUser Interceptor

```txt

                     -------------------------------------------------------------
                    |         DI System                                           |
Session   ------------> CurrentUser  <- UsersService  UsersController  UsersRepo  |
Object              |   Interceptor       Instance      Instance       Instance   |
                     -------|-----------------------------------------------------
                            V
                        CurrentUser
                         Decorator

```

---

### Associate a user with the reports they create

- A User has many Reports
- A Report has one User

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
