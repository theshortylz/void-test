
**"RiotGames API Backend Test Suite 🎮🔍**

Welcome to the RiotGames API Backend Test Suite repository! This project focuses on robust testing strategies for interacting with the Riot Games API, allowing developers to seamlessly gather and manage data related to League of Legends players. Through a trio of meticulously crafted endpoints, this backend application fetches data from the Riot Games API, storing it within a local database for efficient retrieval and future reference.

**Key Features:**

🌐 Seamlessly retrieve data from the Riot Games API, including summoner details, match history, and competitive rankings.
📊 Effortlessly manage player data through well-defined endpoints, fostering analytical insights and user-friendly presentations.
📁 Test suite tailored to ensure the reliability, accuracy, and functionality of API interactions.
🚀 Simplified deployment using provided docker-compose configurations for local testing.
Requirements:
Before embarking on your testing journey, ensure you have Node.js installed, and either NPM or Yarn as your package manager of choice.

**Requirements before start:**

Make sure that you have Node.js installed. https://nodejs.org/
NPM (Node Package Manager) o Yarn

**Instalation:** 

1- Clone the repository
- git clone https://github.com/GermanSmigoski/Void-test.git

2- Download dependecies
- npm install (in the console)

3- Create a .env file in the project root directory with the following environment variables:
- API_KEY: Your Riot Games API key obtained from the [Riot Games Developer Website](https://developer.riotgames.com).
- DB_USER: Your PostgreSQL database username.
- DB_PASSWORD: Your PostgreSQL database password.
- DB_HOST: The hostname where your PostgreSQL database is hosted (e.g., localhost).
- DB_PORT: The port on which your PostgreSQL database is running (e.g., 5432).
- DB_DATABASE: The name of the database to be used.

4- I'll provide the docker-compose file for local testing.

Running the app
1- Deploy the application and the database:
- npm run void-test

**Using the Postman Collection:**

After running the application and ensuring that it's connected to the database, you can utilize the "void-test.postman_collection" to access predefined routes via Postman. This collection includes routes that correspond to the application's endpoints, allowing you to interact with the API and observe its functionality.
