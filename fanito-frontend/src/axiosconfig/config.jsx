const getTokenConfig = () => {
    const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage

    // console.log(token);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    };

    return config;
};

export default getTokenConfig;
