const formatDate = (dateString) => {
    try {
        // Parse the date string
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        // Define options for formatting the date
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        // Format the date to Portuguese locale as 'dd/mm/yyyy'
        const formatter = new Intl.DateTimeFormat('pt-PT', options);
        const formattedDate = formatter.format(date);

        // Log formatted date for debugging
        // console.log('Formatted Date:', formattedDate);

        // Replace month number with Portuguese format
        const monthsInPortuguese = {
            '01': 'Jan',
            '02': 'Fev',
            '03': 'Mar',
            '04': 'Abr',
            '05': 'Mai',
            '06': 'Jun',
            '07': 'Jul',
            '08': 'Ago',
            '09': 'Set',
            '10': 'Out',
            '11': 'Nov',
            '12': 'Dez'
        };

        // Split formatted date
        const [day, month, year] = formattedDate.split('/');

        // Log parts for debugging
        // console.log('Day:', day);
        // console.log('Month:', month);
        // console.log('Year:', year);

        // Get the Portuguese month abbreviation
        const formattedMonth = monthsInPortuguese[month] || month;

        // Return the formatted date
        return `${day} ${formattedMonth} ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

export default formatDate;
