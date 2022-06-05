import Link from 'next/link';

// Not allowed to fetch data in component in server-side render
const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });
  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

/**
 * @notice Executed on server, components are rendered only once.
 * Fetch some data for initial rendering of component.
 * @notice When exec request on server, connection refused! Because
 * there's no browser to infer current domain. NextJS attempts to
 * localhost:80/api/v1/users/currentuser inside the container, wrong!
 * Here localhost refers to container, not your computer.
 * Request is not routed to ingress-nginx
 */
LandingPage.getInitialProps = async (context, axios, currentUser) => {
  const { data } = await axios.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
