
/**
 * Utility function to append data to FormData.
 * @param {FormData} formData - The FormData object to append the data to.
 * @param {Object} dataObject - An object where each key-value pair is to be appended to the FormData.
 */
export function appendDataToFormData(formData, dataObject) {
  for (let key in dataObject) {
    if (dataObject.hasOwnProperty(key)) {
      formData.append(key, dataObject[key]);
    }
  }
}

export function getColor(skill) {
    const colors = {
      HTML: "pink",
      CSS: "blue",
      JavaScript: "yellow",
      React: "cyan",
      Angular: "red",
      Vue: "green",
      PHP: "pink",
      Laravel: "blue",
      Python: "yellow",
      "Node.js": "cyan",
      Symfony: "red",
      Django: "purple",
      "Ruby on Rails": "orange",
    };
    return colors[skill] || "gray";
  }

export function formatDateTimeAMPM(timeString){
        if (!timeString || typeof timeString !== 'string') return '';

        // If input is in format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss"
        if (timeString.includes(' ')) {
            const parts = timeString.split(' ');
            timeString = parts[1]; // Extract the time part
        }

        const [hours, minutes, seconds = '00'] = timeString.split(':');
        const now = new Date();

        now.setHours(parseInt(hours, 10));
        now.setMinutes(parseInt(minutes, 10));
        now.setSeconds(parseInt(seconds, 10));
        now.setMilliseconds(0);

        if (isNaN(now.getTime())) {
            console.warn("Invalid time format:", timeString);
            return '';
        }

        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
};

export function getTimeAsDate (time) {
        if (!time) return null;
    
        // Handle "2025-04-21 19:30" or just "10:30 AM"
        if (typeof time === 'string') {
            // If it includes date part, extract just the time
            if (time.includes(' ')) {
                const parts = time.split(' ');
                const timePart = parts.length === 2 ? parts[1] : parts[0];
                time = timePart;
            }
    
            // Handle AM/PM
            const ampmMatch = time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if (!ampmMatch) return null;
    
            let hours = parseInt(ampmMatch[1]);
            const minutes = parseInt(ampmMatch[2]);
            const ampm = ampmMatch[3]?.toUpperCase();
    
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
    
            const now = new Date();
            now.setHours(hours);
            now.setMinutes(minutes);
            now.setSeconds(0);
            now.setMilliseconds(0);
    
            return now;
        }
    
        if (time instanceof Date) return time;
    
        return null;
    }; 

export function isToday(dateString) {
        const inputDate = new Date(dateString);
        const today = new Date();
  
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };

// Return Date in format DD-MM-YYYY (13-08-2025)
export function formatDate(date){
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
};

export function getToday(){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    return todayStr;
}

// return Date in format DD MM, YYYY (13 Aug, 2025)
export function shortformatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }
   

export function getSortedEmployees(employees = []) {
    return employees
        .filter(employee => {
            const role = (employee.role || '').toLowerCase();
            return role !== 'admin' && role !== 'super_admin';
        })
        .sort((a, b) => {
            const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
}

// export function formatDueLabel(dateInput) {
//     const d = new Date(dateInput);
//     if (isNaN(d)) return '';

//     const today = new Date();
//     const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
//     const t0 = startOfDay(today).getTime();
//     const d0 = startOfDay(d).getTime();

//     const oneDay = 24 * 60 * 60 * 1000;
//     const diffDays = Math.round((d0 - t0) / oneDay);
//     if (diffDays === 0) return 'Today';
//     if (diffDays === -1) return 'Yesterday';
//     if (diffDays === 1) return 'Tomorrow';
//     if (diffDays === 2) return 'Day after tomorrow';

//     // Weekday within current week window (Mon-Sun)
//     const dayOfWeekToday = (today.getDay() + 6) % 7; // 0=Mon ... 6=Sun
//     const weekStart = new Date(startOfDay(today).getTime() - dayOfWeekToday * oneDay);
//     const weekEnd = new Date(weekStart.getTime() + 6 * oneDay);
//     if (d0 >= weekStart.getTime() && d0 <= weekEnd.getTime()) {
//         return d.toLocaleDateString(undefined, { weekday: 'long' });
//     }

//     return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
// }


export function formatDueLabel(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d)) return '';

    const today = new Date();
    const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const t0 = startOfDay(today).getTime();
    const d0 = startOfDay(d).getTime();

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((d0 - t0) / oneDay);

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    // Weekday within current week window (Mon-Sun)
    const dayOfWeekToday = (today.getDay() + 6) % 7; // 0=Mon ... 6=Sun
    const weekStart = new Date(startOfDay(today).getTime() - dayOfWeekToday * oneDay);
    const weekEnd = new Date(weekStart.getTime() + 6 * oneDay);

    // Show only the date for previous dates in format DD MMM YYYY
    if (d0 < t0) {
        return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // For upcoming dates within the current week, show the day name
    if (d0 >= weekStart.getTime() && d0 <= weekEnd.getTime()) {
        return d.toLocaleDateString(undefined, { weekday: 'long' });
    }

    // For dates outside this week, show the full date in format DD MMM YYYY
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
