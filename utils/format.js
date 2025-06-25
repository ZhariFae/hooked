export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    return price;
  }
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};