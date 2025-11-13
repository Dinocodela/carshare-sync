// Advanced email personalization engine with conditional blocks and custom tokens

interface PersonalizationContext {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    location?: string;
    role?: string;
    phone?: string;
    signup_source?: string;
    user_segment?: string;
    tags?: string[];
    login_count?: number;
    last_login_at?: string;
    account_status?: string;
    is_subscribed?: boolean;
    custom_properties?: Record<string, any>;
  };
  [key: string]: any;
}

// Replace simple variables like {{first_name}}
export const replaceVariables = (text: string, context: PersonalizationContext): string => {
  if (!text) return "";
  
  let result = text;
  
  // Flatten nested objects for easier access
  const flatContext: Record<string, any> = {
    ...context.user,
    user_id: context.user.id,
    user_email: context.user.email,
    user_first_name: context.user.first_name,
    user_last_name: context.user.last_name,
    user_full_name: `${context.user.first_name || ''} ${context.user.last_name || ''}`.trim(),
    company_name: context.user.company_name,
    location: context.user.location,
    role: context.user.role,
    phone: context.user.phone,
    signup_source: context.user.signup_source,
    user_segment: context.user.user_segment,
    tags: context.user.tags?.join(', '),
    login_count: context.user.login_count,
    last_login_at: context.user.last_login_at,
    account_status: context.user.account_status,
    is_subscribed: context.user.is_subscribed,
    // Add custom properties
    ...context.user.custom_properties,
  };
  
  // Replace all variables
  Object.entries(flatContext).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, String(value));
    }
  });
  
  return result;
};

// Evaluate conditional expressions
const evaluateCondition = (condition: string, context: PersonalizationContext): boolean => {
  try {
    // Parse condition (e.g., "role == 'host'", "login_count > 5", "tags includes 'vip'")
    const operators = ['==', '!=', '>', '<', '>=', '<=', 'includes', 'not includes'];
    
    let operator = '';
    let parts: string[] = [];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        operator = op;
        parts = condition.split(op).map(p => p.trim());
        break;
      }
    }
    
    if (!operator || parts.length !== 2) {
      return false;
    }
    
    const [leftSide, rightSide] = parts;
    
    // Get the value from context
    let leftValue: any = context.user[leftSide as keyof typeof context.user];
    
    // Handle custom properties
    if (leftValue === undefined && context.user.custom_properties) {
      leftValue = context.user.custom_properties[leftSide];
    }
    
    // Parse right side (remove quotes if string literal)
    let rightValue: any = rightSide.replace(/^['"]|['"]$/g, '');
    
    // Try to parse as number
    if (!isNaN(Number(rightValue))) {
      rightValue = Number(rightValue);
    }
    
    // Try to parse as boolean
    if (rightValue === 'true') rightValue = true;
    if (rightValue === 'false') rightValue = false;
    
    // Evaluate based on operator
    switch (operator) {
      case '==':
        return leftValue == rightValue;
      case '!=':
        return leftValue != rightValue;
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      case 'includes':
        if (Array.isArray(leftValue)) {
          return leftValue.includes(rightValue);
        }
        if (typeof leftValue === 'string') {
          return leftValue.includes(rightValue);
        }
        return false;
      case 'not includes':
        if (Array.isArray(leftValue)) {
          return !leftValue.includes(rightValue);
        }
        if (typeof leftValue === 'string') {
          return !leftValue.includes(rightValue);
        }
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
};

// Process conditional blocks like {{#if role == 'host'}}...{{/if}}
export const processConditionalBlocks = (text: string, context: PersonalizationContext): string => {
  if (!text) return "";
  
  let result = text;
  
  // Match {{#if condition}}content{{/if}} blocks
  const ifBlockRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
  
  result = result.replace(ifBlockRegex, (match, condition, content) => {
    const shouldShow = evaluateCondition(condition.trim(), context);
    return shouldShow ? content : '';
  });
  
  // Match {{#unless condition}}content{{/unless}} blocks (opposite of if)
  const unlessBlockRegex = /{{#unless\s+([^}]+)}}([\s\S]*?){{\/unless}}/g;
  
  result = result.replace(unlessBlockRegex, (match, condition, content) => {
    const shouldShow = !evaluateCondition(condition.trim(), context);
    return shouldShow ? content : '';
  });
  
  return result;
};

// Main personalization function
export const personalizeEmailContent = (
  content: string,
  context: PersonalizationContext
): string => {
  // First process conditional blocks
  let result = processConditionalBlocks(content, context);
  
  // Then replace variables
  result = replaceVariables(result, context);
  
  return result;
};

// Available personalization tokens for UI
export const PERSONALIZATION_TOKENS = {
  'User Info': [
    { token: '{{user_first_name}}', description: "User's first name" },
    { token: '{{user_last_name}}', description: "User's last name" },
    { token: '{{user_full_name}}', description: "User's full name" },
    { token: '{{user_email}}', description: "User's email address" },
  ],
  'Company Info': [
    { token: '{{company_name}}', description: 'Company name' },
    { token: '{{location}}', description: 'User location' },
    { token: '{{phone}}', description: 'Phone number' },
  ],
  'Account Info': [
    { token: '{{role}}', description: "User role (e.g., 'host', 'client')" },
    { token: '{{account_status}}', description: 'Account status' },
    { token: '{{is_subscribed}}', description: 'Subscription status' },
  ],
  'Signup & Source': [
    { token: '{{signup_source}}', description: "How user signed up (e.g., 'organic', 'referral')" },
    { token: '{{user_segment}}', description: "User segment (e.g., 'power_user', 'new_user')" },
    { token: '{{tags}}', description: 'User tags (comma-separated)' },
  ],
  'Behavior Data': [
    { token: '{{login_count}}', description: 'Number of times user logged in' },
    { token: '{{last_login_at}}', description: 'Last login timestamp' },
  ],
};

export const CONDITIONAL_EXAMPLES = [
  {
    title: 'Show content for hosts only',
    code: '{{#if role == \'host\'}}\nThis message is for hosts!\n{{/if}}',
  },
  {
    title: 'Show content for new users',
    code: '{{#if login_count < 5}}\nWelcome! You\'re new here.\n{{/if}}',
  },
  {
    title: 'Show content for VIP users',
    code: '{{#if tags includes \'vip\'}}\nExclusive VIP content here!\n{{/if}}',
  },
  {
    title: 'Show content for unsubscribed users',
    code: '{{#unless is_subscribed}}\nUpgrade to premium today!\n{{/unless}}',
  },
  {
    title: 'Show based on user segment',
    code: '{{#if user_segment == \'power_user\'}}\nAdvanced features for you!\n{{/if}}',
  },
];
