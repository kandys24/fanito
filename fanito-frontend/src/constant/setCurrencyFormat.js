const setCurrencyFormat = (amount) => {
    const pamount = amount || 0;
    const numberOfDecimals = 2; 
    const formattedValue = pamount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: numberOfDecimals,
        maximumFractionDigits: numberOfDecimals,
    });

    return formattedValue;
};

export default setCurrencyFormat;