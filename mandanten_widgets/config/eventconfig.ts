// Configuration for the upcoming event

export const NEXT_EVENT_DETAILS = {
    // Date in ISO 8601 format for timers/logic
    isoDate: "2026-02-21T18:00:00", 
    
    // Date parts for easy formatting
    year: 2026,
    month: "Februar", // Or 2 for numeric month
    day: 21,
    weekday: "Samstag",
  
    // Pre-formatted strings for display
    formattedDate: "21. Februar 2026",
    formattedWeekdayDate: "Samstag, 21. Februar 2026",
  
    // Location
    locationName: "Aula des CBG",
    locationCity: "Dülmen",
    fullLocation: "Aula des CBG, Dülmen",
  
    // Time details
    startTime: "18:00 Uhr",
    admissionTime: "17:30 Uhr",
    fullTimeInfo: "18:00 Uhr (Einlass ab 17:30 Uhr)",
  
    // Optional: Event title or number
    eventNumber: 5,
    eventTitle: "5. Rotary Benefizshow",
  };
  
  // Optional: Export individual constants if preferred in some places
  export const NEXT_EVENT_ISO_DATE = NEXT_EVENT_DETAILS.isoDate;
  export const NEXT_EVENT_FORMATTED_DATE = NEXT_EVENT_DETAILS.formattedDate;
  export const NEXT_EVENT_LOCATION = NEXT_EVENT_DETAILS.fullLocation; 