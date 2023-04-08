# TaskMate - A simple task manager

## Introduction 1

TaskMate is a next-generation lightweight task management app accessible through any web browser. Through a kanban board interface, the app is designed to help individuals and teams stay organised and productive. Users can create personalised boards for each project and use them to manage accountability of work individually or collaboratively.

TaskMate is developed with a combination of web technologies and relational database management systems (RDBMS). Web technologies include Javascript, HTML, and CSS. For the RDBMS we have chosen to use MySQL as the choice of relational database for enforcing data integrity during online transaction processing (OLTP) of the application data. In addition to the basic programming languages used, we have also leveraged advanced frameworks and libraries that build upon these lower layers to optimise developer experience and create a more robust user experience.

## Dependencies

These are the libraries and frameworks used in TaskMate:

```
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "@formkit/auto-animate": "^1.0.0-beta.6",
    "@headlessui/react": "^1.7.11",
    "@heroicons/react": "^2.0.15",
    "@mui/icons-material": "^5.8.4",
    "@mui/material": "^5.9.3",
    "@mui/x-date-pickers": "^5.0.0-beta.3",
    "@next-auth/prisma-adapter": "^1.0.5",
    "@prisma/client": "^4.9.0",
    "@react-email/button": "0.0.7",
    "@react-email/hr": "0.0.5",
    "@react-email/html": "0.0.4",
    "@react-email/render": "^0.0.6",
    "@react-email/text": "0.0.5",
    "@react-hook/window-size": "^3.0.7",
    "@react-spring/parallax": "^9.7.0",
    "@react-spring/web": "^9.7.0",
    "@tanstack/react-query": "^4.20.0",
    "@trpc/client": "^10.9.0",
    "@trpc/next": "^10.9.0",
    "@trpc/react-query": "^10.9.0",
    "@trpc/server": "^10.9.0",
    "animate.css": "^4.1.1",
    "animate.css-react": "^1.1.0",
    "cookies": "^0.8.0",
    "install": "^0.13.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "nanoid": "^4.0.0",
    "next": "13.1.6",
    "next-auth": "^4.19.0",
    "nodemailer": "^6.9.1",
    "npm": "^9.4.2",
    "pusher": "^5.1.2",
    "pusher-js": "^8.0.2",
    "react": "18.2.0",
    "react-beautiful-dnd": "^13.1.0",
    "react-dom": "18.2.0",
    "react-icons": "^4.8.0",
    "react-multi-carousel": "^2.8.2",
    "react-scroll": "^1.8.9",
    "react-spring": "^9.7.0",
    "superjson": "1.9.1",
    "zod": "^3.20.2"
```

## Prerequisites

To run TaskMate locally, you need to have the following installed on your machine:

- Node.js (v14 or higher)

## How to run application?

1. Clone repository to your local machine

   ```bash
   > git clone https://github.com/bubuding0809/taskmate-webapp.git
   ```

2. Install dependencies
   ```bash
   > cd taskmate-webapp
   > npm install
   ```
3. Create a copy of **.env.example** and rename it to **.env**
4. Populate **.env** with your respective API keys

   ```
    # Database
    DATABASE_URL=""

    # NextAuth
    NEXTAUTH_SECRET=""
    NEXTAUTH_URL=""
    DISCORD_CLIENT_ID=""
    DISCORD_CLIENT_SECRET=""
    FACEBOOK_CLIENT_ID=""
    FACEBOOK_CLIENT_SECRET=""
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""

    # Pusher
    PUSHER_APP_ID=""
    PUSHER_KEY=""
    PUSHER_SECRET=""
    PUSHER_CLUSTER=""
    NEXT_PUBLIC_PUSHER_KEY=""
    NEXT_PUBLIC_PUSHER_CLUSTER=""
   ```

5. Run in dev mode.
   ```bash
   > npm run dev
   ```
6. Visit http://localhost:3000 to view application

## How do I deploy this?

### Vercel

Recommend deploying to [Vercel](https://vercel.com/?utm_source=t3-oss&utm_campaign=oss). It makes it super easy to deploy NextJs apps.

- Push your code to a GitHub repository.
- Go to [Vercel](https://vercel.com/?utm_source=t3-oss&utm_campaign=oss) and sign up with GitHub.
- Create a Project and import the repository you pushed your code to.
- Add your environment variables.
- Click **Deploy**
- Now whenever you push a change to your repository, Vercel will automatically redeploy your website!

## Conclusion

TaskMate is a simple and easy-to-use task management application that can help individuals and teams stay organized and productive. By following the instructions in this README.md file, you can easily set up and deploy TaskMate to suit your needs.
