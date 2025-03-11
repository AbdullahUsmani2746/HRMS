import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaExclamationCircle, FaCheckCircle, FaHourglassHalf, FaList, FaThumbsUp, FaTimesCircle } from "react-icons/fa";

const HelpdeskDashboard = ({ refreshDashboard }) => {

    const { data: session } = useSession();
    const [questionCounts, setQuestionCounts] = useState({});
    const [complaintStatusCounts, setComplaintStatusCounts] = useState({});

    const stats = [
        { title: "Total Complaints", value: (complaintStatusCounts.Closed) + (complaintStatusCounts.open), icon: <FaList className="text-blue-500 text-3xl" />, color: "text-blue-600" },
        { title: "Open Complaints", value: (complaintStatusCounts.open), icon: <FaExclamationCircle className="text-yellow-500 text-3xl" />, color: "text-yellow-600" },
        { title: "Closed Complaints", value: (complaintStatusCounts.Closed), icon: <FaCheckCircle className="text-green-500 text-3xl" />, color: "text-green-600" },
        { title: "In Progress", value: (questionCounts["In Progress"]), icon: <FaHourglassHalf className="text-orange-500 text-3xl" />, color: "text-orange-600" },
        { title: "Resolved Complaints", value: (questionCounts.Resolved), icon: <FaThumbsUp className="text-purple-500 text-3xl" />, color: "text-purple-600" },
        { title: "Rejected Complaints", value: (questionCounts.Rejected), icon: <FaTimesCircle className="text-red-500 text-3xl" />, color: "text-red-600" },
    ];

    const employeeId = session?.user?.username;
    const employerId = `CLIENT-${employeeId.split("-")[0]}`;


    useEffect(() => {

        fetchCounts();
    }, [refreshDashboard])

    const fetchCounts = async () => {

        try {
            const response = await axios.get(`/api/helpdesk/${employerId}`);

            if (response) {
                setQuestionCounts(response.data.questionStatusCounts)
                setComplaintStatusCounts(response.data.complaintStatusCounts)
            }
        } catch (error) {

        }
    }

    return (
        <div className="p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-center gap-6">
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
