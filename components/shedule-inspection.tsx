import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 

interface ScheduleInspectionDateProps {
  onDateSelect?: (date: string) => void;
}

const ScheduleInspectionDate: React.FC<ScheduleInspectionDateProps> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date.toISOString().split('T')[0]); 
    }
  };

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        customInput={
          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-2 text-xs text-white bg-[#00a63e] border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {selectedDate ? selectedDate.toLocaleDateString() : 'Schedule Inspection'}
          </button>
        }
        dateFormat="yyyy-MM-dd"
      />
    </div>
  );
};

export default ScheduleInspectionDate;