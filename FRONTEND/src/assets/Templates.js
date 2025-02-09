export const surveyTemplates = [
    {
        title: "Customer Satisfaction",
        description: "A survey to measure customer satisfaction.",
        questions: [
            { type: "text", text: "What do you like about our service?" },
            { type: "options", text: "Rate our service:", options: ["Excellent", "Great", "Good", "Unpleasant"] },
            { type: "text", text: "Any additional suggestions?" }
        ]
    },
    {
        title: "Employee Feedback",
        description: "Survey to collect employee feedback.",
        questions: [
            { type: "text", text: "What improvements would you suggest?" },
            { type: "scale", text: "How satisfied are you with your job?" },
            { type: "options", text: "Do you feel valued at work?", options: ["Yes", "No", "Sometimes"] }
        ]
    },
    {
        title: "Product Review",
        description: "Gather feedback on a recently purchased product.",
        questions: [
            { type: "text", text: "What product did you purchase?" },
            { type: "scale", text: "How would you rate the quality?" },
            { type: "text", text: "What features do you like the most?" },
            { type: "options", text: "Would you recommend this product?", options: ["Yes", "No", "Maybe"] }
        ]
    },
    {
        title: "Event Feedback",
        description: "Survey to gather insights after an event.",
        questions: [
            { type: "options", text: "How did you hear about this event?", options: ["Social Media", "Email", "Friends", "Other"] },
            { type: "scale", text: "Rate the overall event experience"},
            { type: "text", text: "What could be improved for future events?" },
            { type: "options", text: "Would you attend again?", options: ["Definitely", "Maybe", "No"] }
        ]
    },
    {
        title: "Health & Wellness Survey",
        description: "Survey to assess overall health and wellness habits.",
        questions: [
            { type: "text", text: "How often do you exercise?" },
            { type: "options", text: "How would you rate your mental well-being?", options: ["Excellent", "Good", "Average", "Poor"] },
            { type: "scale", text: "How many hours of sleep do you get on average?"},
            { type: "text", text: "Any specific health concerns?" }
        ]
    },
    {
        title: "Online Course Feedback",
        description: "Survey to gather feedback on an online course.",
        questions: [
            { type: "scale", text: "How engaging was the course content?"},
            { type: "options", text: "Which module was the most useful?", options: ["Module 1", "Module 2", "Module 3", "None"] },
            { type: "text", text: "What improvements would you suggest?" },
            { type: "options", text: "Would you take another course from us?", options: ["Yes", "No", "Maybe"] }
        ]
    }
];
