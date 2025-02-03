import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, PenSquare, Plus } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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

const DynamicFormComponent = ({
  title = 'Dynamic Form',
  fields = [],
  existingData = null,
  onSubmit,
  onClose,
  allowMultiple = true,
  endpoint = '',
}) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [data, setData] = useState([{}]);
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
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
      employerId
    };
    setData(updatedData);
  };

  const addData = () => {
    setData([...data, { employerId }]);
  };

  const removeData = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        await onSubmit(data, isEditing, editIndex);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const renderField = (field, value, index) => {
    const commonProps = {
      value: value || '',
      onChange: (e) => handleDataChange(index, field.name, e.target.value),
      placeholder: field.placeholder,
      className: "bg-background/5 border-background/10 text-background placeholder:text-background/40",
      required: field.required !== false,
    };

    if (field.type === 'select') {
        return (
          <div className="relative">
           <Select
          value={value?._id || value || ''}
          onValueChange={(selectedValue) => {
            const selectedOption = field.options.find(opt => opt.value === selectedValue);
            handleDataChange(index, field.name, {
              _id: selectedOption.value,
              [field.displayKey]: selectedOption.label  // Store both id and display value
            }); 
          }}
        >
              <SelectTrigger>
                <SelectValue 
              placeholder={value?.[field.displayKey] || field.placeholder} 
              />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

    if (field.type === 'textarea') {
      return (
        <div className="relative">
          {field.icon && (
            <field.icon className="absolute left-3 top-4 transform -translate-y-1/2 text-background/40 w-4 h-4" />
          )}
          <Textarea
            {...commonProps}
            className={`${commonProps.className} ${field.icon ? 'pl-10' : ''}`}
          />
        </div>
      );
    }

    return (
      <div className="relative">
        {field.icon && (
          <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background/40 w-4 h-4" />
        )}
        <Input
          {...commonProps}
          type={field.type || 'text'}
          className={`${commonProps.className} ${field.icon ? 'pl-10' : ''}`}
        />
      </div>
    );
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
            {isEditing ? `Edit ${title}` : `Create ${title}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {data.map((item, index) => (
                <motion.div
                  key={index}
                  variants={ANIMATION_VARIANTS.item}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
                >
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        {field.label && (
                          <label className="text-sm text-background/60">
                            {field.label}
                          </label>
                        )}
                        {renderField(field, item[field.name], index)}
                      </div>
                    ))}
                  </div>

                  {allowMultiple && (index > 0 || isEditing) && (
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
              {allowMultiple && !isEditing && (
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

export default DynamicFormComponent;