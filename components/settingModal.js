"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  ChevronRight,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";

const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("tax");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("Monthly");
  const [isLoading, setIsLoading] = useState(false);

  const [payeConditions, setPayeConditions] = useState({
    Weekly: [
      { id: 1, min: 0, max: 288, rate: 0, subtract: 0 },
      { id: 2, min: 288.01, max: 481, rate: 20, subtract: 57.6 },
      { id: 3, min: 481.01, max: 100000000000000000000000000000000000000, rate: 27, subtract: 91.27 },
    ],
    Fortnightly: [
      { id: 1, min: 0, max: 576, rate: 0, subtract: 0 },
      { id: 2, min: 576.01, max: 962, rate: 20, subtract: 115.2 },
      { id: 3, min: 962.01, max: 100000000000000000000000000000000000000, rate: 27, subtract: 182.54 },
    ],
    Monthly: [
      { id: 1, min: 0, max: 1250, rate: 0, subtract: 0 },
      { id: 2, min: 1250.01, max: 2083, rate: 20, subtract: 250 },
      { id: 3, min: 2083.01, max: 100000000000000000000000000000000000000, rate: 27, subtract: 395.81 },
    ],
  });

  const [taxSettings, setTaxSettings] = useState({
    acc: {
      employee: 1,
      employer: 1,
    },
    npf: {
      employee: 10,
      employer: 10,
    },
  });

  const tabs = [
    { id: "tax", label: "Tax Configuration" },
    { id: "general", label: "General Settings" },
    { id: "appearance", label: "Appearance" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedTaxSettings = localStorage.getItem("taxSettings");
      const savedPayeConditions = localStorage.getItem("payeConditions");

      if (savedTaxSettings) {
        setTaxSettings(JSON.parse(savedTaxSettings));
      }

      if (savedPayeConditions) {
        setPayeConditions(JSON.parse(savedPayeConditions));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings", {
        description: "Please try refreshing the page",
      });
    }
  };

  const saveSettings = () => {
    setIsLoading(true);

    const promise = new Promise((resolve, reject) => {
      try {
        localStorage.setItem("taxSettings", JSON.stringify(taxSettings));
        localStorage.setItem("payeConditions", JSON.stringify(payeConditions));
        resolve();
      } catch (error) {
        console.error("Error saving settings:", error);
        reject(new Error("Failed to save settings"));
      }
    });

    toast.promise(promise, {
      loading: "Saving settings...",
      success: "Settings saved successfully",
      error: (err) => err.message,
    });

    promise.finally(() => {
      setIsLoading(false);
    });
  };

  const addPayeCondition = () => {
    const currentConditions = payeConditions[selectedPayPeriod];
    const lastCondition = currentConditions[currentConditions.length - 1];
    const newCondition = {
      id: currentConditions.length + 1,
      min: lastCondition.max,
      max: lastCondition.max + 50000,
      rate: 10,
      subtract: 0,
    };
    setPayeConditions({
      ...payeConditions,
      [selectedPayPeriod]: [...currentConditions, newCondition],
    });
    toast.success("New tax bracket added");
  };

  const updateTaxSetting = (tax, type, value) => {
    setTaxSettings({
      ...taxSettings,
      [tax]: {
        ...taxSettings[tax],
        [type]: Number(value),
      },
    });
  };

  return (
    <>
      <Toaster position="top-right" expand={false} richColors />
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
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg mb-2 flex items-center justify-between ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
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
                        <div className="flex gap-2">
                          <button
                            onClick={saveSettings}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-4 h-4" />
                            {isLoading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-muted rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {activeTab === "tax" && (
                        <div className="space-y-8">
                          <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">
                              ACC Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm mb-2">
                                  Employee Contribution (%)
                                </label>
                                <input
                                  type="number"
                                  value={taxSettings.acc.employee}
                                  onChange={(e) =>
                                    updateTaxSetting(
                                      "acc",
                                      "employee",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 rounded-md border border-border bg-background"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-2">
                                  Employer Contribution (%)
                                </label>
                                <input
                                  type="number"
                                  value={taxSettings.acc.employer}
                                  onChange={(e) =>
                                    updateTaxSetting(
                                      "acc",
                                      "employer",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 rounded-md border border-border bg-background"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">
                              NPF Configuration
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm mb-2">
                                  Employee Contribution (%)
                                </label>
                                <input
                                  type="number"
                                  value={taxSettings.npf.employee}
                                  onChange={(e) =>
                                    updateTaxSetting(
                                      "npf",
                                      "employee",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 rounded-md border border-border bg-background"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-2">
                                  Employer Contribution (%)
                                </label>
                                <input
                                  type="number"
                                  value={taxSettings.npf.employer}
                                  onChange={(e) =>
                                    updateTaxSetting(
                                      "npf",
                                      "employer",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 rounded-md border border-border bg-background"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">
                                PAYE Tax Brackets
                              </h3>
                              <div className="flex gap-4">
                                <select
                                  value={selectedPayPeriod}
                                  onChange={(e) =>
                                    setSelectedPayPeriod(e.target.value)
                                  }
                                  className="p-2 rounded-md border border-border bg-background"
                                >
                                  <option value="Weekly">Weekly</option>
                                  <option value="Fortnightly">
                                    Fortnightly
                                  </option>
                                  <option value="Monthly">Monthly</option>
                                </select>
                                <button
                                  onClick={addPayeCondition}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Bracket
                                </button>
                              </div>
                            </div>
                            <div className="space-y-4">
                              {payeConditions[selectedPayPeriod].map(
                                (condition) => (
                                  <div
                                    key={condition.id}
                                    className="grid grid-cols-4 gap-4"
                                  >
                                    <div>
                                      <label className="block text-sm mb-2">
                                        Min Amount
                                      </label>
                                      <input
                                        type="number"
                                        value={condition.min}
                                        onChange={(e) => {
                                          const updatedConditions = {
                                            ...payeConditions,
                                          };
                                          updatedConditions[selectedPayPeriod] =
                                            payeConditions[
                                              selectedPayPeriod
                                            ].map((c) =>
                                              c.id === condition.id
                                                ? {
                                                    ...c,
                                                    min: Number(e.target.value),
                                                  }
                                                : c
                                            );
                                          setPayeConditions(updatedConditions);
                                        }}
                                        className="w-full p-2 rounded-md border border-border bg-background"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-2">
                                        Max Amount
                                      </label>
                                      <input
                                        type="number"
                                        value={condition.max}
                                        onChange={(e) => {
                                          const updatedConditions = {
                                            ...payeConditions,
                                          };
                                          updatedConditions[selectedPayPeriod] =
                                            payeConditions[
                                              selectedPayPeriod
                                            ].map((c) =>
                                              c.id === condition.id
                                                ? {
                                                    ...c,
                                                    max: Number(e.target.value),
                                                  }
                                                : c
                                            );
                                          setPayeConditions(updatedConditions);
                                        }}
                                        className="w-full p-2 rounded-md border border-border bg-background"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-2">
                                        Tax Rate (%)
                                      </label>
                                      <input
                                        type="number"
                                        value={condition.rate}
                                        onChange={(e) => {
                                          const updatedConditions = {
                                            ...payeConditions,
                                          };
                                          updatedConditions[selectedPayPeriod] =
                                            payeConditions[
                                              selectedPayPeriod
                                            ].map((c) =>
                                              c.id === condition.id
                                                ? {
                                                    ...c,
                                                    rate: Number(
                                                      e.target.value
                                                    ),
                                                  }
                                                : c
                                            );
                                          setPayeConditions(updatedConditions);
                                        }}
                                        className="w-full p-2 rounded-md border border-border bg-background"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-2">
                                        Subtract Amount
                                      </label>
                                      <input
                                        type="number"
                                        value={condition.subtract}
                                        onChange={(e) => {
                                          const updatedConditions = {
                                            ...payeConditions,
                                          };
                                          updatedConditions[selectedPayPeriod] =
                                            payeConditions[
                                              selectedPayPeriod
                                            ].map((c) =>
                                              c.id === condition.id
                                                ? {
                                                    ...c,
                                                    subtract: Number(
                                                      e.target.value
                                                    ),
                                                  }
                                                : c
                                            );
                                          setPayeConditions(updatedConditions);
                                        }}
                                        className="w-full p-2 rounded-md border border-border bg-background"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
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
    </>
  );
};

export default SettingsModal;
