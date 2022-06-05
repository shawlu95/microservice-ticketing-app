// Not allowed to fetch data in component in server-side render
const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>Please sign in</h1>;
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
LandingPage.getInitialProps = async ({ req, axios, currentUser }) => {
  return {};
};

export default LandingPage;
