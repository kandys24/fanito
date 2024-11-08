import React, { useRef, useEffect, useState } from 'react';
import MyPieChart from '../MyCharts/MyPieChart';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const PieChartContent = () => {
    const [inView, setInView] = useState(false);
    const myPieChartRef = useRef(null);

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

        if (myPieChartRef.current) {
            observer.observe(myPieChartRef.current);
        }

        return () => {
            if (myPieChartRef.current) {
                observer.unobserve(myPieChartRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (inView) {
            gsap.fromTo(
                '.myPieChart', 
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
        }
    }, [inView]);

    useGSAP(() => {
        if(inView){
            gsap.fromTo(
                '.letter_pietitle', 
                {
                    opacity: 0,
                    y: 20,
                }, 
                {
                    opacity: 1,
                    y: 0,
                    delay: 0.53,
                    stagger: 0.05,
                }
            );
        }
    }, [inView]);
    
    const splitText = (text) => {
        return text.split("").map((char, index) => (
            <span key={index} className="letter_pietitle">
                {char}
            </span>
        ));
    };

    return (
        <div ref={myPieChartRef} className='w-full myPieChart opacity-0'>
            <label className='flex items-end'>
                <h1 className="text-3xl">{splitText("Top customers")}</h1>
            </label>
            <div className='flex w-full h-[400px] mt-3'>
                <MyPieChart />
            </div>
        </div>
    )
}

export default PieChartContent;