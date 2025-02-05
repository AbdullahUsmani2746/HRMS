import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, CheckSquare } from 'lucide-react';

// Animation configurations matching the previous components
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  }
};

const SelectApplications = ({ isEdit, planId, selectedApplications = [], onNext, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(selectedApplications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const allAppsResponse = await axios.get('/api/applications');
        const allApplications = allAppsResponse.data.data;
        setApplications(allApplications);

        if (isEdit && planId) {
          const assignedResponse = await axios.get(
            `/api/subscriptionPlanApplications?planId=${planId}`
          );
          const assignedApplications = assignedResponse.data.data.map((app) => app.applicationId);
          setSelected(assignedApplications);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isEdit, planId]);

  const handleApplicationChange = (applicationId) => {
    setSelected((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isEdit) {
        await axios.post('/api/subscriptionPlanApplications', {
          planId,
          applicationIds: selected,
        });
      } else {
        await axios.put(`/api/subscriptionPlanApplications/${planId}`, {
          applicationIds: selected,
        });
      }
      onNext(selected);
    } catch (error) {
      console.error('Error assigning applications:', error);
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
            {isEdit ? 'Edit Plan Applications' : 'Select Plan Applications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={ANIMATION_VARIANTS.item}
              className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
            >
              <div className="grid gap-4">
                {applications.map((app) => (
                  <motion.div
                    key={app._id}
                    variants={ANIMATION_VARIANTS.item}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/10 transition-colors"
                  >
                    <Checkbox
                      id={app._id}
                      checked={selected.includes(app._id)}
                      onCheckedChange={() => handleApplicationChange(app._id)}
                      className="data-[state=checked]:bg-background data-[state=checked]:text-foreground"
                    />
                    <label
                      htmlFor={app._id}
                      className="flex-grow text-background cursor-pointer"
                    >
                      {app.applicationName}
                    </label>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              {onClose && (
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-background/10 text-foreground hover:bg-background/5"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="bg-background text-foreground hover:bg-background/90"
                disabled={loading}
              >
                {isEdit ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Update Applications
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Applications
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SelectApplications;