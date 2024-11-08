import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import gsap from 'gsap';

const NotyQuanty = ({ message, show, onClose }) => {
    const notificationRef = useRef(null);

    useEffect(() => {
        if (show) {
            gsap.fromTo(
                notificationRef.current,
                { y: '-100%' },
                { y: '0%', duration: 0.5, ease: 'power3.out' }
            );

            const timer = setTimeout(() => {
                gsap.to(notificationRef.current, {
                    y: '-100%',
                    duration: 0.5,
                    ease: 'power3.in',
                    onComplete: onClose,
                });
            }, 3000); // Auto-hide after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    // Create the notification JSX
    const notificationContent = show && (
        <div
            ref={notificationRef}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-gray-700 text-white rounded-lg shadow-lg z-[9999]"
        >
            {message}
            {/* <button
                onClick={() => {
                    gsap.to(notificationRef.current, {
                        y: '-100%',
                        duration: 0.5,
                        ease: 'power3.in',
                        onComplete: onClose,
                    });
                }}
                className="absolute top-1 right-1 text-xl font-bold"
            >
                &times;
            </button> */}
        </div>
    );

    // Use React Portal to render at the top of the DOM tree
    return ReactDOM.createPortal(notificationContent, document.body);
};

export default NotyQuanty;
