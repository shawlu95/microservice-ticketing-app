import { useEffect, useState } from 'react';
const OrderDetail = ({ order }) => {
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

  return <div>{timeLeft} seconds until order expires</div>;
};

OrderDetail.getInitialProps = async (context, axios) => {
  const { orderId } = context.query;
  const { data } = await axios.get(`/api/orders/${orderId}`);
  return { order: data };
};
export default OrderDetail;
