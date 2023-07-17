# Ankora Hackathon

## Project setup
- run `nvm use` to switch node version to v18.12.1 _(alternatively, have it preinstalled on the system, any 18-ish version "should" work)_
- run `npm install` to set up all the project dependencies
- in a different terminal, run `docker compose up` to provision the mongodb database
- in the first terminal window, run `npm run db:generate` to generate the prisma schema
- in the first teminal window, run the application with `npm run start:dev`

The application started successfully if you see the following message in the terminal:
```
DEBUG ************************************
DEBUG ***                              ***
DEBUG *** Backend running on port 5001 ***
DEBUG ***    http://localhost:5001     ***
DEBUG ***                              ***
DEBUG ************************************
```

