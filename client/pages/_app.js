// global css files must be imported here
import 'bootstrap/dist/css/bootstrap.css';

// NextJS will wrap component in custom wrap component
export default ({ Component, pageProps}) => {
  return <Component {...pageProps} />
};