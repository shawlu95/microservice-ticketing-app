import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // create an instance of ticket
  const ticket = Ticket.build({
    title: 'meal',
    price: 0.5,
    userId: 'foo',
  });

  // save the ticket to database
  await ticket.save();

  // fetch the ticket twice
  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  // make two separate changes
  ticket1!.set({ price: 1 });
  ticket2!.set({ price: 2 });

  // save the first successfully (inc version)
  await ticket1!.save();

  // failed to save the second (outdated version)
  try {
    await ticket2!.save();
  } catch (err) {
    return;
  }
  throw new Error('Should not reach this point');
});
