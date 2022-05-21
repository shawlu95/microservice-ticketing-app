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
9. Type `thisisunsafe` in chrome to get rid of warning

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

### Server Side Rendering

- NextJS is the common framework
- NextJS talks to microservices and fetch data
- Fully rendered html is returned
- Initial page load request cannot be customized with JWT!
  - JWT has to be stored in cookie
- In real world, need to encrypt cookie and support language-interoperability
- In this project, cookie is not encrypted
  - JWT is naturally resistant to tampering, OK in most purpose
  - No need to encrypt unless password/sensitive info is involved

### Json Web Token

- consists of three parts: header, payload, verify signature
- to generate jwt: provide payload and signing key
- all services need to know the signing key. Nobody else can access
- decode jwt token to a json object [here](https://www.base64decode.org)
- decode jwt string to original content [here](https://jwt.io)

### Kubernetes Secret

A method of sharing key-value pair across pods (env variables)

```bash
kubectl create secret generic jwt-secret --from-literal=jwt=asff
kubectl get secrets
```

### Javascript Quirk

Override native method to provide a consistent serialization schemes across languages.

```javascript
const person = {
  name: 'shaw',
  toJSON() {
    return 1;
  },
};
JSON.stringify(person);
```
