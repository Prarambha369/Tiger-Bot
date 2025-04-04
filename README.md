# Tiger Bot

Tiger Bot is an advanced multipurpose Discord bot with slash commands. Originally developed in 2022, it has been recently reviewed and updated by NextEra Development. This project holds historical significance as it was the first project of NextEra Development.

## Features

- **Multipurpose Bot**: Supports a variety of commands and functionalities.
- **Slash Commands**: Utilizes Discord's slash commands for ease of use.
- **Giveaways**: Integrated with `discord-giveaways` for managing giveaways.
- **Games**: Includes fun games like fight and rock-paper-scissors.
- **Customizable**: Easily configurable to suit different server needs.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/tiger-bot.git
    cd tiger-bot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your configuration:
    ```dotenv
    TOKEN=your_discord_bot_token
    MONGO_URI=your_mongodb_uri
    CLIENT_ID=your_discord_client_id
    OWNER_ID=your_discord_owner_id
    ```

4. Start the bot:
    ```sh
    npm run dev
    ```

## Configuration

The bot uses environment variables for configuration. Ensure you have a `.env` file with the following variables:

- `TOKEN`: Your Discord bot token.
- `MONGO_URI`: Your MongoDB connection string.
- `CLIENT_ID`: Your Discord client ID.
- `OWNER_ID`: Your Discord owner ID.

## Contributing

We welcome contributions! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under a custom license. It is only usable for personal usages with your own hosting and with visible credit to us. Commercial usage is strictly prohibited. If found, the commercial use company or individual would be charged as theft.

## Acknowledgements

- Special thanks to the original developers and the NextEra Development team for their efforts in reviewing and updating this project.
`