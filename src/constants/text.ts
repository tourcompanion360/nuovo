// Centralized text constants for the application
// This file contains all UI text to enable easy translation and consistency

export const TEXT = {
  // Navigation
  NAVIGATION: {
    PROJECTS: 'Projects',
    CLIENT_REQUESTS: 'Client Requests',
    MEDIA_LIBRARY: 'Media Library',
    ACADEMY: 'Academy',
    ANALYTICS: 'Analytics',
    PROMOTIONS: 'Promotions',
    CHATBOTS: 'Chatbots',
    SUPPORT: 'Support',
    SETTINGS: 'Settings',
  },

  // Request Types
  REQUEST_TYPES: {
    HOTSPOT: 'Add Hotspot',
    SCAN: 'New Scan and Virtual Tour Creation',
    INTERACTIVE: 'Interactive Point',
    MODIFY: 'Modify Existing Content',
    OTHER: 'Other',
  },

  // Request Type Values (for database)
  REQUEST_TYPE_VALUES: {
    HOTSPOT: 'hotspot',
    SCAN: 'scan',
    INTERACTIVE: 'interactive',
    MODIFY: 'modify',
    OTHER: 'other',
  },

  // Priority Levels
  PRIORITY: {
    NORMAL: 'Normal',
    URGENT: 'Urgent',
  },

  // Status Values
  STATUS: {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    SUSPENDED: 'Suspended',
    OPEN: 'Open',
    RESOLVED: 'Resolved',
    CONFIRMED: 'Confirmed',
    TO_CONFIRM: 'To Confirm',
    CANCELLED: 'Cancelled',
  },

  // Status Values (for database)
  STATUS_VALUES: {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SUSPENDED: 'suspended',
    OPEN: 'open',
    RESOLVED: 'resolved',
    CONFIRMED: 'confirmed',
    TO_CONFIRM: 'to_confirm',
    CANCELLED: 'cancelled',
  },

  // Appointment Types
  APPOINTMENT_TYPES: {
    SITE_VISIT: 'Site Visit',
    DELIVERY: 'Delivery',
    PRESENTATION: 'Presentation',
    OTHER: 'Other',
  },

  // Appointment Type Values (for database)
  APPOINTMENT_TYPE_VALUES: {
    SITE_VISIT: 'site_visit',
    DELIVERY: 'delivery',
    PRESENTATION: 'presentation',
    OTHER: 'other',
  },

  // Support Subject Types
  SUPPORT_SUBJECTS: {
    TECHNICAL_SUPPORT: 'Technical Support',
    PROJECT_CREATION: 'Project Creation Help',
    CLIENT_PORTAL: 'Client Portal Issues',
    CHATBOT_SETUP: 'Chatbot Setup & Configuration',
    PAYMENT_BILLING: 'Payment & Billing',
    ACCOUNT_MANAGEMENT: 'Account Management',
    FEATURE_REQUEST: 'Feature Request',
    OTHER: 'Other',
  },

  // Support Subject Values (for database)
  SUPPORT_SUBJECT_VALUES: {
    TECHNICAL_SUPPORT: 'technical_support',
    PROJECT_CREATION: 'project_creation',
    CLIENT_PORTAL: 'client_portal',
    CHATBOT_SETUP: 'chatbot_setup',
    PAYMENT_BILLING: 'payment_billing',
    ACCOUNT_MANAGEMENT: 'account_management',
    FEATURE_REQUEST: 'feature_request',
    OTHER: 'other',
  },

  // Form Labels
  FORMS: {
    REQUEST_TITLE: 'Request Title',
    DETAILED_DESCRIPTION: 'Detailed Description',
    CLIENT_PROJECT_NAME: 'Client/Project Name',
    REQUEST_TYPE: 'Request Type',
    PRIORITY: 'Priority',
    SUBJECT: 'Subject',
    MESSAGE: 'Message',
    SELECT_REQUEST_TYPE: 'Select request type',
    DESCRIBE_REQUEST: 'Describe your request here...',
  },

  // Placeholders
  PLACEHOLDERS: {
    REQUEST_TITLE_EXAMPLE: 'E.g. "Showroom update - move sofa"',
    DESCRIPTION_EXAMPLE: 'Explain exactly what you would like to change...',
    CLIENT_NAME_EXAMPLE: 'E.g. "Smith-John" or "ShowroomMilan"',
    HOTSPOT_DESCRIPTION: 'Hotspot {number} - describe the position',
  },

  // Buttons
  BUTTONS: {
    NEW_REQUEST: 'New Request',
    SEND_REQUEST: 'Send Request',
    CANCEL: 'Cancel',
    ADD_HOTSPOT: 'Add Hotspot',
    SEND_MESSAGE: 'Send Message',
    SENDING: 'Sending...',
    SAVE: 'Save',
    DELETE: 'Delete',
    EDIT: 'Edit',
    VIEW: 'View',
    DOWNLOAD: 'Download',
    UPLOAD: 'Upload',
    CONNECT: 'Connect',
    DISCONNECT: 'Disconnect',
  },

  // Headers and Titles
  HEADERS: {
    REQUESTS_AND_UPDATES: 'Requests and Updates',
    REQUEST_HISTORY: 'Request History',
    SUPPORT_ASSISTANCE: 'Support & Assistance',
    CONTACT_US_DIRECTLY: 'Contact Us Directly',
    QUICK_ANSWERS_FAQ: 'Quick Answers (FAQ)',
    YOUR_SUPPORT_REQUESTS: 'Your Support Requests',
    GUIDES_ALTERNATIVE_CONTACTS: 'Guides and Alternative Contacts',
    NEW_REQUEST: 'New Request',
    SETTINGS: 'Settings',
  },

  // Descriptions
  DESCRIPTIONS: {
    REQUESTS_SUBTITLE: 'Send new requests or check the status of existing ones.',
    NEED_UPDATE: 'Need an update?',
    REQUEST_DESCRIPTION: 'Create a new request to add hotspots, modify content, or request a new scan.',
    SUPPORT_SUBTITLE: 'Need help? Contact us or check our resources.',
    CONTACT_DESCRIPTION: 'Fill out the form to send us a message. We\'ll respond as soon as possible.',
    SETTINGS_DESCRIPTION: 'Manage your account software credentials.',
  },

  // File Upload
  FILE_UPLOAD: {
    ATTACH_FILES_DROPBOX: 'Share files via cloud storage',
    UPLOAD_FILES_SECURELY: 'Share your files securely via Google Drive, Dropbox, or WeTransfer',
    FILES_AUTO_ORGANIZED: 'Files will be automatically organized for your request',
    OPEN_DROPBOX_REQUEST: 'Share Files via Cloud Storage',
    FILE_NAMING_INSTRUCTIONS: 'File sharing instructions:',
    FILL_CLIENT_TYPE_FIRST: 'Fill in "Client/Project Name" and "Request Type" first to generate correct instructions',
    ALWAYS_START_FILENAME: 'Always start the filename with:',
    EXAMPLE_FILENAME: 'Example: "HOTSPOT_Smith-John_REQ-123_kitchen-photo.jpg"',
  },

  // Hotspots
  HOTSPOTS: {
    REQUESTED_HOTSPOTS: 'Requested Hotspots (optional)',
  },

  // Filters
  FILTERS: {
    ALL_TYPES: 'All types',
    ALL_STATUSES: 'All statuses',
    TYPE: 'Type',
    STATUS: 'Status',
  },

  // FAQ
  FAQ: {
    CREATE_FIRST_PROJECT_QUESTION: 'How do I create my first virtual tour project?',
    CREATE_FIRST_PROJECT_ANSWER: 'Go to the Projects section and click "Create New Project". Fill in the project details, select a client, choose the project type (Virtual Tour, 3D Showcase, or Interactive Map), and add a description. Your project will be created and ready for customization.',
    CLIENT_PORTAL_ACCESS_QUESTION: 'How do my clients access their portal?',
    CLIENT_PORTAL_ACCESS_ANSWER: 'After creating a project, you can share the client portal link with your clients. They can use this link to view their projects, submit requests, and interact with chatbots. The portal is automatically generated for each project.',
    CHATBOT_SETUP_QUESTION: 'How do I set up a chatbot for my client?',
    CHATBOT_SETUP_ANSWER: 'Go to the Chatbots section, click "Create Client Chatbot", and fill in the client information. Configure the chatbot\'s knowledge base, customize its appearance to match your client\'s brand, and activate it. The chatbot will automatically appear on your client\'s portal.',
    REQUEST_TYPES_QUESTION: 'What types of requests can clients submit?',
    REQUEST_TYPES_ANSWER: 'Clients can submit various types of requests: Hotspot Updates (add interactive points), Content Changes (modify text/images), Design Modifications (change layout/styling), New Features (request additional functionality), and Bug Fixes (report issues).',
    NOTIFICATIONS_QUESTION: 'How do I get notified about new client requests?',
    NOTIFICATIONS_ANSWER: 'You\'ll receive real-time notifications through the notification bell in the top navigation. Click the bell to see recent requests, or click "See All Notifications" to view the full notification panel with search and filtering options.',
    PROJECT_SHARING_QUESTION: 'How do I share a project with my client?',
    PROJECT_SHARING_ANSWER: 'Each project has a unique sharing link that you can send to your client. Go to the project details, click "Share Client Portal", and copy the generated link. Your client can use this link to access their dedicated portal.',
  },

  // Contact
  CONTACT: {
    DIRECT_EMAIL: 'Direct Email',
    CALL_SUPPORT: 'Call Support',
    PRIORITY: 'Priority:',
  },

  // Toast Messages
  TOAST: {
    SUCCESS: 'Success',
    ERROR: 'Error',
    REQUEST_CREATED: 'Request Created',
    REQUEST_CREATED_DESCRIPTION: 'Your request has been created successfully.',
    REQUEST_SENT: 'Request Sent',
    REQUEST_SENT_DESCRIPTION: 'Your support request has been sent successfully.',
    APPOINTMENT_CREATED: 'Appointment Created',
    APPOINTMENT_CREATED_DESCRIPTION: 'Appointment created successfully',
    APPOINTMENT_UPDATED: 'Appointment Updated',
    APPOINTMENT_UPDATED_DESCRIPTION: 'Appointment updated successfully',
    APPOINTMENT_DELETED: 'Appointment Deleted',
    APPOINTMENT_DELETED_DESCRIPTION: 'Appointment deleted successfully',
    ERROR_OCCURRED: 'An error occurred while creating the request.',
    ERROR_LOADING_APPOINTMENTS: 'Error loading appointments',
    ERROR_CREATING_APPOINTMENT: 'Error creating appointment',
    ERROR_UPDATING_APPOINTMENT: 'Error updating appointment',
    ERROR_DELETING_APPOINTMENT: 'Error deleting appointment',
  },

  // Empty States
  EMPTY_STATES: {
    NO_REQUESTS_FOUND: 'No requests found',
    NO_REQUESTS_DESCRIPTION: 'Your previous requests will appear here',
  },

  // Date and Time
  DATE_TIME: {
    CLIENT: 'Client:',
    NOT_SPECIFIED: 'Not specified',
  },

  // Theme
  THEME: {
    SWITCH_TO_DARK: 'Switch to dark theme',
    SWITCH_TO_LIGHT: 'Switch to light theme',
  },

  // Settings
  SETTINGS: {
    MANAGE_ACCOUNT: 'Manage Account',
  },

  // Chatbot Management
  CHATBOT: {
    // Headers
    CHATBOT_MANAGEMENT: 'Chatbot Management',
    CREATE_CHATBOT: 'Create Chatbot',
    EDIT_CHATBOT: 'Edit Chatbot',
    CHATBOT_DETAILS: 'Chatbot Details',
    CHATBOT_STATISTICS: 'Statistics',
    CHATBOT_CONFIGURATION: 'Configuration',
    
    // Basic Info
    BASIC_INFO: 'Basic Information',
    CHATBOT_NAME: 'Chatbot Name',
    DESCRIPTION: 'Description',
    LANGUAGE: 'Language',
    WELCOME_MESSAGE: 'Welcome Message',
    FALLBACK_MESSAGE: 'Fallback Message',
    
    // Design Customization
    DESIGN_CUSTOMIZATION: 'Design Customization',
    PRIMARY_COLOR: 'Primary Color',
    WIDGET_STYLE: 'Widget Style',
    POSITION: 'Position',
    AVATAR: 'Avatar',
    BRAND_LOGO: 'Brand Logo',
    
    // Knowledge Base
    KNOWLEDGE_BASE: 'Knowledge Base',
    PASTED_TEXT: 'Pasted Text',
    FILE_UPLOADS: 'File Sharing',
    UPLOAD_FILES: 'Share Files',
    DRAG_DROP_FILES: 'Share files via Google Drive, Dropbox, or WeTransfer',
    
    // Response Settings
    RESPONSE_SETTINGS: 'Response Settings',
    RESPONSE_STYLE: 'Response Style',
    MAX_QUESTIONS: 'Max Questions',
    CONVERSATION_LIMIT: 'Conversation Limit',
    
    // Statistics
    TOTAL_CONVERSATIONS: 'Total Conversations',
    ACTIVE_USERS: 'Active Users',
    RESPONSE_TIME: 'Response Time',
    SATISFACTION_RATE: 'Satisfaction Rate',
    AVG_RESPONSE_TIME: 'Avg Response Time',
    
    // Actions
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    DUPLICATE: 'Duplicate',
    PREVIEW: 'Preview',
    ACTIVATE: 'Activate',
    DEACTIVATE: 'Deactivate',
    
    // Status
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DRAFT: 'Draft',
    
    // Limits
    CHATBOT_LIMIT_REACHED: 'You have reached the maximum limit of 5 chatbots',
    UPGRADE_TO_CREATE_MORE: 'Upgrade your plan to create more chatbots',
    
    // Placeholders
    ENTER_CHATBOT_NAME: 'Enter chatbot name',
    ENTER_DESCRIPTION: 'Enter chatbot description',
    ENTER_WELCOME_MESSAGE: 'Enter welcome message',
    ENTER_FALLBACK_MESSAGE: 'Enter fallback message',
    PASTE_KNOWLEDGE_TEXT: 'Paste your knowledge base text here',
    
    // Validation Messages
    NAME_REQUIRED: 'Chatbot name is required',
    DESCRIPTION_REQUIRED: 'Description is required',
    WELCOME_MESSAGE_REQUIRED: 'Welcome message is required',
    FALLBACK_MESSAGE_REQUIRED: 'Fallback message is required',
    INVALID_COLOR: 'Please enter a valid color code',
    MAX_QUESTIONS_INVALID: 'Max questions must be between 1 and 50',
    
    // Toast Messages
    CHATBOT_CREATED: 'Chatbot Created',
    CHATBOT_CREATED_DESCRIPTION: 'Chatbot has been created successfully',
    CHATBOT_UPDATED: 'Chatbot Updated',
    CHATBOT_UPDATED_DESCRIPTION: 'Chatbot has been updated successfully',
    CHATBOT_DELETED: 'Chatbot Deleted',
    CHATBOT_DELETED_DESCRIPTION: 'Chatbot has been deleted successfully',
    ERROR_CREATING_CHATBOT: 'Error creating chatbot',
    ERROR_UPDATING_CHATBOT: 'Error updating chatbot',
    ERROR_DELETING_CHATBOT: 'Error deleting chatbot',
    ERROR_LOADING_CHATBOTS: 'Error loading chatbots',
    
    // Languages
    LANGUAGES: {
      ENGLISH: 'English',
      SPANISH: 'Spanish',
      FRENCH: 'French',
      GERMAN: 'German',
      ITALIAN: 'Italian',
      PORTUGUESE: 'Portuguese',
      CHINESE: 'Chinese',
      JAPANESE: 'Japanese',
      KOREAN: 'Korean',
      ARABIC: 'Arabic',
    },
    
    // Widget Styles
    WIDGET_STYLES: {
      MODERN: 'Modern',
      CLASSIC: 'Classic',
      MINIMAL: 'Minimal',
      BUBBLE: 'Bubble',
      CARD: 'Card',
    },
    
    // Positions
    POSITIONS: {
      BOTTOM_RIGHT: 'Bottom Right',
      BOTTOM_LEFT: 'Bottom Left',
      TOP_RIGHT: 'Top Right',
      TOP_LEFT: 'Top Left',
      CENTER: 'Center',
    },
    
    // Response Styles
    RESPONSE_STYLES: {
      FRIENDLY: 'Friendly',
      PROFESSIONAL: 'Professional',
      CASUAL: 'Casual',
      FORMAL: 'Formal',
      HELPFUL: 'Helpful',
    },
  },

  // Analytics
  ANALYTICS: {
    // Headers
    PERFORMANCE_ANALYTICS: 'Performance Analytics',
    CONVERSATIONAL_INTELLIGENCE: 'Conversational Intelligence',
    KEY_METRICS: 'Key Metrics and Performance Indicators',
    CHATBOT_INSIGHTS: 'Insights from chatbot interactions and lead generation',
    
    // KPI Cards
    TOTAL_VIEWS: 'Total Views',
    UNIQUE_VISITORS: 'Unique Visitors',
    TOTAL_CLICKS: 'Total Clicks',
    CONVERSION_RATE: 'Conversion Rate',
    AVG_SESSION_DURATION: 'Avg. Session Duration',
    BOUNCE_RATE: 'Bounce Rate',
    
    // KPI Descriptions
    PAGE_VIEWS_DESCRIPTION: 'Page views across all projects',
    DISTINCT_USERS_DESCRIPTION: 'Distinct users who visited',
    INTERACTIVE_CLICKS_DESCRIPTION: 'Interactive element clicks',
    CLICKS_PER_VIEW_DESCRIPTION: 'Clicks per view ratio',
    AVG_TIME_SESSION_DESCRIPTION: 'Average time spent per session',
    SINGLE_PAGE_SESSIONS_DESCRIPTION: 'Single-page sessions',
    
    // Time Ranges
    LAST_7_DAYS: 'Last 7 days',
    LAST_30_DAYS: 'Last 30 days',
    LAST_90_DAYS: 'Last 90 days',
    LAST_YEAR: 'Last year',
    
    // Conversational Intelligence
    TOP_ASKED_QUESTIONS: 'Top Asked Questions',
    UNANSWERED_QUESTIONS: 'Unanswered Questions',
    LEADS_GENERATED: 'Leads Generated',
    MOST_FREQUENT_QUESTIONS: 'Most frequently asked questions by visitors',
    QUESTIONS_NEED_ATTENTION: 'Questions that need attention',
    POTENTIAL_CUSTOMERS: 'Potential customers from chatbot interactions',
    
    // Search and Filters
    SEARCH_QUESTIONS: 'Search questions...',
    ALL_CATEGORIES: 'All Categories',
    CATEGORY: 'Category',
    
    // Categories
    CATEGORIES: {
      PRICING: 'Pricing',
      FEATURES: 'Features',
      SUPPORT: 'Support',
      TECHNICAL: 'Technical',
      GENERAL: 'General',
    },
    
    // Lead Status
    LEAD_STATUS: {
      NEW: 'New',
      CONTACTED: 'Contacted',
      QUALIFIED: 'Qualified',
      CONVERTED: 'Converted',
    },
    
    // Statistics
    TOTAL_LEADS: 'Total Leads',
    NEW_THIS_WEEK: 'New This Week',
    ASKED_TIMES: 'Asked {count} times',
    COMPANY: 'Company',
    SOURCE: 'Source',
    SCORE: 'Score',
    
    // Actions
    ANSWER: 'Answer',
    CONTACT: 'Contact',
    
    // Empty States
    NO_QUESTIONS_FOUND: 'No questions found',
    NO_UNANSWERED_QUESTIONS: 'No unanswered questions',
    NO_LEADS_GENERATED: 'No leads generated yet',
    
    // Loading States
    LOADING_ANALYTICS: 'Loading analytics data...',
    LOADING_QUESTIONS: 'Loading questions...',
    LOADING_LEADS: 'Loading leads...',
    
    // Error Messages
    ERROR_LOADING_ANALYTICS: 'Error loading analytics data',
    ERROR_LOADING_QUESTIONS: 'Error loading questions',
    ERROR_LOADING_LEADS: 'Error loading leads',
  },

  // Academy/Training
  ACADEMY: {
    // Headers
    TRAINING_ACADEMY: 'Training',
    IMPROVE_SKILLS: 'Improve your skills with our specialized courses and tutorials',
    
    // Stats
    VIDEO_TUTORIALS: 'Video Tutorials',
    PDF_GUIDES: 'PDF Guides',
    TOTAL_CONTENT: 'Total Content',
    
    // Video Tutorials
    VIDEO_TUTORIALS_SECTION: 'Video Tutorials',
    VIDEO_TUTORIALS_DESCRIPTION: 'Learn step-by-step with our professional video tutorials',
    
    // PDF Guides
    PDF_GUIDES_SECTION: 'PDF Guides',
    PDF_GUIDES_DESCRIPTION: 'Download comprehensive guides for offline reference',
    
    // Levels
    LEVELS: {
      BEGINNER: 'Beginner',
      INTERMEDIATE: 'Intermediate',
      ADVANCED: 'Advanced',
    },
    
    // Actions
    WATCH_VIDEO: 'Watch Video',
    DOWNLOAD_GUIDE: 'Download Guide',
    REQUEST_CONSULTATION: 'Request Consultation',
    CONTACT_SUPPORT: 'Contact Support',
    
    // Call to Action
    NEED_PERSONALIZED_SUPPORT: 'Need personalized support?',
    CONTACT_FOR_TRAINING: 'Contact us for one-to-one training sessions or specific business consultations',
    
    // Tutorial Content
    TUTORIALS: {
      PLATFORM_OVERVIEW: 'Platform Overview & Getting Started',
      PROJECT_MANAGEMENT: 'Project Management Best Practices',
      CLIENT_PORTAL_SETUP: 'Setting Up Client Portals',
      CHATBOT_CONFIGURATION: 'Chatbot Configuration & Customization',
      ANALYTICS_INSIGHTS: 'Understanding Analytics & Insights',
      NOTIFICATION_SYSTEM: 'Managing Notifications & Requests',
    },
    
    // Guide Content
    GUIDES: {
      QUICK_START_GUIDE: 'Quick Start Guide for Tour Creators',
      CLIENT_MANAGEMENT: 'Client Management & Communication',
      CHATBOT_BEST_PRACTICES: 'Chatbot Best Practices & Optimization',
      ANALYTICS_GUIDE: 'Analytics & Performance Tracking',
      PLATFORM_FEATURES: 'Complete Platform Features Guide',
    },
  },

  // Project Management
  PROJECTS: {
    // Headers
    PROJECTS: 'Projects',
    YOUR_PROJECTS: 'Your Projects',
    MANAGE_PROJECTS: 'Manage and view all your virtual tour projects',
    CREATE_NEW_PROJECT: 'Create New Project',
    EDIT_PROJECT: 'Edit Project',
    
    // Project Cards
    PROJECT_TITLE: 'Project Title',
    DESCRIPTION: 'Description',
    CLIENT_NAME: 'Client Name',
    PROJECT_TYPE: 'Project Type',
    THUMBNAIL_URL: 'Thumbnail URL',
    STATUS: 'Status',
    VIEWS: 'Views',
    TYPE: 'Type',
    NO_THUMBNAIL: 'No Thumbnail',
    
    // Project Types
    PROJECT_TYPES: {
      VIRTUAL_TOUR: 'Virtual Tour',
      SCAN_3D: '3D Scan',
      INTERACTIVE_MEDIA: 'Interactive Media',
    },
    
    // Status
    STATUS_LABELS: {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      DRAFT: 'Draft',
    },
    
    // Actions
    NEW_PROJECT: 'New Project',
    CREATE: 'Create',
    UPDATE: 'Update',
    CANCEL: 'Cancel',
    VIEW: 'View',
    EDIT: 'Edit',
    DELETE: 'Delete',
    REQUEST: 'Request',
    
    // Filters
    FILTER_BY_STATUS: 'Filter by status',
    ALL_PROJECTS: 'All Projects',
    
    // Empty State
    NO_PROJECTS_YET: 'No projects yet',
    CREATE_FIRST_PROJECT: 'Create your first virtual tour project to get started.',
    
    // Form Placeholders
    ENTER_PROJECT_TITLE: 'Enter project title',
    ENTER_DESCRIPTION: 'Enter project description',
    ENTER_CLIENT_NAME: 'Enter client name',
    ENTER_THUMBNAIL_URL: 'Enter thumbnail URL',
    SELECT_TYPE: 'Select type',
    SELECT_STATUS: 'Select status',
    
    // Toast Messages
    PROJECT_CREATED: 'Project created',
    PROJECT_CREATED_DESCRIPTION: 'The project has been created successfully.',
    PROJECT_UPDATED: 'Project updated',
    PROJECT_UPDATED_DESCRIPTION: 'The project has been updated successfully.',
    PROJECT_DELETED: 'Project deleted',
    PROJECT_DELETED_DESCRIPTION: 'The project has been deleted successfully.',
    ERROR_SAVING_PROJECT: 'An error occurred while saving the project.',
    ERROR_DELETING_PROJECT: 'An error occurred while deleting the project.',
    ERROR_LOADING_PROJECTS: 'Error loading projects',
  },


  // Settings
  SETTINGS_PAGE: {
    // Headers
    SETTINGS: 'Settings',
    MANAGE_ACCOUNT: 'Manage your account, integrations, and API access.',
    
    // Tabs
    PROFILE: 'Profile',
    BILLING: 'Billing',
    INTEGRATIONS: 'Integrations',
    SECURITY: 'Security',
    
    // Profile Tab
    AGENCY_PROFILE: 'Agency Profile',
    MANAGE_AGENCY_INFO: 'Manage your agency information and branding',
    AGENCY_NAME: 'Agency Name',
    CONTACT_EMAIL: 'Contact Email',
    PHONE: 'Phone',
    WEBSITE: 'Website',
    AGENCY_LOGO: 'Agency Logo',
    ADDRESS: 'Address',
    DESCRIPTION: 'Description',
    SAVE_PROFILE: 'Save Profile',
    
    // Form Placeholders
    ENTER_AGENCY_NAME: 'Enter agency name',
    ENTER_CONTACT_EMAIL: 'Enter contact email',
    ENTER_PHONE: 'Enter phone number',
    ENTER_WEBSITE: 'Enter website URL',
    ENTER_LOGO_URL: 'Enter logo URL',
    ENTER_ADDRESS: 'Enter agency address',
    ENTER_DESCRIPTION: 'Enter agency description',
    
    // Billing Tab
    BILLING_SUBSCRIPTION: 'Billing & Subscription',
    MANAGE_SUBSCRIPTION: 'Manage your subscription and billing information',
    CURRENT_PLAN: 'Current Plan',
    PROFESSIONAL_PLAN: 'Professional Plan - $99/month',
    ACTIVE: 'Active',
    MANAGE_PAYMENT_METHODS: 'Manage Payment Methods',
    VIEW_BILLING_HISTORY: 'View Billing History',
    USAGE_THIS_MONTH: 'Usage This Month',
    PROJECTS: 'Projects',
    STORAGE: 'Storage',
    API_CALLS: 'API Calls',
    
    // Integrations Tab
    INTEGRATIONS_TITLE: 'Integrations',
    CONNECT_SERVICES: 'Connect external services to enhance your workflow',
    GOOGLE_CALENDAR: 'Google Calendar',
    SYNC_APPOINTMENTS: 'Sync appointments and events',
    REALSEE_OAUTH: 'Realsee (OAuth)',
    SECURE_CONNECTION: 'Secure connection to Realsee platform',
    STRIPE: 'Stripe',
    PAYMENT_PROCESSING: 'Payment processing and billing',
    CONNECTED: 'Connected',
    CONNECT: 'Connect',
    WEBHOOK_URL: 'Webhook URL',
    ENTER_WEBHOOK_URL: 'Enter webhook URL for notifications',
    SAVE_INTEGRATIONS: 'Save Integrations',
    
    // Security Tab
    SECURITY_TITLE: 'Security',
    MANAGE_SECURITY: 'Manage your security settings and API access',
    API_KEYS: 'API Keys',
    MANAGE_API_KEYS: 'Manage API keys for programmatic access',
    ENTER_API_KEY_NAME: 'Enter API key name',
    GENERATE_KEY: 'Generate Key',
    GENERATING: 'Generating...',
    NO_API_KEYS: 'No API keys generated yet',
    CREATED: 'Created',
    LAST_USED: 'Last used',
    DELETE: 'Delete',
    
    // Toast Messages
    PROFILE_UPDATED: 'Profile Updated',
    PROFILE_UPDATED_DESCRIPTION: 'Your agency settings have been saved successfully.',
    INTEGRATIONS_UPDATED: 'Integrations Updated',
    INTEGRATIONS_UPDATED_DESCRIPTION: 'Your integration settings have been saved successfully.',
    GOOGLE_CALENDAR_CONNECTED: 'Google Calendar Connected',
    GOOGLE_CALENDAR_CONNECTED_DESCRIPTION: 'Your Google Calendar has been successfully connected.',
    REALSEE_CONNECTED: 'Realsee Connected',
    REALSEE_CONNECTED_DESCRIPTION: 'Your Realsee account has been successfully connected via OAuth.',
    STRIPE_CONNECTED: 'Stripe Connected',
    STRIPE_CONNECTED_DESCRIPTION: 'Your Stripe account has been successfully connected.',
    API_KEY_GENERATED: 'API Key Generated',
    API_KEY_GENERATED_DESCRIPTION: 'Your new API key has been generated successfully.',
    API_KEY_DELETED: 'API Key Deleted',
    API_KEY_DELETED_DESCRIPTION: 'The API key has been deleted successfully.',
    ERROR_SAVING_PROFILE: 'Failed to save profile settings.',
    ERROR_SAVING_INTEGRATIONS: 'Failed to save integration settings.',
    ERROR_CONNECTING_GOOGLE: 'Failed to connect Google Calendar.',
    ERROR_CONNECTING_REALSEE: 'Failed to connect Realsee account.',
    ERROR_CONNECTING_STRIPE: 'Failed to connect Stripe account.',
    ERROR_GENERATING_KEY: 'Failed to generate API key.',
    ERROR_DELETING_KEY: 'Failed to delete API key.',
    ENTER_API_KEY_NAME_ERROR: 'Please enter a name for the API key.',
  },

  // Chatbot Management
  CHATBOT_MANAGEMENT: {
    // Headers
    CHATBOT_MANAGEMENT: 'Client Chatbot Management',
    MANAGE_CHATBOTS: 'Create and manage AI chatbots for your clients\' websites',
    CREATE_NEW_CHATBOT: 'Create Client Chatbot',
    EDIT_CHATBOT: 'Edit Client Chatbot',
    
    // Tabs
    OVERVIEW: 'Overview',
    CONFIGURATION: 'Configuration',
    KNOWLEDGE_BASE: 'Knowledge Base',
    ANALYTICS: 'Analytics',
    
    // Basic Info
    BASIC_INFO: 'Client Information',
    CHATBOT_NAME: 'Client Name',
    DESCRIPTION: 'Client Description',
    LANGUAGE: 'Language',
    WELCOME_MESSAGE: 'Welcome Message',
    FALLBACK_MESSAGE: 'Fallback Message',
    
    // Design Customization
    DESIGN_CUSTOMIZATION: 'Client Branding',
    PRIMARY_COLOR: 'Brand Color',
    WIDGET_STYLE: 'Widget Style',
    POSITION: 'Position',
    AVATAR: 'Avatar',
    BRAND_LOGO: 'Client Logo',
    
    // Knowledge Base
    KNOWLEDGE_BASE_TITLE: 'Client Knowledge Base',
    PASTED_TEXT: 'Pasted Text',
    FILE_UPLOADS: 'File Sharing',
    ADD_TEXT: 'Add Text',
    UPLOAD_FILES: 'Share Files',
    
    // Response Settings
    RESPONSE_SETTINGS: 'Response Settings',
    RESPONSE_STYLE: 'Response Style',
    MAX_QUESTIONS: 'Max Questions',
    CONVERSATION_LIMIT: 'Conversation Limit',
    
    // Statistics
    STATISTICS: 'Statistics',
    TOTAL_CONVERSATIONS: 'Total Conversations',
    ACTIVE_USERS: 'Active Users',
    RESPONSE_TIME: 'Response Time',
    SATISFACTION_RATE: 'Satisfaction Rate',
    AVG_RESPONSE_TIME: 'Avg Response Time',
    
    // Actions
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    TEST: 'Test',
    PREVIEW: 'Preview',
    ACTIVATE: 'Activate',
    DEACTIVATE: 'Deactivate',
    
    // Status
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DRAFT: 'Draft',
    
    // Languages
    LANGUAGES: {
      ENGLISH: 'English',
      SPANISH: 'Spanish',
      FRENCH: 'French',
      GERMAN: 'German',
      ITALIAN: 'Italian',
      PORTUGUESE: 'Portuguese',
    },
    
    // Widget Styles
    WIDGET_STYLES: {
      MODERN: 'Modern',
      CLASSIC: 'Classic',
      MINIMAL: 'Minimal',
      BUBBLE: 'Bubble',
    },
    
    // Positions
    POSITIONS: {
      BOTTOM_RIGHT: 'Bottom Right',
      BOTTOM_LEFT: 'Bottom Left',
      TOP_RIGHT: 'Top Right',
      TOP_LEFT: 'Top Left',
    },
    
    // Response Styles
    RESPONSE_STYLES: {
      PROFESSIONAL: 'Professional',
      FRIENDLY: 'Friendly',
      CASUAL: 'Casual',
      FORMAL: 'Formal',
    },
    
    // Form Placeholders
    ENTER_CHATBOT_NAME: 'Enter client name',
    ENTER_DESCRIPTION: 'Enter client description',
    ENTER_WELCOME_MESSAGE: 'Enter welcome message',
    ENTER_FALLBACK_MESSAGE: 'Enter fallback message',
    SELECT_LANGUAGE: 'Select language',
    SELECT_WIDGET_STYLE: 'Select widget style',
    SELECT_POSITION: 'Select position',
    SELECT_RESPONSE_STYLE: 'Select response style',
    ENTER_MAX_QUESTIONS: 'Enter max questions',
    PASTE_KNOWLEDGE_TEXT: 'Paste your knowledge base text here...',
    DRAG_DROP_FILES: 'Drag and drop files here, or click to select',
    SUPPORTED_FORMATS: 'Supported formats: PDF, TXT, DOC, DOCX',
    MAX_FILE_SIZE: 'Max file size: 10MB',
    
    
    // Messages
    NO_CHATBOTS_YET: 'No chatbots created yet',
    CREATE_FIRST_CHATBOT: 'Create your first client chatbot to get started',
    CHATBOT_LIMIT_REACHED: 'Chatbot Limit Reached',
    CHATBOT_LIMIT_WARNING: 'chatbots created',
    CHATBOT_CREATED: 'Chatbot Created',
    CHATBOT_CREATED_DESCRIPTION: 'Your client chatbot has been created successfully',
    CHATBOT_UPDATED: 'Chatbot Updated',
    CHATBOT_UPDATED_DESCRIPTION: 'Your client chatbot has been updated successfully',
    CHATBOT_DELETED: 'Chatbot Deleted',
    CHATBOT_DELETED_DESCRIPTION: 'Your client chatbot has been deleted successfully',
    CHATBOT_ACTIVATED: 'Chatbot Activated',
    CHATBOT_ACTIVATED_DESCRIPTION: 'Your client chatbot is now active',
    CHATBOT_DEACTIVATED: 'Chatbot Deactivated',
    CHATBOT_DEACTIVATED_DESCRIPTION: 'Your client chatbot has been deactivated',
    FILES_UPLOADED: 'Files Shared',
    ERROR_CREATING_CHATBOT: 'Failed to create chatbot',
    ERROR_UPDATING_CHATBOT: 'Failed to update chatbot',
    ERROR_DELETING_CHATBOT: 'Failed to delete chatbot',
    ERROR_UPLOADING_FILES: 'Failed to share files',
    
    // Analytics
    CONVERSATION_ANALYTICS: 'Conversation Analytics',
    USER_ENGAGEMENT: 'User Engagement',
    RESPONSE_PERFORMANCE: 'Response Performance',
    SATISFACTION_METRICS: 'Satisfaction Metrics',
    LAST_7_DAYS: 'Last 7 days',
    LAST_30_DAYS: 'Last 30 days',
    LAST_90_DAYS: 'Last 90 days',
  },
} as const;

// Type for better TypeScript support
export type TextKeys = typeof TEXT;
