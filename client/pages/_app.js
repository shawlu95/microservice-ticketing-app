// global css files must be imported here
import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

/**
 * @dev NextJS will wrap component in custom wrap component
 * @dev Common props are returned from getInitialProps and
 * drilled down to every component
 */
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx: { req } }) => {
  const axios = buildClient({ req });
  const { data } = await axios.get('/api/users/currentuser');

  let pageProps;
  if (Component.getInitialProps) {
    // invoking child component's getInitialProps, pass down useful info
    pageProps = await Component.getInitialProps({
      req,
      axios,
      currentUser: data.currentUser,
    });
  }

  return {
    ...data,
    pageProps,
  };
};

export default AppComponent;
