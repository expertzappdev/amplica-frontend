export const validateEmailStrict = (email) => {
    if (!email || typeof email !== 'string') return false;

    // 1. Basic format validation
    const basicRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!basicRegex.test(email.trim())) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1].toLowerCase();

    // 2. Block common typos for popular domains
    const commonTypos = [
        'ail.com', 'gamil.com', 'gmal.com', 'gmail.co', 'gmai.com', 'gmaill.com',
        'yaho.com', 'yahooo.com', 'yaho.co',
        'hotmal.com', 'hotmai.com', 'hotmaill.com',
        'outlok.com', 'outlook.co', 'outloo.com'
    ];

    if (commonTypos.includes(domain)) {
        return { 
            isValid: false, 
            message: `Invalid email domain. Did you mean ${getCorrectDomain(domain)}?` 
        };
    }

    // 3. Block known disposable/temp email domains
    const disposableDomains = [
        'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
        'yopmail.com', 'throwawaymail.com', 'fakemail.net', 'temp-mail.org'
    ];

    if (disposableDomains.includes(domain)) {
        return { isValid: false, message: 'Disposable email addresses are not allowed' };
    }

    // 4. Ensure no consecutive dots in domain (e.g., test@gmail..com)
    if (domain.includes('..')) {
        return { isValid: false, message: 'Invalid email domain format' };
    }

    return { isValid: true, message: '' };
};

const getCorrectDomain = (typo) => {
    if (typo.includes('gmai') || typo.includes('gmal') || typo.includes('gamil') || typo.includes('ail.com')) return 'gmail.com';
    if (typo.includes('yaho')) return 'yahoo.com';
    if (typo.includes('hotma')) return 'hotmail.com';
    if (typo.includes('outlo')) return 'outlook.com';
    return 'a valid domain';
};
