"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

const ANIMATION_VARIANTS = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 },
        },
    },
    item: {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    },
};

const HelpdeskModal = ({ complaint, onClose, userRole }) => {
    const { data: session } = useSession();
    //   const IsResolver = session?.user?.isResolver;
    const isResolver = false;
    const [employeeName, setEmployeeName] = useState("Unknown Employee");
    const [questions, setQuestions] = useState(complaint.questions || []);
    const [complaintStatus, setComplaintStatus] = useState(complaint.status || "Open");


    useEffect(() => {
        if (complaint.employeeId) {
            axios.get(`/api/employees/${complaint.employeeId}`)
                .then(response => setEmployeeName(response.data.data || "Unknown Employee"))
                .catch(() => setEmployeeName("Unknown Employee"));
        }
    }, [complaint.employeeId]);

    const handleStatusChange = (index, newStatus) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].status = newStatus;
        setQuestions(updatedQuestions);
    };

    const handleAnswerChange = (index, answer) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answer = answer;
        setQuestions(updatedQuestions);
    };

    const handleUpdateStatus = async (index) => {
        const updatedQuestion = questions[index];
        try {
            await axios.put(`/api/helpdesk/${complaint._id}`, {
                status: updatedQuestion.status,
                answer: updatedQuestion.answer,
            });

            const allResolved = questions.every(q => q.status === "Resolved");
            if (allResolved) {
                setComplaintStatus("Closed");
                await axios.put(`/api/helpdesk/${complaint._id}`, { status: "Closed" });
            }
            alert("Status updated successfully!");
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    return (
        <motion.div variants={ANIMATION_VARIANTS.container} initial="hidden" animate="visible" className="w-full max-w-2xl mx-auto">
            <Card className="bg-foreground border-white/10 shadow-xl">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-background">
                        Helpdesk Complaint Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/5 border border-background/10">
                            <motion.div variants={ANIMATION_VARIANTS.item}>
                                <label className="text-sm text-background/60">Complaint #</label>
                                <p className="mt-1 text-background">{complaint.complaintNumber}</p>
                            </motion.div>
                            <motion.div variants={ANIMATION_VARIANTS.item}>
                                <label className="text-sm text-background/60">Employee ID</label>
                                <p className="mt-1 text-background">{complaint.employeeId}</p>
                            </motion.div>
                            <motion.div variants={ANIMATION_VARIANTS.item}>
                                <label className="text-sm text-background/60">Date</label>
                                <p className="mt-1 text-background">{format(new Date(complaint.date), "MMM dd, yyyy")}</p>
                            </motion.div>
                            <motion.div variants={ANIMATION_VARIANTS.item}>
                                <label className="text-sm text-background/60">Employee Name</label>
                                <p className="mt-1 text-background">{employeeName}</p>
                            </motion.div>
                        </div>

                        <Accordion type="single" collapsible className="border border-background/10 rounded-lg bg-background/5 text-background">
                            {questions.map((question, index) => (
                                <AccordionItem key={index} value={`question-${index}`} className="border-b border-background/10">
                                    <AccordionTrigger className="text-base p-3 font-semibold text-background ">
                                        <div className="flex justify-between items-center w-full pr-2">
                                            <p>
                                                #{index + 1}: {question.subject.length > 20 ? question.subject.slice(0, 20) + "..." : question.subject}

                                            </p>
                                            <Badge
                                                key={question.status}
                                                className={`text-white px-2 py-1 ${question.status === "In Progress" ? "bg-[#F5A623]" :
                                                    question.status === "To-Do" ? "bg-[#B0BEC5]" :
                                                        question.status === "Resolved" ? "bg-[#A8E5A6]" :
                                                            question.status === "Rejected" ? "bg-[#D0021B]" : " "
                                                    }`}
                                            >
                                                {question.status}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-3 space-y-4">
                                        <h3 className="text-sm font-medium text-background/80">Subject</h3>
                                        <textarea className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background" disabled value={question.subject} />
                                        <h3 className="text-sm font-medium text-background/80">Description</h3>
                                        <textarea className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background" disabled value={question.description} />
                                        <h3 className="text-sm font-medium text-background/80">Answer</h3>
                                        <textarea className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background"
                                            placeholder="Write your answer here..."
                                            value={question.answer || ""}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            disabled={isResolver ? false : true}
                                        />

                                        {isResolver && (
                                            <Select
                                                value={question.status}
                                                onValueChange={(value) => handleStatusChange(index, value)}

                                                className="bg-background/5 border-background/10 text-background w-[200px]"
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Rejected", "Resolved", "In Progress"].map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}




                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default HelpdeskModal;
