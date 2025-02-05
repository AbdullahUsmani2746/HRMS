import React, { useState } from 'react';
import { Plus, X, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tax');
  const [payeConditions, setPayeConditions] = useState([
    { id: 1, min: 0, max: 50000, rate: 10 }
  ]);

  const [taxSettings, setTaxSettings] = useState({
    acc: {
      employee: 1.39,
      employer: 2.95
    },
    npf: {
      employee: 5,
      employer: 10
    }
  });

  const tabs = [
    { id: 'tax', label: 'Tax Configuration' },
    { id: 'general', label: 'General Settings' },
    { id: 'appearance', label: 'Appearance' }
  ];

  const addPayeCondition = () => {
    const lastCondition = payeConditions[payeConditions.length - 1];
    const newCondition = {
      id: payeConditions.length + 1,
      min: lastCondition.max,
      max: lastCondition.max + 50000,
      rate: 10
    };
    setPayeConditions([...payeConditions, newCondition]);
  };

  const updatePayeCondition = (id, field, value) => {
    setPayeConditions(payeConditions.map(condition =>
      condition.id === id ? { ...condition, [field]: Number(value) } : condition
    ));
  };

  const updateTaxSetting = (tax, type, value) => {
    setTaxSettings({
      ...taxSettings,
      [tax]: {
        ...taxSettings[tax],
        [type]: Number(value)
      }
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <SettingsIcon className="w-4 h-4" />
        Settings
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
            >
              <div className="flex h-full">
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="w-64 bg-card border-r border-border p-4"
                >
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-2 flex items-center justify-between ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {tab.label}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex-1 p-6 overflow-y-auto"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Settings</h2>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-muted rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {activeTab === 'tax' && (
                      <div className="space-y-8">
                        <div className="bg-card border border-border rounded-lg p-6">
                          <h3 className="text-lg font-semibold mb-4">ACC Configuration</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm mb-2">Employee Contribution (%)</label>
                              <input
                                type="number"
                                value={taxSettings.acc.employee}
                                onChange={(e) => updateTaxSetting('acc', 'employee', e.target.value)}
                                className="w-full p-2 rounded-md border border-border bg-background"
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-2">Employer Contribution (%)</label>
                              <input
                                type="number"
                                value={taxSettings.acc.employer}
                                onChange={(e) => updateTaxSetting('acc', 'employer', e.target.value)}
                                className="w-full p-2 rounded-md border border-border bg-background"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                          <h3 className="text-lg font-semibold mb-4">NPF Configuration</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm mb-2">Employee Contribution (%)</label>
                              <input
                                type="number"
                                value={taxSettings.npf.employee}
                                onChange={(e) => updateTaxSetting('npf', 'employee', e.target.value)}
                                className="w-full p-2 rounded-md border border-border bg-background"
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-2">Employer Contribution (%)</label>
                              <input
                                type="number"
                                value={taxSettings.npf.employer}
                                onChange={(e) => updateTaxSetting('npf', 'employer', e.target.value)}
                                className="w-full p-2 rounded-md border border-border bg-background"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">PAYE Tax Brackets</h3>
                            <button
                              onClick={addPayeCondition}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                              <Plus className="w-4 h-4" />
                              Add Bracket
                            </button>
                          </div>
                          <div className="space-y-4">
                            {payeConditions.map((condition) => (
                              <div key={condition.id} className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm mb-2">Min Amount</label>
                                  <input
                                    type="number"
                                    value={condition.min}
                                    onChange={(e) => updatePayeCondition(condition.id, 'min', e.target.value)}
                                    className="w-full p-2 rounded-md border border-border bg-background"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm mb-2">Max Amount</label>
                                  <input
                                    type="number"
                                    value={condition.max}
                                    onChange={(e) => updatePayeCondition(condition.id, 'max', e.target.value)}
                                    className="w-full p-2 rounded-md border border-border bg-background"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm mb-2">Tax Rate (%)</label>
                                  <input
                                    type="number"
                                    value={condition.rate}
                                    onChange={(e) => updatePayeCondition(condition.id, 'rate', e.target.value)}
                                    className="w-full p-2 rounded-md border border-border bg-background"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'general' && (
                      <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                        <p className="text-muted-foreground">Configure general HRMS settings here.</p>
                      </div>
                    )}

                    {activeTab === 'appearance' && (
                      <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                        <p className="text-muted-foreground">Customize the look and feel of your HRMS.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsModal;