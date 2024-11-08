import React, { useEffect, useRef, useState } from 'react';
import MyLineChart from '../MyCharts/MyLineChart';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const LineChartContent = () => {
    const [inView, setInView] = useState(false);
    const myLineChartRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect(); // Disconnect after animation trigger
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the component is in view
            }
        );

        if (myLineChartRef.current) {
            observer.observe(myLineChartRef.current);
        }

        return () => {
            if (myLineChartRef.current) {
                observer.unobserve(myLineChartRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (inView) {
            gsap.fromTo(
                '.myLineChart', 
                {
                    opacity: 0,
                    y: 20,
                }, 
                {
                    opacity: 1,
                    y: 0,
                    delay: 1,
                    stagger: 0.05,
                }
            );
        }
    }, [inView]);

    useGSAP(() => {
        if (inView) {
            gsap.fromTo(
                '.letter_linetitle', 
                {
                    opacity: 0,
                    y: 20,
                }, 
                {
                    opacity: 1,
                    y: 0,
                    delay: 1.3,
                    stagger: 0.05,
                }
            )
        }
    }, [inView]);

    const splitText = (text) => {
        return text.split("").map((char, index) => (
            <span key={index} className="letter_linetitle">
                {char}
            </span>
        ));
    };

    return (
        <div ref={myLineChartRef} className='w-full myLineChart opacity-0'>
            <label className='flex items-end'>
                <h1 className="text-3xl">{splitText("Best Sellers")}</h1>
            </label>
            <div className='flex w-full h-[400px] mt-3'>
                <MyLineChart />
            </div>
        </div>
    )
}

export default LineChartContent;