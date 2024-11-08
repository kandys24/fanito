import React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SplitText = ({ text }) => { // Destructure text from props
    useGSAP(() => {
        gsap.fromTo(
            '.letter', 
            {
                opacity: 0,
                y: 20,
            }, 
            {
                opacity: 1,
                y: 0,
                delay: 0.5,
                stagger: 0.05,
            }
        );
    }, []);

    return (
        <>
            {text ? text.split("").map((char, index) => ( // Check if text exists
                <span key={index} className="letter">
                    {char}
                </span>
            )) : null}
        </>
    );
}

export default SplitText;