export const stripe = {
  charges: {
    // always resolve with an empty object
    create: jest.fn().mockResolvedValue({ id: 'stripeId' }),
  },
};
