import React, { useState, useEffect } from 'react';
import NotyQuanty from './NotyQuanty'; // Adjust import path as needed

const Notifications = ({ isToShowNotify, carts }) => {
    const [showNoty, setShowNoty] = useState([]);
    const [currentNoty, setCurrentNoty] = useState(null);

    useEffect(() => {
        if (carts) {
            const updatedNoty = carts.map((cart) => {
                const quantityDifference = Number(cart.quantity) - Number(cart.qtd);
                const shouldShow = quantityDifference < 0;
                return {
                    id: cart.item_id,
                    show: shouldShow,
                    message: shouldShow ? `${truncateString(cart.description)} Stock Insufficient, only ${cart.quantity}` : ''
                };
            });

            setShowNoty((prevNoty) => {
                // Add new notifications or update existing ones
                const notyMap = new Map(prevNoty.map(noty => [noty.id, noty]));
                updatedNoty.forEach((noty) => {
                    if (noty.show) {
                        notyMap.set(noty.id, noty);
                    } else {
                        notyMap.delete(noty.id);
                    }
                });
                return Array.from(notyMap.values()).reverse();
            });
        }
    }, [carts, isToShowNotify]);

    useEffect(() => {
        if (showNoty.length > 0) {
            if (!currentNoty) {
                setCurrentNoty(showNoty[0]);
            }
        }
    }, [showNoty, currentNoty]);

    const handleClose = (id) => {
        // Remove the closed notification from the list
        setShowNoty((prevNoty) => {
            const filteredNoty = prevNoty.filter(noty => noty.id !== id);
            if (filteredNoty.length > 0) {
                setCurrentNoty(filteredNoty[0]); // Show the next notification
            } else {
                setCurrentNoty(null); // No notifications left
            }
            return filteredNoty;
        });
    };

    const truncateString = (str) => {
        return str.length > 5 ? str.substring(0, 5) + '...' : str;
    };

    return (
        <>
            {currentNoty && (
                <NotyQuanty
                    key={currentNoty.id}
                    message={currentNoty.message}
                    show={true}  // Always show the current notification
                    onClose={() => handleClose(currentNoty.id)}
                />
            )}
        </>
    );
};

export default Notifications;