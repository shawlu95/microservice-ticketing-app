# Ticketing App

This project is a lot more complex. Multiple events are introduced and dev techniques including npm module packaging, live cluster deployment.

## Learning Experience

1. Build a central library as a npm module to share code between different services
2. All events are defined in the npm module
3. Run k8s cluster in the cloud and seamless local test
4. Unit tests
5. `Next.Js` Server-side React rendering
6. MongoDB to store user, ticket, order, payment object
7. Redis to handle ticket lock/unlock
8. NATS streaming server
9. Type `thisisunsafe` in chrome to get rid of warning

---

## App Intro

- User can lsit a ticket for an event for sale
- User can purchase listed ticket
- Any user can list tocket for sale and purchase ticket
- When user attempts to purchase a ticket, it is locked for 15 minutes
- When locked, no other user can purchase the ticket
- If payment is not completed within 15 minutes, ticket is unlocked
- Ticket price can be edited when unlocked

### Services

- auth: handles signup, signin, signout
- tickets: creates, updates ticket
- orders: create order
- expiration: start timer on order
- payment: make payment using Stripe API

### Events

- **UserCreated**
- **UserUpdated**
- **TicketCreated**
  - pub by: tickets service
  - sub by: orders service
- **TicketUpdated**
  - pub by: tickets service
  - sub by: orders service
- **OrderCreated**:
  - pub by: orders service
  - sub by: expiration service, payments service, tickets service
- **OrderCancelled**:
  - pub by: orders service
  - sub by: payments service, tickets service
- **OrderExpired**:
  - pub by: expiration service
  - sub by: orders service
- **PaymentCreated**
  - pub by: payments service
  - sub by: orders service

---

## Server Side Rendering

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
- If the route contains a param, need to wrap the param in square bracket in file name
  - route `/order/:orderid` => file name `/order/[orderid].js`

### getInitialProps

Executed on server:

- hard refresh
- click link from different domain
- typing URL into address bar

Executed on client:

- navigating from one page to another while in app (e.g. route after sign-up)

Implication: need to speficy the right domain depending on caller (server/browser)

### Implement with NextJS

- [pages](./client/pages/) is a magical direcotry, all files are read at first load and file names are mapped to route names

```bash
npm install react react-dom next
```

---

## Json Web Token

- consists of three parts: header, payload, verify signature
- to generate jwt: provide payload and signing key
- all services need to know the signing key. Nobody else can access
- decode jwt token to a json object [here](https://www.base64decode.org)
- decode jwt string to original content [here](https://jwt.io)

## Javascript Quirk

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

---

## Kubernetes Secret

A method of sharing key-value pair across pods (env variables)

```bash
kubectl create secret generic jwt-secret --from-literal=jwt=asff
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asff
kubectl delete secret jwt-secret
kubectl get secrets
```

---

## Unit Test

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

---

## Ingress-Nginx

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

---

## NPM Packaging

- Public: visible to all (free)
- Organization: members can access
  - private org: need to pay a fee
  - public org: free
- Private registry: direct access required (fee)

### Update package

Publish common module and update consumer modules

```bash
npm update @shawtickets/common
k get pods
k exec -it pod_id sh

# check current version
vim package.json
```

---

## NATS Streaming Server

Totally different from NATS, built on top of NATS

- [doc](https://docs.nats.io/).
- [docker](https://hub.docker.com/_/nats-streaming)
- client library for node: [node-nats-streaming](https://www.npmjs.com/package/node-nats-streaming)
- Events are organized by channels/topics which require subscription
- Queue Groups assign consumbers into partitions and load-balancing
- Default ack every event upon received. To handle custom logic (emulate atomic transac), must manual ack.
  - NATS will retry sending event if no ack is received after timeout
- See subscription of channels on web [console](http://localhost:8222/streaming/channelsz?subs=1)

---

## Order Service

- User clicks on a ticket to purchase it
- User has 30 seconds to complete payment. Lock ticket and disallow others to purchase.
- Unlock the ticket if payment is not completed in 30s

Implementation

- Replicate ticket collections (only save title, price, version of ticket)
  - listening to ticket:created and ticket:updated event

### Event Flow

Order Created

1. **Ticket Service**: reject further edit
2. **Payment Service**: accept payment
3. **Expiration Service**: start a timer to mark expiration

Order Cancelled

1. **Ticket Service**: can accept edit
2. **Payment Service**: do not accept payment

---

## Payment Service

- Listen for `order:created` and `order:cancelled` event, and expect payment
- Emit `payment:created` event

Which fields of order do we want to keep in payment service:

- id: required to mark payment and communicate event
- status: required to reject payment if cancelled
- version: required to check event order
- userId: required to ensure one user cannot pay another's order
- expiresAt: not required to reject payment if expired. This is consumed by expiration service. Payment service just checks status, which is the original goal of the property
- ticket: doesn't care

### Stripe API

1. User enters card number, Stripe returns a token as authorization (no charge yet). Safer to handle token than actual card number
2. Token is submitted to payment service, which validates and requests Stripe to charge money

- find order the user is trying to pay for
- make sures order belongs to hte user
- check prices

3. Payments service sync with mongo, create a _charge_ record. Communicate with other services,
4. Token path: Stripe -> browser -> payment service -> Stripe
5. Save secret in kubectl: `k create secret generic stripe-secret --from-literal STRIPE_KEY=foo`
6. Test mode provides a cheat token `tok_visa` that will always successfully charge

---

### Versioning

Mongoose and MongoDB collaborate to implement versioning control.

Optimistic concurrency control

- Not MongoDB-specific strategy, can easily generalize
- To update, find the specific doc with specific version and apply the update
- If the version is not found, update request would fail
- Only the **primary service responsible for a record** should emit create/update/delete event
  - Remember the blog project, moderation service could modify the comment
  - If moderation service increment the moderated comment to, comment service would have to accept the version and increment to 2 when save the moderated comment.
  - Query service would see version 2 emitted by the comment service instead of 1! C

```bash
# log into mongo shell and check records
k get pods
k exec -it orders-mongo-depl-6c79d9dbf7-xsxqk mongo
> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
orders  0.000GB
> use orders
switched to db orders
> orders.tickets
uncaught exception: ReferenceError: orders is not defined :
@(shell):1:1
> db.tickets.find(
```

---

## Continuous Integration

Big companies try to use one single repo for all services, because creating separate repo incur huge overhead (auth, CI, CD etc).

We use **[GitHub Action](https://docs.github.com/en/actions)** to run test on pull request creation; deploys when branch merges into master.

### Testing

- Tests are triggered when pull request is created/updated.
- Create one workflow file for each microservice
- When a microservice is updated, only the corresponding test is run.

### Deployment

- Six microservices generate six workflows
- When a microservice is updated, we build a new image, push to docker hub, and update deployment
- The **infra workflow** is executed every time
- DockerHub credentials are added to GitHub as secrets so docker push can be executed on digital ocean's machines
- In GitHub container, install `doctl`, switch context to digital ocean, deploy the latest image

In this tutorial we use Digital Ocean to deploy the app.

```bash
# Mac easy
brew install doctl

# get the access token on web
doctl auth init

# get connection info of the new cluster
# context has been switched, all kubectl command will be issued to digital ocean
doctl kubernetes cluster kubeconfig save ticketing

# list all contexts (check the 'context' sections)
kubectl config view

# switch context (can also do from Docker desktop app)
kubectl config use-context <context_name>
kubectl config use-context docker-desktop
```
