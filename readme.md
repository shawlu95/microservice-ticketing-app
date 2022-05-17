## Ticketing App

This project is a lot more complex. Multiple events are introduced and dev techniques including npm module packaging, live cluster deployment.

### Learning Experience

1. Build a central library as a npm module to share code between different services
2. All events are defined in the npm module
3. Run k8s cluster in the cloud and seamless local test
4. Unit tests
5. `Next.Js` Server-side React rendering
6. MongoDB to store user, ticket, order, charge object
7. Redis to handle ticket lock/unlock
8. NATS streaming server

### App Intro

- User can lsit a ticket for an event for sale
- User can purchase listed ticket
- Any user can list tocket for sale and purchase ticket
- When user attempts to purchase a ticket, it is locked for 15 minutes
- When locked, no other user can purchase the ticket
- If payment is not completed within 15 minutes, ticket is unlocked
- Ticket price can be edited when unlocked

### Services

- auth
- tickets
- orders
- expiration
- payment

### Events

- UserCreated
- UserUpdated
- OrderCreated
- OrderCancelled
- OrderExpired
- TicketCreated
- TicketUpdated
- ChargeCreated

### Startup

```bash
cd auth
npm init -y
npm install typescript ts-node-dev express @types/express
tsc --init
npm start
```
