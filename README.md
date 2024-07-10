# Github Search

![Screenshot](public/Screenshot.png)

This repository provides a beautiful interface for searching for repositories belonging to a user or organization.  
Use the filters and sorting tools to quickly find and organize repositories.

## Features

### Supported Filters For Organizations

-   `All:` All repositories created by organization
-   `Public`: Public repositories
-   `Private` Private repositories
-   `Forks:` Repositories that are forked from others
-   `Sources` Repositories that are not forked from others
-   `Member` Repositories where the organization is not the owner

`NOTE:` The `all` and `private` filter requires you to provide a valid Github token that belongs to the organzation. More on that below.

### Supported Filters For Users

-   `All` All repositories created by the user
-   `Public`: Public Repositories
-   `Member:` Repositories where the user is not the owner

# Tech Used

-   [Octokit SDK](https://github.com/octokit): For making calls to the github api
-   [Vitest](https://vitest.dev/) For unit testing the api calls
-   [Vite](https://vitejs.dev/) For building and running the application

# Coming Soon

This application will be extended to support a details page that allows users to view additional information about a repository such as.

-   Show languages used within the repository
-   Show contributors tied to a repository
-   Stats about how many views, stars, and forks
-   A button to quickly copy the clone link to your clipboard

# Setting Up The Application

### Running the application

After cloning the repository run `npm install` and then `npm run dev`.

### Making authenticated reques

If you want to make authenticated reponses you can create a `.env` file and place it in the root directory. In that file
define an `api key` e.g VITE_API_TOKEN=`<YOUR_API_KEY>`.The main beneifits of making authenticated responses is to [have a higher rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) and also makes it so you can fetch `private repositories` that belong to your organization.

## Testing

Testing is done via Vitest, to run your test use `npm run test`.
