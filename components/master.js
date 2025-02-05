import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, PenSquare, Percent } from 'lucide-react';

// Animation configurations for smooth transitions
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

const SubscriptionPlanMaster = ({ onNext, initialData = {}, onClose }) => {
  // State management for form fields
  const [formData, setFormData] = useState({
    planName: initialData.planName || '',
    subscriptionFee: initialData.subscriptionFee || ''
  });
  const [isEditing] = useState(!!initialData._id);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit existing plan
        await axios.put(`/api/subscriptionPlanMaster/${initialData._id}`, formData);
        onNext(initialData._id);
      } else {
        // Create new plan
        const planResponse = await axios.post('/api/subscriptionPlanMaster', formData);
        onNext(planResponse.data.data._id);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating/updating plan:', error);
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
            {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={ANIMATION_VARIANTS.item}
              className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
            >
              <div className="space-y-4">
                {/* Plan Name Input */}
                <div className="space-y-2">
                  <label className="text-sm text-background/60">
                    Plan Name
                  </label>
                  <div className="relative">
                    <PenSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                    <Input
                      value={formData.planName}
                      onChange={(e) => handleChange('planName', e.target.value)}
                      placeholder="Enter plan name"
                      type="text"
                      className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                      required
                    />
                  </div>
                </div>

                {/* Subscription Fee Input */}
                <div className="space-y-2">
                  <label className="text-sm text-background/60">
                    Subscription Fee
                  </label>
                  <div className="relative">
                    <PenSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
                    <Input
                      value={formData.subscriptionFee}
                      onChange={(e) => handleChange('subscriptionFee', e.target.value)}
                      placeholder="Enter subscription fee"
                      type="number"
                      className="pl-10 bg-background/5 border-background/10 text-background placeholder:text-background/40"
                      required
                    />
                  </div>
                </div>
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
              >
                {isEditing ? (
                  <>
                    <PenSquare className="w-4 h-4 mr-2" />
                    Update Plan
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Plan
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

export default SubscriptionPlanMaster;