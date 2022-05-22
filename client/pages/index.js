import buildClient from "../api/build-client";

// Not allowed to fetch data in component in server-side render
const App = ({ currentUser }) => {
  console.log('Current user: ', currentUser);
  return (<>
  <h1>Landing page</h1>
  </>);
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
App.getInitialProps = async ({ req }) => {
  const axios = buildClient({ req });
  const { data } = await axios.get('/api/users/currentuser');
  return data;
};

export default App;