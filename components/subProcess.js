import { useState, useEffect } from 'react';
import axios from 'axios';  // Make sure axios is imported
import SubscriptionPlanMaster from './master';
import SelectApplications from './planApplication';
import AssignPlanDetails from './planDeatail';

const SubscriptionProcess = ({ editMode, initialData,onClose }) => {
  // Set the current step based on the editMode flag
  const [currentStep, setCurrentStep] = useState(editMode ? 2 : 1);

  // Plan ID is set only in editMode or after plan creation
  const [planId, setPlanId] = useState(editMode ? initialData._id : '');

  // Set selected applications to initialData or empty array
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [applications, setApplications] = useState([]);  // State to store the applications fetched

  // Fetch applications when editMode is true and planId is set
  useEffect(() => {
    const fetchApplications = async () => {
      if (editMode && planId) {
        try {
          // Assuming you have an API endpoint like '/api/subscriptionPlanApplications'
          const response = await axios.get(`/api/subscriptionPlanApplications?planId=${planId}`);
          const fetchedApplications = response.data.data || [];
          setApplications(fetchedApplications);  // Set the applications fetched from the API

          // // Set selected applications (if any exist in initialData)
          // const selectedAppIds = fetchedApplications.map((app) => app.applicationId);
          // setSelectedApplications(selectedAppIds);

        } catch (error) {
          console.error('Error fetching applications:', error);
        }
      }
    };

    fetchApplications();
  }, [editMode, planId]);  // Dependency array ensures it only runs when editMode or planId changes

  // Handle the plan creation step (moves to the next step)
  const handlePlanCreated = (planId) => {
    setPlanId(planId);
    setCurrentStep(2); // Move to step 2 after plan is created
  };

  // Handle the application selection step (moves to the next step)
  const handleApplicationsSelected = (applications) => {
    setSelectedApplications(applications);
    setCurrentStep(3); // Move to step 3 after applications are selected
  };

  return (
    <div className="p-2">
      {/* Step 1: Plan creation */}
      {currentStep === 1 && <SubscriptionPlanMaster onNext={handlePlanCreated} />}

      {/* Step 2: Select applications */}
      {currentStep === 2 && (
        <SelectApplications
          isEdit={editMode}
          planId={planId}
          selectedApplications={applications}
          // applications={applications} // Pass fetched applications here
          onNext={handleApplicationsSelected}
        />
      )}

      {/* Step 3: Assign plan details */}
      {currentStep === 3 && (
        <AssignPlanDetails
          // isEdit={editMode}
          planId={planId}
          onClose={onClose}
          // applicationIds={selectedApplications}
          // details={editMode ? initialData.details : []} // Make sure details are passed correctly
        />
      )}
    </div>
  );
};

export default SubscriptionProcess;
