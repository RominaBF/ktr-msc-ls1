import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcrypt";
import inquirer from "inquirer";

const prisma = new PrismaClient();

type TCreateUserCredential = {
  name: string;
  password: string;
  email?: string;
  companyName?: string;
  telephoneNumber?: string;
};

type TBusinessCardCreateData = {
  name?: string;
  companyName?: string;
  email: string;
  telephoneNumber?: string;
};

const validateUserCredentials = async (name: string, password: string) => {
  try {
    const user = await prisma.profile.findUnique({
      where: { name: name },
    });

    if (!user) {
      console.log("user not found");
      return false;
    }

    if (!(await compare(password, user?.password))) {
      console.log("password does not match");
      return false;
    }

    return user;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const createProfile = async (credentials: TCreateUserCredential) => {
  try {
    await prisma.profile.create({
      data: {
        password: await hash(credentials.password, 8),
        name: credentials.name,
        emailAddress: credentials.email,
        companyName: credentials.companyName,
        telephoneNumber: credentials.telephoneNumber,
      },
    });
    return true;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const businessCardList = async (username: string) => {
  try {
    const list = await prisma.library.findMany({
      where: {
        owner: { name: username },
      },
    });
    return list;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const loginRequest = async () => {
  let isNewUser: boolean = false;
  const usernamePrompt = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "what is your name?",
  });

  const user = await prisma.profile.findUnique({
    where: { name: usernamePrompt.name },
  });

  isNewUser = !user;

  console.log(!user ? "Welcome! \n" : "Welcome back \n");

  const passwordPrompt = await inquirer.prompt({
    type: "input",
    name: "password",
    message: `hi ${usernamePrompt.name}, what is your password?`,
  });

  return {
    username: usernamePrompt.name,
    password: passwordPrompt.password,
    isNewUser,
  };
};

const askForProfileCredentials = async () => {
  const emailPrompt = await inquirer.prompt({
    type: "input",
    name: "email",
    message: `enter your email address`,
  });

  const companyNamePrompt = await inquirer.prompt({
    type: "input",
    name: "companyName",
    message: `enter your company name`,
  });

  const telephoneNumberPrompt = await inquirer.prompt({
    type: "input",
    name: "telephoneNumber",
    message: `enter your telephone number`,
  });

  return {
    email: emailPrompt.email,
    telephone: telephoneNumberPrompt.telephoneNumber,
    companyName: companyNamePrompt.companyName,
  };
};

const createBusinessCardPrompt = async (username: string) => {
  const namePrompt = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "name of business card",
  });
  const companyPrompt = await inquirer.prompt({
    type: "input",
    name: "company",
    message: "company of business card",
  });
  const emailPrompt = await inquirer.prompt({
    type: "input",
    name: "email",
    message: "email of business card",
  });
  const telephonePrompt = await inquirer.prompt({
    type: "input",
    name: "telephone",
    message: "telephone of business card",
  });

  await prisma.library.create({
    data: {
      owner: {
        connect: { name: username },
      },
      emailAddress: emailPrompt.email,
      companyName: companyPrompt.company,
      name: namePrompt.name,
      telephoneNumber: telephonePrompt.telephone,
    },
  });

  console.log("business card added to your library");
};

const showListOfBusinessCards = async (username: string) => {
  const cards = await businessCardList(username);
  cards.map((i) => {
    console.log("name: ", i.name);
    console.log("company name: ", i.companyName);
    console.log("email address: ", i.emailAddress);
    console.log("telephone number: ", i.telephoneNumber);
    console.log("-----");
  });
};

const businessCardFunctionality = async (username: string) => {
  const listOrAdd = await inquirer.prompt({
    type: "list",
    name: "opperation",
    message: "What do you want to do??",
    choices: ["list", "create", "exit"],
  });
  switch (listOrAdd.opperation) {
    case "list":
      await showListOfBusinessCards(username);
      await businessCardFunctionality(username);

      break;
    case "create":
      await createBusinessCardPrompt(username);
      await businessCardFunctionality(username);

      break;
    case "exit":
      console.log("you are logged off");
      console.log("in order to use the app, you should login again");
      process.exit(0);
    default:
      break;
  }
};

const main = async () => {
  let isAuthenticated: true;
  let loggedInUserCredentials = { username: "" };

  const { username, password, isNewUser } = await loginRequest();
  let profileCredentials = {
    email: "",
    telephone: "",
    companyName: "",
  };
  if (isNewUser) {
    profileCredentials = await askForProfileCredentials();
    await createProfile({
      name: username,
      password: password,
      email: profileCredentials.email,
      companyName: profileCredentials.companyName,
      telephoneNumber: profileCredentials.telephone,
    });
    isAuthenticated = true;
    loggedInUserCredentials = { username: username };
  } else {
    const isValid = await validateUserCredentials(username, password);
    if (!isValid) {
      console.log("your credential is not valid");
      console.log("please try again");
      main();
      return;
    }
    console.log("welcome");
    isAuthenticated = true;
    loggedInUserCredentials = { username: username };
  }

  // business card functionality
  await businessCardFunctionality(username);
};
main();
