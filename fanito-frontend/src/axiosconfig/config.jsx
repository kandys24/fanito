const getTokenConfig = () => {
    const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage

    // console.log(token);

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
        },
    };

    return config;
};

export default getTokenConfig;
