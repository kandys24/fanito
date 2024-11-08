const calculateNewDate = (dateString, paymentTerm) => {
    const date = new Date(dateString);

    switch (paymentTerm) {
        case 'Pronto Pagamento':
            return date.toISOString(); // No days added
        case '15 Dias':
            date.setDate(date.getDate() + 15);
            break;
        case '30 Dias':
            date.setDate(date.getDate() + 30);
            break;
        case '45 Dias':
            date.setDate(date.getDate() + 45);
            break;
        case '60 Dias':
            date.setDate(date.getDate() + 60);
            break;
        case '90 Dias':
            date.setDate(date.getDate() + 90);
            break;
        default:
            throw new Error('Invalid payment term');
    }

    return date.toISOString();
};

export default calculateNewDate;