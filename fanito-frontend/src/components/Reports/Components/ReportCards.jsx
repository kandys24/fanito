import React from 'react';
import { RiFolderSharedLine, RiFolderReceivedLine, RiFolderKeyholeLine, RiFolderChart2Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

const reportData = [
    {
        icon: <RiFolderReceivedLine size={40} />,
        title: 'Total Invoiced',
        description: ['Learn about the invoices.'],
        path: '/reports/sales',
    },
    {
        icon: <RiFolderSharedLine size={40} />,
        title: 'Tax/VAT Map',
        description: [
            'Generate a listing of the taxes/VAT',
            'invoiced over a given period of time.'
        ],
        path: '/reports/tax',
    },
    {
        icon: <RiFolderReceivedLine size={40} />,
        title: 'Payments Made',
        description: [
            'Learn about the paid invoices.',
            'invoiced over a given period of time.'
        ],
        path: '/reports/totalpaid',
    },
    {
        icon: <RiFolderReceivedLine size={40} />,
        title: 'Client Invoicing',
        description: [
            'Learn about the Client.',
            'invoiced over a given period of time.'
        ],
        path: '/reports/client-invoice-report',
    },
    {
        icon: <RiFolderKeyholeLine size={40} />,
        title: 'General Report profits',
        description: [
            'Learn more about profits.',
            'Profits over a given period of time.'
        ],
        path: '/reports/summary-report',
    },
    {
        icon: <RiFolderChart2Line size={40} />,
        title: 'Daily Sales',
        description: [
            'Learn more about profits.',
            'Profits over a given period of time.'
        ],
        path: '/reports/daily-sales-report',
    },
];

const ReportCardButton = ({ icon, title, description, onClick }) => (
    <button
        className={`text-sm py-5 px-10 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                    bg-[#f1f1f1] dark:bg-black flex gap-2 items-center w-[350px]
                    text-black dark:text-white 
                    hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                    active:scale-95 active:shadow-inner`}
        onClick={onClick}
    >
        {icon}
        <label className="cursor-pointer">
            <p className="text-start text-base font-bold">{title}</p>
            {description.map((text, index) => (
                <p key={index} className="text-start text-xs">{text}</p>
            ))}
        </label>
    </button>
);

const ReportCards = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap gap-5 mt-5">
            {reportData.map(({ icon, title, description, path }, index) => (
                <ReportCardButton
                    key={index}
                    icon={icon}
                    title={title}
                    description={description}
                    onClick={() => navigate(path)}
                />
            ))}
        </div>
    );
};

export default ReportCards;