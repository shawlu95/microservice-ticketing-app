import axios from 'axios';

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
  // not working
  // const res = await axios.get('/api/users/currentuser');

  // Option: use k8s node-port service name as domain, not best option
  // Only works if both services are in the same namespace ('default' here)
  // const res = await axios.get('http://auth-srv/api/users/currentuser');

  // Option: send to ingress-nginx
  if (typeof window === 'undefined') {
    // We are on server, need to specify host, and attach cookie
    const url = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser';
    const { data } = await axios.get(url, {
      headers: req.headers
    });
    return data;
  } else {
    // we are on browser
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }
};

export default App;