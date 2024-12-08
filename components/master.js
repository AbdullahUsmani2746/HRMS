import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SubscriptionPlanMaster = ({ onNext, initialData = {} }) => {
  const [planName, setPlanName] = useState(initialData.planName || '');
  const [subscriptionFee, setSubscriptionFee] = useState(initialData.subscriptionFee || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData._id) {
        // Edit existing plan
        await axios.put(`/api/subscriptionPlanMaster/${initialData._id}`, { planName, subscriptionFee });
        onNext(initialData._id);
      } else {
        // Create new plan
        const planResponse = await axios.post('/api/subscriptionPlanMaster', { planName, subscriptionFee });
        const planId = planResponse.data.data._id;
        onNext(planId);
      }
    } catch (error) {
      console.error('Error creating/updating plan:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Plan Name" />
      <Input type="number" value={subscriptionFee} onChange={(e) => setSubscriptionFee(e.target.value)} placeholder="Subscription Fee" />
      <Button type="submit">{initialData._id ? 'Update Plan' : 'Create Plan'}</Button>
    </form>
  );
};


export default SubscriptionPlanMaster;
