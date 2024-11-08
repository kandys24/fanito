import React, { useState } from 'react';
import { IoAddOutline } from "react-icons/io5";
import { MdOutlineDone } from "react-icons/md";
import axios from 'axios';
import getTokenConfig from '../../../axiosconfig/config';
import { API_URL } from '../../../constant/config';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SerieDetails = ({ series, setSeries, setIsToUpdate }) => {
    const [newSerie, setNewSerie] = useState({ serieName: '' });
    const [showAddSerie, setShowAddSerie] = useState(false);

    const handleAddSerie = () => {
        const newId = series.length ? series[series.length - 1].id + 1 : 1;
        const newSerieData = { ...newSerie, id: newId, defaultValue: false };
        setSeries([newSerieData, ...series]);  // Add the new series at the beginning
        setNewSerie({ serieName: '' });
        setShowAddSerie(false);
        setIsToUpdate(true);
    };

    const handleDeleteSerie = async (serieId) => {
        try {
            const config = getTokenConfig();
            await axios.delete(`${API_URL}/series/delete-serie/${serieId}`, config);
            setSeries(series.filter(serie => serie.id !== serieId));
            setIsToUpdate(false);
        } catch (error) {
            console.error('Error deleting serie:', error);
            alert('Failed to delete serie');
        }
    };

    const handleSetDefault = (serieId) => {
        setSeries(series.map(serie =>
            serie.id === serieId
                ? { ...serie, defaultValue: true }
                : { ...serie, defaultValue: false }
        ));
        setIsToUpdate(true);
    };

    useGSAP(() => {
        gsap.fromTo('#mySerieDetails_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);

    return (
        <div id='mySerieDetails_main' className="mt-5 bg-white dark:bg-[#0E0E0E] p-6 rounded-xl shadow">
            <h2 className="text-xl mb-4">Series</h2>
            {/* <h3 className="text-lg mb-2">Série de documentos</h3> */}
            <table className="w-full text-left mb-4">
                <thead>
                    <tr>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Default</th>
                        <th className="pb-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {series.map((serie) => (
                        <tr key={serie.id}>
                            <td className="py-2">{serie.serieName}</td>
                            <td className="py-2">
                                {serie.defaultValue ? (
                                    <MdOutlineDone className='text-xl' />
                                ) : (
                                    <button
                                        onClick={() => handleSetDefault(serie.id)}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Preset
                                    </button>
                                )}
                            </td>
                            <td className="py-2">
                                <button
                                    onClick={() => handleSetDefault(serie.id)}
                                    className="underline mr-2"
                                >
                                    Edit
                                </button>
                                {!serie.defaultValue && (
                                    <button
                                        onClick={() => handleDeleteSerie(serie.id)}
                                        className="underline"
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {showAddSerie && (
                        <tr className="">
                            <td className="py-2">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                    value={newSerie.serieName}
                                    onChange={(e) => setNewSerie({ ...newSerie, serieName: e.target.value })}
                                />
                            </td>
                            <td className="py-2"></td>
                            <td className="py-2"></td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!showAddSerie && (
                <button
                    onClick={() => setShowAddSerie(true)}
                    className='text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center'
                >
                    <IoAddOutline className='text-xl' /> New series
                </button>
            )}

            {showAddSerie && (
                <button
                    onClick={handleAddSerie}
                    className='mt-3 text-sm py-2 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center
                        text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900
                        '
                >
                    <IoAddOutline className='text-xl' /> Add series
                </button>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Default Series - This is the series that, by default, will be applied to the documents created.
            </p>
        </div>
    );
};

export default SerieDetails;
