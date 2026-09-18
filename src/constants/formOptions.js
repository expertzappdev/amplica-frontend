// Form Options Constants
// This file contains all reusable form options that can be imported and used across components

export const industryOptions = [
    'Information Technology',
    'Healthcare', 
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Marketing',
    'Real Estate',
    'Telecommunications',
    'Energy & Utilities',
    'Transportation & Logistics',
    'Food & Beverage',
    'Entertainment & Media',
    'Construction',
    'Agriculture',
    'Aerospace & Defense',
    'Automotive',
    'Chemical',
    'Mining',
    'Other'
];

export const companySizeOptions = [
    { value: 1, label: '1 employee' },
    { value: 10, label: '2-10 employees' },
    { value: 25, label: '11-25 employees' },
    { value: 50, label: '26-50 employees' },
    { value: 100, label: '51-100 employees' },
    { value: 200, label: '101-200 employees' },
    { value: 500, label: '201-500 employees' },
    { value: 1000, label: '501-1000 employees' },
    { value: 5000, label: '1001-5000 employees' },
    { value: 10000, label: '5000+ employees' }
];

export const packageOptions = [
    { id: 1, name: 'Starter', description: 'Basic features for small teams' },
    { id: 2, name: 'Professional', description: 'Advanced features for growing businesses' },
    { id: 3, name: 'Business', description: 'Comprehensive features for medium businesses' },
    { id: 4, name: 'Enterprise', description: 'Full-featured solution for large organizations' },
    { id: 5, name: 'Custom', description: 'Tailored solution for specific requirements' }
];

export const statusOptions = [
    { id: true, label: 'Active', value: true },
    { id: false, label: 'Inactive', value: false }
];

export const approvalOptions = [
    { id: true, label: 'Approved', value: true },
    { id: false, label: 'Pending Approval', value: false }
];

// Additional common options that might be useful

export const priorityOptions = [
    { id: 'low', label: 'Low', value: 'low' },
    { id: 'medium', label: 'Medium', value: 'medium' },
    { id: 'high', label: 'High', value: 'high' },
    { id: 'urgent', label: 'Urgent', value: 'urgent' }
];

export const roleTypeOptions = [
    { id: 'admin', label: 'Administrator', value: 'admin' },
    { id: 'manager', label: 'Manager', value: 'manager' },
    { id: 'user', label: 'User', value: 'user' },
    { id: 'viewer', label: 'Viewer', value: 'viewer' }
];

export const departmentOptions = [
    'Human Resources',
    'Information Technology',
    'Finance & Accounting',
    'Marketing & Sales',
    'Operations',
    'Customer Service',
    'Product Development',
    'Quality Assurance',
    'Research & Development',
    'Legal & Compliance',
    'Procurement',
    'Administration',
    'Other'
];

export const timezoneOptions = [
    { id: 'UTC', label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { id: 'EST', label: 'EST (Eastern Standard Time)', value: 'America/New_York' },
    { id: 'PST', label: 'PST (Pacific Standard Time)', value: 'America/Los_Angeles' },
    { id: 'IST', label: 'IST (India Standard Time)', value: 'Asia/Kolkata' },
    { id: 'GMT', label: 'GMT (Greenwich Mean Time)', value: 'Europe/London' },
    { id: 'CET', label: 'CET (Central European Time)', value: 'Europe/Berlin' }
];

export const currencyOptions = [
    { id: 'USD', label: 'US Dollar', symbol: '$', value: 'USD' },
    { id: 'EUR', label: 'Euro', symbol: '€', value: 'EUR' },
    { id: 'GBP', label: 'British Pound', symbol: '£', value: 'GBP' },
    { id: 'INR', label: 'Indian Rupee', symbol: '₹', value: 'INR' },
    { id: 'JPY', label: 'Japanese Yen', symbol: '¥', value: 'JPY' },
    { id: 'AUD', label: 'Australian Dollar', symbol: 'A$', value: 'AUD' },
    { id: 'CAD', label: 'Canadian Dollar', symbol: 'C$', value: 'CAD' }
];

// Helper functions for common operations
export const getOptionLabel = (options, value) => {
    const option = options.find(opt => opt.id === value || opt.value === value);
    return option ? option.label : 'Unknown';
};

export const getCompanySizeLabel = (value) => {
    return getOptionLabel(companySizeOptions, value);
};

export const getPackageName = (id) => {
    const pkg = packageOptions.find(p => p.id === id);
    return pkg ? pkg.name : 'Unknown Package';
};

export const getIndustryList = () => industryOptions;

export const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
};

export const getApprovalLabel = (isApproved) => {
    return isApproved ? 'Approved' : 'Pending Approval';
};
