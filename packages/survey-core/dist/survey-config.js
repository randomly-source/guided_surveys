export const surveyPages = [
    {
        id: 'personal_details',
        title: 'Personal Details',
        questions: [
            { id: 'full_name', type: 'text', label: 'Full Name', required: true },
            { id: 'email', type: 'email', label: 'Email Address' },
            { id: 'phone', type: 'phone', label: 'Phone Number' },
            { id: 'age', type: 'number', label: 'Age' }
        ]
    },
    {
        id: 'address',
        title: 'Address',
        questions: [
            {
                id: 'address',
                type: 'group',
                label: 'Residential Address',
                fields: [
                    { id: 'line1', type: 'text', label: 'Address Line 1' },
                    { id: 'city', type: 'text', label: 'City' },
                    { id: 'state', type: 'text', label: 'State' },
                    { id: 'pincode', type: 'number', label: 'Pincode' }
                ]
            }
        ]
    },
    {
        id: 'tv_usage',
        title: 'TV Usage',
        questions: [
            { id: 'watch_tv', type: 'yesno', label: 'Do you watch TV?' },
            {
                id: 'hours_per_day',
                type: 'number',
                label: 'Hours per day',
                showIf: { watch_tv: 'yes' }
            }
        ]
    },
    {
        id: 'subscriptions',
        title: 'Subscriptions',
        questions: [
            {
                id: 'subscriptions',
                type: 'multi',
                label: 'Which subscriptions do you have?',
                options: [
                    'Cable TV',
                    'Netflix',
                    'Amazon Prime',
                    'Disney+ Hotstar',
                    'YouTube Premium'
                ]
            }
        ]
    },
    {
        id: 'family',
        title: 'Family Members',
        questions: [
            {
                id: 'members',
                type: 'repeatable',
                label: 'Add Family Member',
                fields: [
                    { id: 'name', type: 'text', label: 'Name' },
                    { id: 'age', type: 'number', label: 'Age' },
                    {
                        id: 'relation',
                        type: 'single',
                        label: 'Relation',
                        options: ['Spouse', 'Child', 'Parent', 'Other']
                    }
                ]
            }
        ]
    },
    {
        id: 'confirmation',
        title: 'Confirmation',
        questions: [
            { id: 'confirm', type: 'yesno', label: 'Are all details correct?' }
        ]
    }
];
