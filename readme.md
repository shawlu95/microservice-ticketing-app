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
  - great for mobile device (speed, compatibility)
  - great of search engine optimization
- Initial page load request cannot be customized with JWT!
  - JWT has to be stored in cookie
- In real world, need to encrypt cookie and support language-interoperability
- In this project, cookie is not encrypted
  - JWT is naturally resistant to tampering, OK in most purpose
  - No need to encrypt unless password/sensitive info is involved
- In this project, we don't incorporate typescript for the NextJS app (low ROI)

#### getInitialProps

Executed on server:

- hard refresh
- click link from different domain
- typing URL into address bar

Executed on client:

- navigating from one page to another while in app (e.g. route after sign-up)

Implication: need to speficy the right domain depending on caller (server/browser)

#### Implement with NextJS

- [pages](./client/pages/) is a magical direcotry, all files are read at first load and file names are mapped to route names

```bash
npm install react react-dom next
```

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

### Unit Test

- Be clear with the scope with test (single service, cross service, event-bus etc)
- We use `supertest` library
  - use `--save-dev` for test dependencies, mark `--only=prod` in Dockerfile
- Cannot manually code the port in `index.ts` which will cause conflict
  - refactor into `app.ts` which is imported by `index.ts`
  - start-up logic lives in `index.ts`
- running mongodb in memory
  - easy to test multiple db at the same times
  - easy to run cuncurrent tests for different services

#### convention

- place `__test__` folder under the files to be tested
- for each file, write `file.test.ts` inside `__test__` folder

```bash
npm install --save-dev \
  @types/jest \
  @types/supertest \
  jest ts-jest supertest mongodb-memory-server
```

Manually poll client change:

```bash
k get pods
k delete pod <pod_id>
# client pod will be restarted
```

### Ingress-Nginx

The service needs to be started before running `skaffold dev`. See instruction [here](https://kubernetes.github.io/ingress-nginx/deploy/#quick-start).

Cross namespace communication: `http://SERVICE_NAME.NAMESPACE.svc.cluster.local/api/...`

- example: `http://ingress-nginx.ingress-nginx.svc.cluster.local`
- shorthand: external name service

```bash
# delete from default namespace
kubectl delete --all deployments
kubectl delete --all pods
kubectl delete --all services

# delete from ingress-nginx namespace
kubectl delete --all deployments --namespace=ingress-nginx
kubectl delete --all pods --namespace=ingress-nginx
kubectl delete --all services --namespace=ingress-nginx
```

### NPM Packaging

- Public: visible to all (free)
- Organization: members can access
  - private org: need to pay a fee
  - public org: free
- Private registry: direct access required (fee)

#### Update package

Publish common module and update consumer modules

```bash
npm update @shawtickets/common
k get pods
k exec -it pod_id sh

# check current version
vim package.json
```

### NATS Streaming Server

Totally different from NATS, built on top of NATS

- [doc](https://docs.nats.io/).
- [docker](https://hub.docker.com/_/nats-streaming)
- client library for node: [node-nats-streaming](https://www.npmjs.com/package/node-nats-streaming)
- Events are organized by channels/topics which require subscription
- Queue Groups assign consumbers into partitions and load-balancing
