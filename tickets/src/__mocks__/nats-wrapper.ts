// fake implementation of nats for testing
export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};
