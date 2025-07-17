export const getTimelinePosition = (startDate, endDate, projectStartDate, projectEndDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const projectStart = new Date(projectStartDate);
  const projectEnd = new Date(projectEndDate);
  
  const totalDays = (projectEnd - projectStart) / (1000 * 60 * 60 * 24);
  const startOffset = (start - projectStart) / (1000 * 60 * 60 * 24);
  const duration = (end - start) / (1000 * 60 * 60 * 24);
  
  return {
    left: `${(startOffset / totalDays) * 100}%`,
    width: `${(duration / totalDays) * 100}%`
  };
};

// Helper function to format dates
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get month label positions for timeline
export const getMonthLabels = (projectStartDate, projectEndDate) => {
  const projectStart = new Date(projectStartDate);
  const projectEnd = new Date(projectEndDate);
  const totalDays = (projectEnd - projectStart) / (1000 * 60 * 60 * 24);
  
  const months = [];
  let currentDate = new Date(projectStart);
  
  while (currentDate <= projectEnd) {
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    if (firstOfMonth >= projectStart && firstOfMonth <= projectEnd) {
      const daysOffset = (firstOfMonth - projectStart) / (1000 * 60 * 60 * 24);
      const position = (daysOffset / totalDays) * 100;
      const monthName = firstOfMonth.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        name: monthName,
        position: `${position}%`
      });
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
};

// Calculate today's position on the timeline
export const calculateTodayPosition = (projectStartDate, projectEndDate) => {
  const today = new Date();
  const projectStart = new Date(projectStartDate);
  const projectEnd = new Date(projectEndDate);
  
  if (today < projectStart) return '0%';
  if (today > projectEnd) return '100%';
  
  const totalDays = (projectEnd - projectStart) / (1000 * 60 * 60 * 24);
  const daysOffset = (today - projectStart) / (1000 * 60 * 60 * 24);
  
  return `${(daysOffset / totalDays) * 100}%`;
};