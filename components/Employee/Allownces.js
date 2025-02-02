"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, FileText, Plus, Trash2, Save, PenSquare } from 'lucide-react';

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  }
};

const AllowanceComponent = ({ existingData = null, onClose }) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [data, setData] = useState([{
    allownce: '',
    allownce_description: '',
    rate: '',
    employerId: employerId
  }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (existingData) {
      setData([existingData]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingData]);

  const handleDataChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  const addData = () => {
    setData([...data, {
      allownce: '',
      allownce_description: '',
      rate: '',
      employerId: employerId
    }]);
  };

  const removeData = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editIndex !== null) {
        await axios.put(`/api/employees/allownce/${data[editIndex]._id}`, data[editIndex]);
      } else {
        await axios.post('/api/employees/allownce', { data });
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting Data:', error);
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-background">
            {isEditing ? 'Edit Allowance' : 'Create Allowance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {data.map((allowance, index) => (
                <motion.div
                  key={index}
                  variants={ANIMATION_VARIANTS.item}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                      <Input
                        value={allowance.allownce}
                        onChange={(e) => handleDataChange(index, 'allownce', e.target.value)}
                        placeholder="Allowance Name"
                        className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        required
                      />
                    </div>

                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                      <Input
                        value={allowance.allownce_description}
                        onChange={(e) => handleDataChange(index, 'allownce_description', e.target.value)}
                        placeholder="Allowance Description"
                        className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                      <Input
                        value={allowance.rate}
                        onChange={(e) => handleDataChange(index, 'rate', e.target.value)}
                        placeholder="Allowance Rate"
                        type="number"
                        className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                        required
                      />
                    </div>
                  </div>

                  {(index > 0 || isEditing) && (
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        type="button"
                        onClick={() => removeData(index)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-between pt-4 border-t border-background/10">
              {!isEditing && (
                <Button
                  type="button"
                  onClick={addData}
                  variant="outline"
                  className="border-background/10 text-foreground hover:bg-background/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-background/10 text-foreground hover:bg-background/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  {isEditing ? (
                    <>
                      <PenSquare className="w-4 h-4 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AllowanceComponent;