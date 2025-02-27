import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaExclamationCircle, FaCheckCircle, FaHourglassHalf, FaList } from "react-icons/fa";

const HelpdeskDashboard = () => {
    const stats = [
        { title: "Total Complaints", value: Math.floor(Math.random() * 100), icon: <FaList className="text-blue-500 text-3xl" />, color: "text-blue-600" },
        { title: "Open Complaints", value: Math.floor(Math.random() * 50), icon: <FaExclamationCircle className="text-yellow-500 text-3xl" />, color: "text-yellow-600" },
        { title: "Closed Complaints", value: Math.floor(Math.random() * 70), icon: <FaCheckCircle className="text-green-500 text-3xl" />, color: "text-green-600" },
        { title: "In Progress", value: Math.floor(Math.random() * 30), icon: <FaHourglassHalf className="text-orange-500 text-3xl" />, color: "text-orange-600" },
    ];

    return (
        <div className="p-6 bg-blue-50 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 mb-4">
                Helpdesk Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="bg-white shadow-md rounded-xl px-4 py-2 transition-transform transform hover:scale-105 w-44 h-44 border-none"
                    >
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                {stat.icon}
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 flex items-center justify-between">
                            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default HelpdeskDashboard;
