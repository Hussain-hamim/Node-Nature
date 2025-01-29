module.exports = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace('{%PRICE%}', product.price);
  output = output.replace('{%FROM%}', product.from);
  output = output.replace('{%NUTRIENTS%}', product.nutrients);
  output = output.replace('{%QUANTITY%}', product.quantity);
  output = output.replace('{%DESCRIPTION%}', product.description);
  output = output.replace('{%ID%}', product.id);

  if (!product.organic)
    output = output.replace('{%NOT_ORGANIC%}', 'not-organic');

  return output;
};
