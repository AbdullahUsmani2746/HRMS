// components/Sidebar.js
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { XCircleIcon, Bars3Icon } from "@heroicons/react/24/solid"; // Importing Heroicons for the close and open icons

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`fixed h-screen bg-blue-500 text-white ${isOpen ? 'w-64' : 'w-0'} transition-width duration-300 overflow-hidden`}>
            {isOpen && (
                <button onClick={toggleSidebar} className="absolute top-4 right-4 text-white hover:text-gray-300">
                    <XCircleIcon className="w-6 h-6" />
                </button>
            )}
            <ul className={`p-4 ${isOpen ? 'block' : 'hidden'}`}>
                <li className="mb-4"><Link href="/" className="text-xl">Dashboard</Link></li>
                <li className="mb-4"><Link href="/pages/employers" className="text-xl">Employers</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
