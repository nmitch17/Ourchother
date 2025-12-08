# Start Dev Server
> Run the following commands to start the development server.

## Run
1. Run `rm -rf .next` to clear cache.
2. Run `PORT=3002 bun dev` to start the development server.
3. Wait for the server to start up.
4. Read the initial page load server logs.
5. If there are any errors, report them.
6. If there is already a server running on  the same port, run /restart command.

## Report
Output the following format:
✅ Started the development server in <time the server took to start up>.
<✅ or ❌: If no errors, respond with a positive message, if errors: respond with red 'x' and explain the errors in a succinct and comprehensive bullet list.>
🟢 Available at <server url>