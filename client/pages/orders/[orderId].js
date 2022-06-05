import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

const OrderDetail = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    // manually invoke once, immediately
    findTimeLeft();

    // call every second after
    const timerId = setInterval(findTimeLeft, 1000);

    // clear timer when navigating away
    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }

  // TODO: put stripeKey somewhere safe, even though it's publishable
  return (
    <div>
      <h4>{timeLeft} seconds until order expires</h4>
      <StripeCheckout
        token={(token) => console.log(token)}
        stripeKey='pk_test_51L73F6JWz1cFidyxecf0ONcCzCDN25Fxhgj0jT5pCTo31wIE61OQj3OD0hgHF87XJ2BMNndQ5xfiW08fcmxvzEv800clBXjpwS'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderDetail.getInitialProps = async (context, axios) => {
  const { orderId } = context.query;
  const { data } = await axios.get(`/api/orders/${orderId}`);
  return { order: data };
};
export default OrderDetail;
