import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import gsap from 'gsap';

const MainNotifications = ({ isToShowNotify, notificationMessage, style }) => {
    const [showNoty, setShowNoty] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (isToShowNotify && notificationMessage) {
            setShowNoty(true);
            // Animation to slide in notification
            gsap.fromTo(
                notificationRef.current,
                { y: '-100%' },
                { y: '0%', duration: 0.5, ease: 'power3.out' }
            );

            // Auto-hide notification after 3 seconds
            const timer = setTimeout(() => {
                gsap.to(notificationRef.current, {
                    y: '-100%',
                    duration: 0.5,
                    ease: 'power3.in',
                    onComplete: () => setShowNoty(false),
                });
            }, 3000);

            // Clean up the timer if the component unmounts or re-renders
            return () => clearTimeout(timer);
        }
    }, [isToShowNotify, notificationMessage]);

    const handleClose = () => {
        // Animation to close the notification
        gsap.to(notificationRef.current, {
            y: '-100%',
            duration: 0.5,
            ease: 'power3.in',
            onComplete: () => setShowNoty(false),
        });
    };

    // Render the notification if `showNoty` is true
    const notificationContent = showNoty && (
        <div
            ref={notificationRef}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-gray-700 rounded-lg shadow-lg z-[9999] ${style}`}
        >
            {notificationMessage}
            {/* Optional: Close button to manually dismiss the notification */}
            {/* <button
                onClick={handleClose}
                className="absolute top-1 right-1 text-xl font-bold"
            >
                &times;
            </button> */}
        </div>
    );

    // Use React Portal to render the notification at the top level of the DOM
    return ReactDOM.createPortal(notificationContent, document.body);
};

export default MainNotifications;