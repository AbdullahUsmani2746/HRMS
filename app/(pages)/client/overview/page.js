"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  Plus,
  UserPlus
} from "lucide-react";
import { useState } from "react";

const Overview = () => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Review timesheets", completed: false,  },
    { id: 2, title: "Approve vacation requests", completed: false },
    { id: 3, title: "Schedule team meeting", completed: true, },
    { id: 4, title: "Update employee records", completed: false, }
  ]);
  const [newTask, setNewTask] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New timesheet submission", type: "info" },
    { id: 2, message: "Overtime approval needed", type: "warning" }
  ]);
  const { toast } = useToast();

  // Calculate days until payday
  const calculateDaysUntilPayday = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysUntil = Math.ceil((lastDayOfMonth - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  // Task management functions
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: tasks.length + 1,
        title: newTask,
        completed: false,
      };
      setTasks([...tasks, task]);
      setNewTask("");
      toast({
        title: "Task added",
        description: "New task has been successfully created",
      });
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task removed",
      description: "Task has been deleted",
      variant: "destructive"
    });
  };

  // Quick action handler
  const handleQuickAction = (action) => {
    toast({
      title: "Quick Action",
      description: `${action} action initiated`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here&apos;s your summary</p>
        </motion.div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Payday Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="bg-gradient-to-r from-foreground to-foreground text-white">
              <CardContent className="flex justify-between items-center p-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {calculateDaysUntilPayday()} days until payday
                  </h2>
                  <p className="text-gray-100">Next payment: {new Date().toLocaleDateString()}</p>
                </div>
                <Calendar className="w-16 h-16 opacity-80" />
              </CardContent>
            </Card>
          </motion.div>

           {/* Tasks */}
           <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Badge variant="secondary">{tasks.length} items</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button onClick={addTask}>Add</Button>
                </div>
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-2"
                    >
                      <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-4 h-4 mr-3"
                        />
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </span>
                        {/* <Badge variant={task.priority}>{task.priority}</Badge> */}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Quick Actions</span>
                  <Badge variant="outline" className="ml-2">New</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Plus, label: "Add Time Entry" },
                  { icon: UserPlus, label: "Add Employee" },
                  { icon: Clock, label: "Approve Time" },
                  { icon: FileText, label: "Run Report" },
                  { icon: Mail, label: "Invite Team" }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action.label)}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <action.icon className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="flex-1 text-left">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

         

         
        </div>
      </div>
    </div>
  );
};

export default Overview;