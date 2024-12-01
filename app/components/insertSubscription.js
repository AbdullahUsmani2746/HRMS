import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const InsertSubscriptionData = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationName, setApplicationName] = useState('');
  const [details, setDetails] = useState('');
  const [planName, setPlanName] = useState('');
  const [subscriptionFee, setSubscriptionFee] = useState('');
  const [planId, setPlanId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [status, setStatus] = useState('');
  const [grantee, setGrantee] = useState('');

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStep === 1) {
        const planResponse = await axios.post('/api/subscriptionPlanMaster', { planName, subscriptionFee });
        setPlanId(planResponse.data.data._id);
        handleNextStep();
      } else if (currentStep === 2) {
        const appResponse = await axios.post('/api/applications', { applicationName, details });
        setApplicationId(appResponse.data.data._id);
        handleNextStep();
      } else if (currentStep === 3) {
        await axios.post('/api/subscriptionPlanApplications', { planId, applicationId });
        handleNextStep();
      } else if (currentStep === 4) {
        await axios.post('/api/subscriptionPlanDetail', { planId, applicationId, status, grantee });
        console.log('Data inserted successfully');
      }
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Insert Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep === 1 && (
          <>
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
            <Button type="submit">Next</Button>
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Application Name</label>
              <Input 
                type="text" 
                value={applicationName} 
                onChange={(e) => setApplicationName(e.target.value)} 
                placeholder="Application Name" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <Input 
                type="text" 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                placeholder="Details" 
                required 
              />
            </div>
            <Button onClick={handlePreviousStep}>Previous</Button>
            <Button type="submit">Next</Button>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Plan ID</label>
              <Input 
                type="text" 
                value={planId} 
                onChange={(e) => setPlanId(e.target.value)} 
                placeholder="Plan ID" 
                required 
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Application ID</label>
              <Input 
                type="text" 
                value={applicationId} 
                onChange={(e) => setApplicationId(e.target.value)} 
                placeholder="Application ID" 
                required 
                disabled
              />
            </div>
            <Button onClick={handlePreviousStep}>Previous</Button>
            <Button type="submit">Next</Button>
          </>
        )}
        
        {currentStep === 4 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRANTED">GRANTED</SelectItem>
                  <SelectItem value="REVOKED">REVOKED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Grantee</label>
              <Select 
                value={grantee} 
                onValueChange={(value) => setGrantee(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grantee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYER">EMPLOYER</SelectItem>
                  <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePreviousStep}>Previous</Button>
            <Button type="submit">Submit</Button>
          </>
        )}
      </form>
    </div>
  );
};

export default InsertSubscriptionData;
