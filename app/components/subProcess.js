import { useState } from 'react';
import SubscriptionPlanMaster from './master';
import SelectApplications from './planApplication';
import AssignPlanDetails from './planDeatail';

const SubscriptionProcess = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [planId, setPlanId] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);

  const handlePlanCreated = (planId) => {
    setPlanId(planId);
    setCurrentStep(2);
  };

  const handleApplicationsSelected = (applications) => {
    setSelectedApplications(applications);
    setCurrentStep(3);
  };

  return (
    <div className="p-2">
      {currentStep === 1 && <SubscriptionPlanMaster onNext={handlePlanCreated} />}
      {currentStep === 2 && <SelectApplications planId={planId} onNext={handleApplicationsSelected} />}
      {currentStep === 3 && <AssignPlanDetails planId={planId} applicationIds={selectedApplications} />}
    </div>
  );
};

export default SubscriptionProcess;
