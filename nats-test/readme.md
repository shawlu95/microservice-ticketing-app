### Summary

This mini-module is to showcase how NATS streaming server works. It can be run by script without Kubernetes (NATS server does run in pod)

A handy trick to expose a port of a specific pod:

```bash
# find the name of nats server
k get pod

# my laptop port : pod port
# leave this command hanging
k port-forward nats-depl-7fb7667779-6ngtx 4222:4222

npm run publish
npm run listen
```

Restart program. Type `rs` and hit enter.
