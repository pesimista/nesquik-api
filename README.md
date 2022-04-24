## Nesquik API

This is a project based of the web app [QUIK](www.quikpago.com). The main goal is to try to mimic it all using [Next.js](https://nextjs.org/) as the main framework for the frontend, and use [Nest.js](https://nestjs.com/) as the API framework connected to a [MongoDB](https://www.mongodb.com/) database.

this serves the purpose of being a practice environment, and portfolios project for future reference

## Running it locally

This project requires some key properties to properly be set up. In development you can set up the `.env` (check the `.env.sample`) with all the keys and the project will pick them up automatically.

To get it running this should be enough:

```bash
npm run start:dev
# or
yarn start:dev
```

Start issuing request to [http://localhost:3200](http://localhost:3200)

## Roadmap

- [x] Add the mongoose library and set it up
- [x] Add the authentication endpoints and the logic related to it
- [ ] Add endpoints for
  - [ ] Markets
  - [ ] Banners
  - [ ] Categories
  - [ ] Products
  - [ ] Cart
  - [ ] Orders
  - [ ] Transactions
- [ ] Implement search
- [ ] Add sockets for Cart changes :s
