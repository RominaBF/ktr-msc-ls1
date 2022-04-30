# business card library

this application is a cli app that allows different users to archive their own business cards in form of a library

in order to run the app simply open a terminal, navigate to the project directory and run this command:

```bash
npm install
```

this command installs the dependencies of the project. for starting the app:

```bash
npm run start
```

this app is written in Typescript and for persisting data, sqlite (as relational database) and prisma (as object relation mapper) has been used. also for security purposes, the users passwords are hashed.
