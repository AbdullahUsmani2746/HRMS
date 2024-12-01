import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SubscriptionPlanMaster = ({ onNext }) => {
  const [planName, setPlanName] = useState('');
  const [subscriptionFee, setSubscriptionFee] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planResponse = await axios.post('/api/subscriptionPlanMaster', { planName, subscriptionFee });
      const planId = planResponse.data.data._id;
      onNext(planId); // Proceed to the next step with the created plan ID
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Create Subscription Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Plan Name</label>
          <Input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Plan Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subscription Fee</label>
          <Input
            type="number"
            value={subscriptionFee}
            onChange={(e) => setSubscriptionFee(e.target.value)}
            placeholder="Subscription Fee"
            required
          />
        </div>
        <Button type="submit">Create Plan</Button>
      </form>
    </div>
  );
};

export default SubscriptionPlanMaster;
