import Banana from "./banana";
const App = ({ color }) => {
  console.log('from component: ', color);
  return (<>
  <h1>Landing page</h1>
  <Banana />
  </>);
};

// Executed on server, components are rendered only once
// Fetch some data for initial rendering of component
App.getInitialProps = () => {
  console.log('Reder initial props')
  return { color: 'red' }; // props for App component
};

export default App;