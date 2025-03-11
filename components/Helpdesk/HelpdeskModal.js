"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { XCircle } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

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

const HelpdeskModal = ({ complaint, onClose, userRole, onStatusUpdate }) => {
    const { data: session } = useSession();
    //   const IsResolver = session?.user?.isResolver;
    let isResolver;
    if (session?.user?.isResolver || (session.user?.role === "admin")) {
        isResolver = true
    } else {
        isResolver = false
    }
    // const isResolver = true;
    const [employeeName, setEmployeeName] = useState("Unknown Employee");
    const [questions, setQuestions] = useState(complaint.questions || []);
    const [complaintStatus, setComplaintStatus] = useState(complaint.status || "Open");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(null);


    useEffect(() => {
        if (complaint.employeeId) {
            axios.get(`/api/employees/${complaint.employeeId}`)
                .then(response => setEmployeeName(response.data.data || "Unknown Employee"))
                .catch(() => setEmployeeName("Unknown Employee"));
        }
    }, [complaint.employeeId]);

    const handleStatusChange = (index, newStatus) => {
        if (newStatus === "Rejected") {
            setSelectedIndex(index);
            setShowRejectDialog(true);
        } else {
            const updatedQuestions = [...questions];
            updatedQuestions[index].status = newStatus;
            setQuestions(updatedQuestions);
        }
    };

    const handleRejectConfirm = async () => {
        const updatedQuestions = [...questions];
        updatedQuestions[selectedIndex].status = "Rejected";
        updatedQuestions[selectedIndex].rejectionReason = rejectionReason;
        setQuestions(updatedQuestions);

        try {
            await axios.put(`/api/helpdesk/${complaint._id}`, {
                status: "Rejected",
                rejectionReason,
                index: selectedIndex,
                complaint: false
            });
            toast.success("Rejection reason saved successfully!", {
                className: 'bg-green-500 text-white',
            });
            const allClosed = questions.every(q =>
                q.status === "Resolved" || q.status === "Rejected"
            );

            if (allClosed) {
                setComplaintStatus("Closed");
                await axios.put(`/api/helpdesk/${complaint._id}`, { status: "Closed", complaint: true });
            }

            onStatusUpdate();
            setShowRejectDialog(false);
            onClose();
        } catch (error) {
            console.error("Error saving rejection reason:", error);
            toast.error("Failed to save rejection reason.");
        }
    };

    const handleAnswerChange = (index, answers) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answers = answers;
        setQuestions(updatedQuestions);
    };

    const handleUpdateStatus = async (index) => {
        const updatedQuestion = questions[index];
        console.log(updatedQuestion.status)
        try {

            await axios.put(`/api/helpdesk/${complaint._id}`, {
                status: updatedQuestion.status,
                answer: updatedQuestion.answers,
                index: index,
                complaint: false
            });


            const allClosed = questions.every(q =>
                q.status === "Resolved" || q.status === "Rejected"
            );

            if (allClosed) {
                setComplaintStatus("Closed");
                await axios.put(`/api/helpdesk/${complaint._id}`, { status: "Closed", complaint: true });
            }

            onStatusUpdate();
            onClose();

            toast.success("Status updated successfully!", {
                className: 'bg-green-500 text-white',
            });

        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status.");
        }
    };
    const handleSaveAnswer = async (index) => {
        const updatedQuestion = questions[index];
        try {
            await axios.put(`/api/helpdesk/${complaint._id}`, {
                answer: updatedQuestion.answers,
                status: updatedQuestion.status,
                index: index,
                complaint: false
            });

            onClose();

            const allClosed = questions.every(q =>
                q.status === "Resolved" || q.status === "Rejected"
            );

            if (allClosed) {
                setComplaintStatus("Closed");
                await axios.put(`/api/helpdesk/${complaint._id}`, { status: "Closed", complaint: true });
            }
            toast.success("Answer saved successfully!", {
                className: 'bg-green-500 text-white',
            });
        } catch (error) {
            console.error("Error saving answer:", error);
            toast.error("Failed to save answer.");
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

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            key={question.status}
                                                            className={`relative flex items-center gap-2 text-white px-2 py-1 ${question.status === "In Progress" ? "bg-[#F5A623]" :
                                                                question.status === "To-Do" ? "bg-[#B0BEC5]" :
                                                                    question.status === "Resolved" ? "bg-green-600" :
                                                                        question.status === "Rejected" ? "bg-[#D0021B]" : ""
                                                                }`}
                                                        >
                                                            {question.status}
                                                            {question.status === "Rejected" && <XCircle className="w-4 h-4" />}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    {question.status === "Rejected" && (
                                                        <TooltipContent className="bg-gray-800 text-white p-2 rounded-md shadow-lg">
                                                            <p className="text-sm">Reason: {question.rejectionReason || "No reason provided"}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-3 space-y-2">
                                        <h3 className="text-sm font-medium text-background/80">Subject</h3>
                                        <textarea className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background" disabled value={question.subject} />
                                        <h3 className="text-sm font-medium text-background/80">Description</h3>
                                        <textarea className="w-full p-2 border border-background/10 rounded-md bg-background/5 text-background" disabled value={question.description} />
                                        <h3 className="text-sm font-medium text-background/80">Answer</h3>
                                        <div className="relative w-full">
                                            <textarea
                                                className="w-full h-24 p-4 border border-background/10 rounded-md bg-background/5 text-background pr-16"
                                                placeholder="Write your answer here..."
                                                value={question.answers || ""}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                disabled={!isResolver}
                                            />
                                            {isResolver && (
                                                <Button
                                                    onClick={() => {
                                                        if (question.answers?.trim()) {
                                                            handleSaveAnswer(index);
                                                        } else {
                                                            toast.error("Answer field cannot be empty!", {
                                                                className: 'bg-red-500 text-white',
                                                            });
                                                        }
                                                    }}
                                                    className="absolute bottom-3 right-2 bg-primary text-white p-2 rounded-md"
                                                >
                                                    Save
                                                </Button>
                                            )}
                                        </div>


                                        {isResolver && (
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-medium text-background/80">Status</h3>
                                                <Select
                                                    value={question.status}
                                                    onValueChange={(value) => {

                                                        console.log(value !== "Rejected")
                                                        handleStatusChange(index, value)
                                                        value !== "Rejected" ? handleUpdateStatus(index) :
                                                            handleStatusChange(index, value);

                                                    }}
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
                                            </div>
                                        )}

                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </CardContent>
            </Card>
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Provide Rejection Reason</DialogTitle>
                        <DialogDescription>Please specify why this complaint is being rejected.</DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="w-full h-24 p-2 border rounded-md"
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Button onClick={handleRejectConfirm} className="mt-4 bg-red-500 text-white">
                        Confirm Rejection
                    </Button>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default HelpdeskModal;
