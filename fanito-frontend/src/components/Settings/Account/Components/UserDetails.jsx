import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';
import { IoAddOutline } from "react-icons/io5";
import getTokenConfig from '../../../../axiosconfig/config';
import { API_URL } from '../../../../constant/config';
import axios from 'axios';

const UserDetails = ({ users, setUsers, setIsToUpdate }) => {
    const [newUser, setNewUser] = useState({ email: '', role: 'admin' });
    const [showAddUser, setShowAddUser] = useState(false);

    const handleAddUser = () => {
        const newId = users.length ? users[users.length - 1].user_id + 1 : 1;
        const newUserData = { ...newUser, user_id: newId };
        setUsers([newUserData, ...users]); // Add the new user at the beginning
        setNewUser({ email: '', role: 'admin' });
        setShowAddUser(false);
        setIsToUpdate(true);
    };

    const handleDeleteUser = async(userId) => {
        try {
            const config = getTokenConfig();
            await axios.delete(`${API_URL}/users/delet-euser/${userId}`, config);
            setUsers(users.filter(user => user.user_id !== userId));
            setIsToUpdate(false);
        } catch (error) {
            console.error('Error deleting users:', error);
            alert('Failed to delete users');
        }
    };

    useGSAP(() => {
        gsap.fromTo('#myUserDetails_main', {
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
        <div id='myUserDetails_main' className="mt-5 bg-white dark:bg-[#0E0E0E] p-6 rounded-xl shadow">
            {/* <h2 className="text-xl mb-4">Utilizadores</h2> */}
            <h3 className="text-lg mb-2">Adicionar utilizador</h3>
            <table className="w-full text-left mb-4">
                <thead>
                    <tr>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Profile</th>
                        <th className="pb-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td className="py-2">{user.email}</td>
                            <td className="py-2">{user.role === 'admin' ? 'Administrator' : user.role === 'collab' ? 'Collaborator' : 'Seller' }</td>
                            <td className="py-2">
                                {user.role === 'admin' || 
                                    <button
                                        onClick={() => handleDeleteUser(user.user_id)}
                                        className="underline"
                                    >
                                        Delete
                                    </button>
                                }
                            </td>
                        </tr>
                    ))}
                    {showAddUser && (
                        <tr>
                            <td className="py-2">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </td>
                            <td className="py-2">
                                <select
                                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="collab">Collaborator</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </td>
                            <td className="py-2"></td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!showAddUser && (
                <button
                    onClick={() => setShowAddUser(true)}
                    className='text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center'
                >
                    <IoAddOutline className='text-xl' /> New user
                </button>
            )}

            {showAddUser && (
                <button
                    onClick={handleAddUser}
                    className='mt-3 text-sm py-2 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center
                        text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900
                        '
                >
                    <IoAddOutline className='text-xl' /> Add user
                </button>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Administrator - You can use all the features of the application and access all pages. You have permission to delete and create new users, change settings, and manage your account.
            </p>
        </div>
    );
};

export default UserDetails;
